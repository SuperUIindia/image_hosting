import React, { useState } from 'react';

/**
 * ImageCard - displays a single uploaded image with preview, metadata, and actions.
 * @param {object} props
 * @param {object} props.image - Image record
 * @param {string} props.baseUrl - Base URL for generating full URLs
 * @param {function} props.onDelete - Callback when delete is clicked
 * @param {function} props.onCopy - Callback when URL/path is copied
 */
export default function ImageCard({ image, baseUrl, onDelete, onCopy }) {
  const [copied, setCopied] = useState(null); // 'url' | 'path' | null

  // Build the full URL
  const fullUrl = baseUrl
    ? baseUrl.replace(/\/+$/, '') + image.relativePath
    : image.relativePath;

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      onCopy?.(text, type);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card-hover bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Preview */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        <img
          src={image.dataUrl || image.publicUrl}
          alt={image.originalName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {image.mimeType.split('/')[1].toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Filename */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate" title={image.originalName}>
          {image.originalName}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2" title={image.storedName}>
          Stored as: {image.storedName}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
          <div>
            <span className="font-medium">Dimensions:</span>{' '}
            {image.width}×{image.height}
          </div>
          <div>
            <span className="font-medium">Size:</span>{' '}
            {formatSize(image.sizeBytes)}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Uploaded:</span>{' '}
            {formatDate(image.createdAt)}
          </div>
        </div>

        {/* Relative Path */}
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Relative Path
          </label>
          <div className="flex items-center gap-1">
            <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded truncate">
              {image.relativePath}
            </code>
            <button
              onClick={() => handleCopy(image.relativePath, 'path')}
              className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
              title="Copy path"
            >
              {copied === 'path' ? '✓' : '⧉'}
            </button>
          </div>
        </div>

        {/* Full URL */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Full Image URL
          </label>
          <div className="flex items-center gap-1">
            <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded truncate">
              {fullUrl}
            </code>
            <button
              onClick={() => handleCopy(fullUrl, 'url')}
              className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition"
              title="Copy URL"
            >
              {copied === 'url' ? '✓' : '⧉'}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <a
            href={image.dataUrl || fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
          >
            Open
          </a>
          <button
            onClick={() => onDelete(image.id)}
            className="flex-1 text-center text-sm px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}