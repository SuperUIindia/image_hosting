/**
 * Build a full image URL from a base URL and relative path.
 * Normalizes trailing slashes and avoids duplicate slashes.
 *
 * @param {string} baseUrl - The base URL from VITE_IMAGE_BASE_URL
 * @param {string} relativePath - The stored image path (e.g. "/uploads/portfolio/img.webp")
 * @returns {string} The complete image URL
 */
export function buildImageUrl(baseUrl, relativePath) {
  if (!baseUrl) return relativePath;
  if (!relativePath) return baseUrl;

  // Normalize base URL: remove trailing slashes
  const normalizedBase = baseUrl.replace(/\/+$/, '');

  // Normalize relative path: ensure leading slash, remove duplicate slashes
  let normalizedPath = relativePath;
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  // Remove duplicate slashes within the path (but preserve protocol://)
  normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');

  return normalizedBase + normalizedPath;
}

export default buildImageUrl;