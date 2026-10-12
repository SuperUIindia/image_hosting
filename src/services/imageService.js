/**
 * Image service — handles upload, metadata, and storage.
 *
 * Upload strategy:
 *   1. POST to /api/upload/:folderId  →  file saved to public/uploads/[folder]/
 *   2. If API unavailable (production), fall back to localStorage dataURL
 *
 * After local uploads, commit public/uploads/ to git and push to Vercel
 * so images appear at the production URL automatically.
 */

import { validateImage, ALLOWED_TYPES, MAX_FILE_SIZE } from '../utils/validateImage';

const STORAGE_KEY = 'image-url-generator-images';

/** Predefined upload folders */
export const DEFAULT_FOLDERS = [
  { id: 'portfolio', name: 'Portfolio', icon: '🖼️',  description: 'Portfolio images' },
  { id: 'products',  name: 'Products',  icon: '🛒',  description: 'Product images'   },
  { id: 'blog',      name: 'Blog',      icon: '📝',  description: 'Blog post images'  },
  { id: 'assets',    name: 'Assets',    icon: '🎨',  description: 'Brand & UI assets' },
  { id: 'uploads',   name: 'General',   icon: '📁',  description: 'General uploads'   }
];

/* ─── localStorage helpers ─────────────────────────────────── */

export function loadImages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load images:', e);
    return [];
  }
}

export function saveImages(images) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save images:', e);
  }
}

/* ─── Dimension reader ──────────────────────────────────────── */

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read dimensions')); };
    img.src = url;
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/* ─── Check if local upload API is available ───────────────── */

let _apiAvailable = null; // cached check
async function isApiAvailable() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(1500) });
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

/* ─── Main upload function ──────────────────────────────────── */

/**
 * Upload files to a folder.
 * Tries local API first (saves to public/uploads/[folderId]/),
 * falls back to localStorage dataURL if API is not running.
 *
 * @param {File[]} files
 * @param {string} folderId
 * @param {object} options
 * @returns {Promise<{ success: object[], failed: object[], usedApi: boolean }>}
 */
export async function uploadImages(files, folderId = 'uploads', options = {}) {
  const result = { success: [], failed: [], usedApi: false };
  const apiUp = await isApiAvailable();

  /* ── Strategy 1: Local file-system via upload API ── */
  if (apiUp) {
    const formData = new FormData();
    const validFiles = [];

    for (const file of files) {
      const v = validateImage(file, {
        maxSize: options.maxSize ?? MAX_FILE_SIZE,
        allowedTypes: options.allowedTypes ?? ALLOWED_TYPES
      });
      if (v.error) {
        result.failed.push({ file, error: v.error });
      } else {
        formData.append('files', file);
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      try {
        const res = await fetch(`/api/upload/${folderId}`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success && data.files) {
          for (let i = 0; i < data.files.length; i++) {
            const apiFile = data.files[i];
            const file = validFiles[i];
            const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));

            result.success.push({
              id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              originalName: file.name,
              customName: null,
              storedName: apiFile.storedName,
              folderId,
              relativePath: apiFile.relativePath,
              publicUrl: '',
              mimeType: apiFile.mimeType,
              sizeBytes: apiFile.sizeBytes,
              width: dims.width,
              height: dims.height,
              createdAt: new Date().toISOString(),
              savedToDisk: true,
              dataUrl: null   // not needed — file is on disk
            });
          }
          result.usedApi = true;
          return result;
        }
      } catch (e) {
        console.warn('API upload failed, falling back to localStorage:', e.message);
        _apiAvailable = false;
      }
    } else {
      return result; // all failed validation
    }
  }

  /* ── Strategy 2: dataURL in localStorage (fallback) ── */
  for (const file of files) {
    try {
      const v = validateImage(file, {
        maxSize: options.maxSize ?? MAX_FILE_SIZE,
        allowedTypes: options.allowedTypes ?? ALLOWED_TYPES
      });
      if (v.error) { result.failed.push({ file, error: v.error }); continue; }

      const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
      const dataUrl = await fileToDataUrl(file);
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
      const storedName = `${base}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

      result.success.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        originalName: file.name,
        customName: null,
        storedName,
        folderId,
        relativePath: `/uploads/${folderId}/${storedName}`,
        publicUrl: '',
        mimeType: file.type,
        sizeBytes: file.size,
        width: dims.width,
        height: dims.height,
        createdAt: new Date().toISOString(),
        savedToDisk: false,
        dataUrl
      });
    } catch (e) {
      result.failed.push({ file, error: e.message || 'Upload failed' });
    }
  }

  return result;
}

/* ─── CRUD helpers ──────────────────────────────────────────── */

export function deleteImage(id) {
  const images = loadImages();
  const img = images.find(i => i.id === id);
  // Fire-and-forget API delete if the file was saved to disk
  if (img?.savedToDisk && img.relativePath) {
    const parts = img.relativePath.replace(/^\//, '').split('/'); // uploads/folder/file
    if (parts.length === 3) {
      fetch(`/api/upload/${parts[1]}/${parts[2]}`, { method: 'DELETE' }).catch(() => {});
    }
  }
  const filtered = images.filter(i => i.id !== id);
  saveImages(filtered);
  return filtered;
}

export function clearAllImages() {
  saveImages([]);
}

export function updateImages(images) {
  saveImages(images);
}

/**
 * Update metadata on a single image (name, path/redirect slug).
 */
export function updateImageMeta(id, patch) {
  const images = loadImages();
  const updated = images.map((img) => {
    if (img.id !== id) return img;
    const next = { ...img, ...patch };
    if ('customPath' in patch) {
      const slug = patch.customPath
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._\-/]/g, '');
      next.relativePath = slug.startsWith('/') ? slug : `/uploads/${img.folderId}/${slug}`;
      next.customPath = next.relativePath;
    }
    return next;
  });
  saveImages(updated);
  return updated;
}

export default {
  uploadImages,
  loadImages,
  saveImages,
  deleteImage,
  clearAllImages,
  updateImages,
  updateImageMeta,
  DEFAULT_FOLDERS
};