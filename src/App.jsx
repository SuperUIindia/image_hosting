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
  updateImageMeta,
  DEFAULT_FOLDERS
} from './services/imageService';

export default function App() {
  const [images, setImages]           = useState([]);
  const [baseUrl, setBaseUrl]         = useState('');
  const [activeFolder, setActiveFolder] = useState('uploads');
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [sortOrder, setSortOrder]     = useState('newest');
  const [toast, setToast]             = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { setImages(loadImages()); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = useCallback(async (files) => {
    const result = await uploadImages(files, activeFolder === 'all' ? 'uploads' : activeFolder);

    if (result.success.length > 0) {
      const updated = [...loadImages(), ...result.success];
      saveImages(updated);
      setImages(updated);
      const loc = result.usedApi ? '💾 saved to disk' : '⚠️ stored locally (start dev server to save to disk)';
      showToast(`✓ Uploaded ${result.success.length} image${result.success.length > 1 ? 's' : ''} — ${loc}`);
    }
    result.failed.forEach(({ file, error }) =>
      showToast(`✗ ${file.name}: ${error}`, 'error')
    );
  }, [activeFolder]);

  const handleDelete = useCallback((id) => {
    const updated = deleteImage(id);
    setImages(updated);
    showToast('Image deleted', 'info');
  }, []);

  const handleUpdate = useCallback((id, patch) => {
    const updated = updateImageMeta(id, patch);
    setImages(updated);
    if ('customName' in patch) showToast('Name updated ✓');
    if ('customPath' in patch) showToast('Path updated ✓');
  }, []);

  const handleCopy = useCallback((text, type) => {
    showToast(`${type === 'url' ? 'URL' : 'Path'} copied!`);
  }, []);

  const handleClearAll = () => {
    if (!window.confirm('Delete all images? This cannot be undone.')) return;
    saveImages([]);
    setImages([]);
    showToast('All images cleared', 'info');
  };

  const displayedImages = images
    .filter(img => {
      const inFolder  = activeFolder === 'all' || img.folderId === activeFolder;
      const inSearch  = !searchTerm  || img.originalName.toLowerCase().includes(searchTerm.toLowerCase()) || (img.customName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const inFilter  = filterType  === 'all' || img.mimeType.includes(filterType);
      return inFolder && inSearch && inFilter;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return (a.customName || a.originalName).localeCompare(b.customName || b.originalName);
    });

  const folderCount = id => images.filter(img => img.folderId === id).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* ═══ HEADER ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition lg:hidden"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                <span className="text-lg">🖼️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">ImgStore</h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">Image URL Generator</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {images.length} image{images.length !== 1 ? 's' : ''}
            </span>
            {images.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-medium px-3 py-1.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* Base URL */}
        <BaseUrlSettings onBaseUrlChange={setBaseUrl} />

        <div className="flex gap-6">

          {/* ═══ SIDEBAR ═══════════════════════════════════════ */}
          <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col w-56 shrink-0 gap-2`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-2">Folders</p>

              {/* All */}
              <FolderBtn
                label="All Images"
                icon="🗂️"
                count={images.length}
                active={activeFolder === 'all'}
                onClick={() => setActiveFolder('all')}
              />

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

              {DEFAULT_FOLDERS.map(f => (
                <FolderBtn
                  key={f.id}
                  label={f.name}
                  icon={f.icon}
                  count={folderCount(f.id)}
                  active={activeFolder === f.id}
                  onClick={() => setActiveFolder(f.id)}
                />
              ))}
            </div>

            {/* Upload hint */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <p className="text-xs font-semibold mb-1">Pro tip</p>
              <p className="text-[11px] opacity-80 leading-relaxed">
                After uploading, commit&nbsp;<code className="bg-white/20 px-1 rounded">public/uploads/</code> and push to Vercel for live URLs.
              </p>
            </div>
          </aside>

          {/* ═══ MAIN CONTENT ══════════════════════════════════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Upload target label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Uploading to</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                  {activeFolder === 'all'
                    ? <><span>🗂️</span> General</>
                    : <><span>{DEFAULT_FOLDERS.find(f => f.id === activeFolder)?.icon}</span>{DEFAULT_FOLDERS.find(f => f.id === activeFolder)?.name}</>}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {displayedImages.length} shown
              </span>
            </div>

            {/* Uploader */}
            <ImageUploader onUpload={handleUpload} />

            {/* Search */}
            {images.length > 0 && (
              <SearchBar
                onSearch={setSearchTerm}
                onFilter={setFilterType}
                onSort={setSortOrder}
              />
            )}

            {/* Grid */}
            <ImageGrid
              images={displayedImages}
              baseUrl={baseUrl}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>

      {/* ═══ TOAST ═════════════════════════════════════════════ */}
      {toast && (
        <div className={`toast fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium max-w-sm ${
          toast.type === 'error' ? 'bg-red-600 text-white'
          : toast.type === 'info' ? 'bg-gray-800 text-white'
          : 'bg-emerald-600 text-white'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

/* ── Folder sidebar button ── */
function FolderBtn({ label, icon, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40 font-semibold'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
        active
          ? 'bg-white/20 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
      }`}>
        {count}
      </span>
    </button>
  );
}
