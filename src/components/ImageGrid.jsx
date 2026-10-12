import React from 'react';
import ImageCard from './ImageCard';

/**
 * ImageGrid - responsive grid of image cards.
 * @param {object} props
 * @param {Array} props.images - Array of image records
 * @param {string} props.baseUrl - Base URL
 * @param {function} props.onDelete - Delete callback
 * @param {function} props.onCopy - Copy callback
 */
export default function ImageGrid({ images, baseUrl, onDelete, onCopy }) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No images uploaded yet
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Upload images to generate live URLs
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        grid gap-4
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      `}
    >
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          baseUrl={baseUrl}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}