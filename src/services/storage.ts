import { PortalConfig, PaymentSubmission } from '../types';
import { DEFAULT_PORTAL, INITIAL_PORTALS } from './defaultData';

const DB_NAME = 'BanglaQRPay_DB';
const DB_VERSION = 1;
const STORE_PORTALS = 'portals';
const STORE_MEDIA = 'media_blobs';
const STORE_SUBMISSIONS = 'submissions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PORTALS)) {
        db.createObjectStore(STORE_PORTALS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA);
      }
      if (!db.objectStoreNames.contains(STORE_SUBMISSIONS)) {
        db.createObjectStore(STORE_SUBMISSIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Media cache in memory to provide fast object URLs or data URLs
const objectUrlCache = new Map<string, string>();

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        resolve(URL.createObjectURL(blob));
      }
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(blob));
    };
    reader.readAsDataURL(blob);
  });
}

export async function saveMediaBlob(key: string, blobOrFile: Blob | File | string): Promise<string> {
  // If it's already a URL or string
  if (typeof blobOrFile === 'string') {
    objectUrlCache.set(key, blobOrFile);
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put(blobOrFile, key);
      req.onsuccess = () => resolve(blobOrFile);
      req.onerror = () => reject(req.error);
    });
  }

  // Ensure video blobs have explicit video/mp4 MIME type to prevent browser demuxer freeze
  let processedBlob = blobOrFile;
  if (key.startsWith('video_') && (!blobOrFile.type || blobOrFile.type === 'application/octet-stream')) {
    processedBlob = new Blob([blobOrFile], { type: 'video/mp4' });
  }

  // For small and medium videos (< 25MB), Base64 Data URLs eliminate browser HTTP 206 range issues completely
  if (processedBlob.size <= 25 * 1024 * 1024) {
    try {
      const dataUrl = await blobToDataURL(processedBlob);
      objectUrlCache.set(key, dataUrl);
      const db = await openDatabase();
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      store.put(dataUrl, key);
      return dataUrl;
    } catch {
      // Fallback to object URL if data URL fails
    }
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const req = store.put(processedBlob, key);

    req.onsuccess = () => {
      const url = URL.createObjectURL(processedBlob);
      objectUrlCache.set(key, url);
      resolve(url);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getMediaUrl(key: string): Promise<string | null> {
  if (objectUrlCache.has(key)) {
    return objectUrlCache.get(key)!;
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const store = tx.objectStore(STORE_MEDIA);
    const req = store.get(key);

    req.onsuccess = async () => {
      const result = req.result;
      if (!result) {
        resolve(null);
        return;
      }
      if (typeof result === 'string') {
        objectUrlCache.set(key, result);
        resolve(result);
        return;
      }
      const rawBlob = result as Blob;
      let finalBlob = rawBlob;
      if (key.startsWith('video_') && (!rawBlob.type || rawBlob.type === 'application/octet-stream')) {
        finalBlob = new Blob([rawBlob], { type: 'video/mp4' });
      }

      if (finalBlob.size <= 20 * 1024 * 1024) {
        try {
          const dataUrl = await blobToDataURL(finalBlob);
          objectUrlCache.set(key, dataUrl);
          resolve(dataUrl);
          return;
        } catch {
          // ignore
        }
      }

      const url = URL.createObjectURL(finalBlob);
      objectUrlCache.set(key, url);
      resolve(url);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllPortals(): Promise<PortalConfig[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PORTALS, 'readonly');
    const store = tx.objectStore(STORE_PORTALS);
    const req = store.getAll();

    req.onsuccess = async () => {
      let list = req.result as PortalConfig[];
      if (!list || list.length === 0) {
        // Initialize with default portals
        for (const p of INITIAL_PORTALS) {
          await savePortal(p);
        }
        resolve(INITIAL_PORTALS);
      } else {
        // Automatically upgrade any portal still having MR. FARDIN to LEGENDS OF FIRE & set Asif4545 passcode
        for (const p of list) {
          let updated = false;
          if (p.name === 'MR. FARDIN' || p.id === 'fardin-portal') {
            p.name = 'LEGENDS OF FIRE';
            p.subName = 'ESPORTS OFFICIAL PORTAL';
            p.footerBrand = 'LEGENDS OF FIRE';
            p.footerPoweredBy = 'LEGENDS OF FIRE';
            updated = true;
          }
          if (!p.adminPasscode) {
            p.adminPasscode = 'Asif4545';
            updated = true;
          }
          if (p.qrZoom === undefined) {
            p.qrZoom = 100;
            updated = true;
          }
          if (p.qrPanX === undefined) {
            p.qrPanX = 0;
            updated = true;
          }
          if (p.qrPanY === undefined) {
            p.qrPanY = 0;
            updated = true;
          }
          if (updated) {
            await savePortal(p);
          }
        }

        // If list has items, rehydrate persistent media blobs (video, qr, logo) with fresh valid object URLs
        for (const p of list) {
          try {
            const freshVideoUrl = await getMediaUrl(`video_${p.id}`);
            if (freshVideoUrl) {
              p.videoUrl = freshVideoUrl;
            }
            const freshQrUrl = await getMediaUrl(`qr_${p.id}`);
            if (freshQrUrl) {
              p.qrImageUrl = freshQrUrl;
            }
            const freshLogoUrl = await getMediaUrl(`logo_${p.id}`);
            p.logoUrl = freshLogoUrl || p.logoUrl || '/logo.png';
          } catch (e) {
            console.error('Error rehydrating media:', e);
            if (!p.logoUrl) p.logoUrl = '/logo.png';
          }
        }

        resolve(list);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getPortalBySlug(slug: string): Promise<PortalConfig | null> {
  const portals = await getAllPortals();
  const found = portals.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );
  return found || null;
}

export async function savePortal(portal: PortalConfig): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PORTALS, 'readwrite');
    const store = tx.objectStore(STORE_PORTALS);
    const req = store.put({
      ...portal,
      updatedAt: Date.now(),
    });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deletePortal(portalId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([STORE_PORTALS, STORE_MEDIA], 'readwrite');
      const portalsStore = tx.objectStore(STORE_PORTALS);
      const mediaStore = tx.objectStore(STORE_MEDIA);

      portalsStore.delete(portalId);
      mediaStore.delete(`video_${portalId}`);
      mediaStore.delete(`qr_${portalId}`);
      mediaStore.delete(`logo_${portalId}`);

      objectUrlCache.delete(`video_${portalId}`);
      objectUrlCache.delete(`qr_${portalId}`);
      objectUrlCache.delete(`logo_${portalId}`);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch {
      const tx = db.transaction(STORE_PORTALS, 'readwrite');
      const store = tx.objectStore(STORE_PORTALS);
      const req = store.delete(portalId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }
  });
}

export async function saveSubmission(sub: PaymentSubmission): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SUBMISSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SUBMISSIONS);
    const req = store.put(sub);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSubmissions(portalId?: string): Promise<PaymentSubmission[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SUBMISSIONS, 'readonly');
    const store = tx.objectStore(STORE_SUBMISSIONS);
    const req = store.getAll();

    req.onsuccess = () => {
      let results = req.result as PaymentSubmission[];
      if (portalId) {
        results = results.filter((s) => s.portalId === portalId);
      }
      results.sort((a, b) => b.createdAt - a.createdAt);
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updateSubmissionStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SUBMISSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SUBMISSIONS);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result as PaymentSubmission | undefined;
      if (item) {
        item.status = status;
        store.put(item);
        resolve();
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
