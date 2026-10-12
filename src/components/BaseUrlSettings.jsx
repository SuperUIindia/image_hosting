import React, { useState, useEffect } from 'react';

const LS_KEY = 'image-url-generator-base-url';

export default function BaseUrlSettings({ onBaseUrlChange }) {
  const [baseUrl, setBaseUrl] = useState('');
  const [saved,   setSaved]   = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    const envUrl = import.meta.env.VITE_IMAGE_BASE_URL || '';
    const url    = (stored ?? envUrl).replace(/\/+$/, '');
    setBaseUrl(url);
    onBaseUrlChange?.(url);
  }, []);

  const handleChange = e => {
    setBaseUrl(e.target.value.replace(/\/+$/, ''));
    setSaved(false);
  };

  const handleSave = () => {
    const clean = baseUrl.replace(/\/+$/, '');
    localStorage.setItem(LS_KEY, clean);
    onBaseUrlChange?.(clean);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const exampleUrl = baseUrl
    ? `${baseUrl.replace(/\/+$/, '')}/uploads/portfolio/banner.jpg`
    : 'https://your-domain.vercel.app/uploads/portfolio/banner.jpg';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 mb-5">
      <div className="flex items-center justify-between flex-wrap gap-3">

        {/* Left: label + value */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-200 dark:shadow-purple-900/30">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width:'1.125rem',height:'1.125rem'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Production Base URL</p>
            {editing ? (
              <input
                autoFocus
                type="url"
                value={baseUrl}
                onChange={handleChange}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                placeholder="https://imagehosting-seven.vercel.app"
                className="text-sm font-mono bg-blue-50 dark:bg-blue-900/30 border border-blue-400 rounded-lg px-2.5 py-1 outline-none w-80 max-w-full text-gray-900 dark:text-gray-100"
              />
            ) : (
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate font-mono">
                {baseUrl || <span className="text-gray-400 font-normal font-sans">Not configured</span>}
              </p>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave}
                className="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm">
                Save
              </button>
              <button onClick={() => setEditing(false)}
                className="text-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl transition">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition border ${
                saved
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
              {saved ? '✓ Saved' : 'Edit URL'}
            </button>
          )}
        </div>
      </div>

      {/* Example URL preview */}
      {baseUrl && !editing && (
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 shrink-0">Example</span>
          <code className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono truncate">{exampleUrl}</code>
        </div>
      )}
    </div>
  );
}