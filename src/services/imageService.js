/**
 * Image service - handles upload, metadata generation, and storage.
 * Uses localStorage for persistence in the local preview version.
 * For production, replace with Cloudflare R2 or backend API.
 */

import { validateImage, ALLOWED_TYPES, MAX_FILE_SIZE } from '../utils/validateImage';

const STORAGE_KEY = 'image-url-generator-images';

/**
 * Default upload folders - 5 predefined categories
 */
export const DEFAULT_FOLDERS = [
  { id: 'portfolio', name: 'Portfolio', description: 'Portfolio images' },
  { id: 'products', name: 'Products', description: 'Product images' },
  { id: 'blog', name: 'Blog', description: 'Blog post images' },
  { id: 'assets', name: 'Assets', description: 'Brand & UI assets' },
  { id: 'uploads', name: 'General', description: 'General uploads' }
];

/**
 * Generate a unique stored filename to avoid collisions.
 * @param {string} originalName
 * @returns {string}
 */
function generateStoredName(originalName) {
  const ext = '.' + originalName.split('.').pop().toLowerCase();
  const base = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${random}${ext}`;
}

/**
 * Read image dimensions from a File object.
 * @param {File} file
 * @returns {Promise<{width: number, height: number}>}
 */
function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image dimensions'));
    };

    img.src = url;
  });
}

/**
 * Load all stored image records from localStorage.
 * @returns {Array}
 */
export function loadImages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load images from storage:', e);
    return [];
  }
}

/**
 * Save all image records to localStorage.
 * @param {Array} images
 */
export function saveImages(images) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save images to storage:', e);
  }
}

/**
 * Upload one or more image files to a specific folder.
 * Creates image records with metadata and stores the file as a data URL for preview.
 * @param {File[]} files
 * @param {string} folderId - Folder ID (e.g. 'portfolio', 'products')
 * @param {object} options
 * @returns {Promise<{success: Array, failed: Array}>}
 */
export async function uploadImages(files, folderId = 'uploads', options = {}) {
  const result = { success: [], failed: [] };

  for (const file of files) {
    try {
      // Validate
      const validation = validateImage(file, {
        maxSize: options.maxSize ?? MAX_FILE_SIZE,
        allowedTypes: options.allowedTypes ?? ALLOWED_TYPES
      });

      if (validation.error) {
        result.failed.push({ file, error: validation.error });
        continue;
      }

      // Read dimensions
      const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));

      // Generate unique stored name and path
      const storedName = generateStoredName(file.name);
      const relativePath = `/uploads/${folderId}/${storedName}`;

      // Create data URL for preview (local storage version)
      const dataUrl = await fileToDataUrl(file);

      const record = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        originalName: file.name,
        storedName,
        folderId,
        relativePath,
        publicUrl: '', // Will be filled by URL builder
        mimeType: file.type,
        sizeBytes: file.size,
        width: dims.width,
        height: dims.height,
        createdAt: new Date().toISOString(),
        dataUrl // For local preview
      };

      result.success.push(record);
    } catch (e) {
      result.failed.push({ file, error: e.message || 'Upload failed' });
    }
  }

  return result;
}

/**
 * Convert a File to a data URL string.
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Delete an image record by ID.
 * @param {string} id
 */
export function deleteImage(id) {
  const images = loadImages();
  const filtered = images.filter(img => img.id !== id);
  saveImages(filtered);
  return filtered;
}

/**
 * Clear all images.
 */
export function clearAllImages() {
  saveImages([]);
}

/**
 * Update image records (after URL regeneration, etc.)
 * @param {Array} images
 */
export function updateImages(images) {
  saveImages(images);
}

export default {
  uploadImages,
  loadImages,
  saveImages,
  deleteImage,
  clearAllImages,
  updateImages,
  DEFAULT_FOLDERS
};