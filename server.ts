import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for uploaded videos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const uniqueName = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // up to 200MB videos
});

app.use(express.json());

// API route to upload video directly from device
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
  });
});

// API route to upload logo directly from device
app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No logo file provided' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
  });
});

// API route to upload QR directly from device
app.post('/api/upload-qr', upload.single('qr'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No QR file provided' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
  });
});

// Robust HTTP 206 Byte-Range streaming for videos (eliminates 3-5 second mobile freezing!)
app.get('/api/stream-video/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    // Check in public root
    const fallbackPath = path.join(__dirname, 'public', req.params.filename);
    if (!fs.existsSync(fallbackPath)) {
      return res.status(404).send('Video not found');
    }
    return streamFile(fallbackPath, req, res);
  }
  streamFile(filePath, req, res);
});

function streamFile(filePath: string, req: express.Request, res: express.Response) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}

// Serve public static files with range request support
app.use(express.static(path.join(__dirname, 'public'), {
  acceptRanges: true,
}));

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    // Provide clean, silent @vite/client mock to completely prevent "WebSocket closed without opened" errors in Cloud Run
    app.get('/@vite/client', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(`
export const createHotContext = () => ({
  accept: () => {},
  dispose: () => {},
  prune: () => {},
  decline: () => {},
  invalidate: () => {},
  on: () => {},
  off: () => {},
  send: () => {},
});
export const injectQuery = (url, query) => url + (url.includes('?') ? '&' : '?') + query;
export const updateStyle = (id, content) => {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = content;
};
export const removeStyle = (id) => {
  const style = document.getElementById(id);
  if (style) style.remove();
};
export const ErrorOverlay = class extends HTMLElement {};
if (typeof customElements !== 'undefined' && !customElements.get('vite-error-overlay')) {
  customElements.define('vite-error-overlay', ErrorOverlay);
}
`);
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
