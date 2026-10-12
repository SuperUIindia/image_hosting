import React from 'react';
import ImageCard from './ImageCard';

export default function ImageGrid({ images, baseUrl, onDelete, onCopy, onUpdate }) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-5 border border-gray-200 dark:border-gray-700">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No images yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
          Upload images using the area above — they'll be saved to <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">public/uploads/</code> and served as static files.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          baseUrl={baseUrl}
          onDelete={onDelete}
          onCopy={onCopy}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}