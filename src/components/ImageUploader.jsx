import React, { useState, useRef } from 'react';

export default function ImageUploader({ onUpload }) {
  const [isDragging, setIsDragging]   = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const ACCEPT_TYPES = '.png,.jpg,.jpeg,.webp,.gif';

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => f instanceof File);
    if (!files.length) return;
    setIsUploading(true);
    try { await onUpload(files); }
    finally { setIsUploading(false); }
  };

  const onDragOver  = e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDrop      = e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFiles(e.dataTransfer.files); };
  const onInput     = e => { e.target.files && handleFiles(e.target.files); e.target.value = ''; };

  return (
    <div
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
      }`}
    >
      <input ref={fileInputRef} type="file" accept={ACCEPT_TYPES} multiple onChange={onInput} className="hidden" />

      <div className="py-10 px-6 flex flex-col items-center justify-center text-center">
        {isUploading ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 animate-spin mb-4" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-200">Processing images…</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Saving to disk</p>
          </>
        ) : (
          <>
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
              isDragging
                ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-200'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40'
            }`}>
              <svg className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">
              {isDragging ? 'Drop to upload' : <><span className="text-blue-600 dark:text-blue-400">Click to upload</span> or drag & drop</>}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">PNG, JPG, WebP, GIF · max 10 MB each</p>

            {/* Format badges */}
            <div className="flex gap-2 mt-4">
              {['PNG','JPG','WebP','GIF'].map(f => (
                <span key={f} className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                  {f}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animated border on drag */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-2xl animate-pulse" />
      )}
    </div>
  );
}