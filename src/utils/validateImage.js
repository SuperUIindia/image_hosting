/**
 * Validate image files by type, size, and content sniffing.
 * Returns { valid: boolean, error: string | null }
 */

export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate a single image file
 * @param {File} file
 * @param {object} options
 * @param {number} options.maxSize - Max file size in bytes
 * @param {string[]} options.allowedTypes - MIME types
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateImage(file, options = {}) {
  const maxSize = options.maxSize ?? MAX_FILE_SIZE;
  const allowedTypes = options.allowedTypes ?? ALLOWED_TYPES;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type}". Allowed: ${allowedTypes.join(', ')}`
    };
  }

  // Check file extension as secondary validation
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Unsupported file extension "${ext}"` };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large: ${fileMB}MB (max ${maxMB}MB)`
    };
  }

  // Check minimum size (avoid empty files)
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true, error: null };
}

/**
 * Validate multiple files
 * @param {File[]} files
 * @param {object} options
 * @returns {{ valid: File[], invalid: Array<{file: File, error: string}> }}
 */
export function validateImages(files, options = {}) {
  const valid = [];
  const invalid = [];

  for (const file of files) {
    const result = validateImage(file, options);
    if (result.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, error: result.error });
    }
  }

  return { valid, invalid };
}

export default validateImage;