/**
 * Local upload server for development.
 * Saves images to public/uploads/[folderId]/ so Vite serves them as static files.
 * After uploading, commit public/uploads/ to git and push to Vercel for production URLs.
 */
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const ALLOWED_FOLDERS = ['portfolio', 'products', 'blog', 'assets', 'uploads'];
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

// Dynamic Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderId = ALLOWED_FOLDERS.includes(req.params.folderId)
      ? req.params.folderId
      : 'uploads';
    const dir = path.join(__dirname, 'public', 'uploads', folderId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
      .substring(0, 40);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${base}-${timestamp}-${random}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported type: ${file.mimetype}`));
    }
  }
});

// POST /api/upload/:folderId
app.post('/api/upload/:folderId', (req, res) => {
  const folderId = ALLOWED_FOLDERS.includes(req.params.folderId)
    ? req.params.folderId
    : 'uploads';

  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploaded = req.files.map((f) => ({
      storedName: f.filename,
      relativePath: `/uploads/${folderId}/${f.filename}`,
      mimeType: f.mimetype,
      sizeBytes: f.size,
      originalName: f.originalname
    }));

    res.json({ success: true, files: uploaded });
  });
});

// DELETE /api/upload/:folderId/:filename
app.delete('/api/upload/:folderId/:filename', (req, res) => {
  const { folderId, filename } = req.params;
  if (!ALLOWED_FOLDERS.includes(folderId)) {
    return res.status(400).json({ success: false, error: 'Invalid folder' });
  }
  // Sanitize filename to prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(__dirname, 'public', 'uploads', folderId, safe);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'File not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n  🖼️  Upload server → http://localhost:${PORT}`);
  console.log(`  Files saved to: public/uploads/[folder]/\n`);
});

