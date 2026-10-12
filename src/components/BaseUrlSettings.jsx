import React, { useState, useEffect } from 'react';

/**
 * BaseUrlSettings - displays and edits the base URL configuration.
 * Reads from import.meta.env.VITE_IMAGE_BASE_URL at build time.
 * @param {object} props
 * @param {function} props.onBaseUrlChange - Callback when base URL changes
 */
export default function BaseUrlSettings({ onBaseUrlChange }) {
  const [baseUrl, setBaseUrl] = useState('');

  // Load from environment variable on mount
  useEffect(() => {
    const envUrl = import.meta.env.VITE_IMAGE_BASE_URL || '';
    setBaseUrl(envUrl);
    onBaseUrlChange?.(envUrl);
  }, [onBaseUrlChange]);

  const handleChange = (e) => {
    const value = e.target.value;
    setBaseUrl(value);
    onBaseUrlChange?.(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Image Base URL
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          From VITE_IMAGE_BASE_URL
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={baseUrl}
          onChange={handleChange}
          placeholder="https://your-image-domain.com"
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Set in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env</code> as{' '}
        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_IMAGE_BASE_URL</code>.
        Rebuild after changing.
      </p>
    </div>
  );
}