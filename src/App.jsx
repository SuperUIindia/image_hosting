import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageGrid from './components/ImageGrid';
import SearchBar from './components/SearchBar';
import BaseUrlSettings from './components/BaseUrlSettings';
import {
  uploadImages,
  loadImages,
  saveImages,
  deleteImage,
  DEFAULT_FOLDERS
} from './services/imageService';

/**
 * App - root component for the Image URL Generator.
 */
export default function App() {
  const [images, setImages] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [activeFolder, setActiveFolder] = useState('uploads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [toast, setToast] = useState(null); // { message, type }

  // Load persisted images on mount
  useEffect(() => {
    setImages(loadImages());
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle file uploads
  const handleUpload = useCallback(async (files) => {
    const result = await uploadImages(files, activeFolder);

    if (result.success.length > 0) {
      const updated = [...loadImages(), ...result.success];
      saveImages(updated);
      setImages(updated);
      showToast(`✓ Uploaded ${result.success.length} image${result.success.length > 1 ? 's' : ''}`);
    }

    if (result.failed.length > 0) {
      result.failed.forEach(({ file, error }) => {
        showToast(`✗ ${file.name}: ${error}`, 'error');
      });
    }
  }, [activeFolder]);

  // Delete an image
  const handleDelete = useCallback((id) => {
    const updated = deleteImage(id);
    setImages(updated);
    showToast('Image deleted', 'info');
  }, []);

  // Copy callback
  const handleCopy = useCallback((text, type) => {
    showToast(`${type === 'url' ? 'URL' : 'Path'} copied!`);
  }, []);

  // Clear all images
  const handleClearAll = () => {
    if (window.confirm('Delete all images? This cannot be undone.')) {
      saveImages([]);
      setImages([]);
      showToast('All images cleared', 'info');
    }
  };

  // Filter and sort images
  const displayedImages = images
    .filter((img) => {
      const matchesFolder = activeFolder === 'all' || img.folderId === activeFolder;
      const matchesSearch = !searchTerm ||
        img.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.storedName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' ||
        img.mimeType.includes(filterType);
      return matchesFolder && matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === 'name') return a.originalName.localeCompare(b.originalName);
      return 0;
    });

  const folderCount = (folderId) =>
    images.filter((img) => img.folderId === folderId).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🖼️ Image URL Generator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload images, get live URLs for use anywhere
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {images.length} image{images.length !== 1 ? 's' : ''} stored
            </span>
            {images.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Base URL Settings */}
        <BaseUrlSettings onBaseUrlChange={setBaseUrl} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folders */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Folders
              </h2>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveFolder('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex justify-between items-center ${
                      activeFolder === 'all'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>All Images</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                      {images.length}
                    </span>
                  </button>
                </li>
                {DEFAULT_FOLDERS.map((folder) => (
                  <li key={folder.id}>
                    <button
                      onClick={() => setActiveFolder(folder.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex justify-between items-center ${
                        activeFolder === folder.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{folder.name}</span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                        {folderCount(folder.id)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Upload area */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Uploading to: <strong className="text-gray-700 dark:text-gray-300">
                  {activeFolder === 'all'
                    ? 'General'
                    : DEFAULT_FOLDERS.find(f => f.id === activeFolder)?.name || activeFolder}
                </strong>
              </p>
              <ImageUploader onUpload={handleUpload} />
            </div>

            {/* Search & Filter */}
            {images.length > 0 && (
              <SearchBar
                onSearch={setSearchTerm}
                onFilter={setFilterType}
                onSort={setSortOrder}
              />
            )}

            {/* Image Grid */}
            <ImageGrid
              images={displayedImages}
              baseUrl={baseUrl}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`toast fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'info'
              ? 'bg-gray-700'
              : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

