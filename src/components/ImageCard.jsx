import React, { useState } from 'react';

/**
 * ImageCard — image preview + metadata with inline name & path editing.
 */
export default function ImageCard({ image, baseUrl, onDelete, onCopy, onUpdate }) {
  const [copied, setCopied]       = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingPath, setEditingPath] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [pathValue, setPathValue] = useState('');
  const [imgError, setImgError]   = useState(false);

  // Build clean production URL
  const cleanBase = (baseUrl || '').replace(/\/+$/, '');
  const cleanPath = image.relativePath.startsWith('/') ? image.relativePath : '/' + image.relativePath;
  const fullUrl   = cleanBase ? cleanBase + cleanPath : cleanPath;
  const displayName = image.customName || image.originalName;

  /* ── Copy ─────────────────────────────────── */
  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      onCopy?.(text, type);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  /* ── Name edit ─────────────────────────────── */
  const startName  = () => { setNameValue(displayName); setEditingName(true); };
  const commitName = () => {
    const v = nameValue.trim();
    if (v && v !== displayName) onUpdate?.(image.id, { customName: v });
    setEditingName(false);
  };

  /* ── Path edit ─────────────────────────────── */
  const startPath  = () => { setPathValue(image.relativePath); setEditingPath(true); };
  const commitPath = () => {
    const v = pathValue.trim();
    if (v && v !== image.relativePath) onUpdate?.(image.id, { customPath: v });
    setEditingPath(false);
  };

  /* ── Helpers ───────────────────────────────── */
  const fmt = b => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(2)}MB`;
  const fmtDate = iso => new Date(iso).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });

  const imgSrc = (!imgError && image.dataUrl) ? image.dataUrl : (!imgError ? fullUrl : '');

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      {/* ── Preview ────────────────────────────── */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={displayName}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"/>
            </svg>
            <span className="text-xs mt-2">No preview</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="text-[10px] font-bold uppercase bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
            {image.mimeType.split('/')[1]}
          </span>
          {image.savedToDisk && (
            <span className="text-[10px] font-semibold bg-emerald-500/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
              disk
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3 gap-2">
          <a href={fullUrl || image.dataUrl} target="_blank" rel="noopener noreferrer"
             className="flex-1 text-center text-xs font-semibold bg-white/20 hover:bg-white/30 text-white py-1.5 rounded-lg backdrop-blur-sm transition">
            Open ↗
          </a>
          <button onClick={() => onDelete(image.id)}
            className="flex-1 text-center text-xs font-semibold bg-red-500/70 hover:bg-red-500/90 text-white py-1.5 rounded-lg backdrop-blur-sm transition">
            Delete
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Name (editable) */}
        <div className="group/name flex items-start gap-1">
          {editingName ? (
            <div className="flex-1 flex flex-col gap-1.5">
              <input autoFocus value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') commitName(); if (e.key==='Escape') setEditingName(false); }}
                className="w-full text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 border border-blue-400 rounded-lg px-2.5 py-1.5 outline-none text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-1.5">
                <button onClick={commitName} className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1 transition font-medium">Save</button>
                <button onClick={() => setEditingName(false)} className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg py-1 transition">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-snug" title={displayName}>
                {displayName}
              </h3>
              <button onClick={startName}
                className="opacity-0 group-hover/name:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 shrink-0"
                title="Rename">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {image.customName && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2 truncate">orig: {image.originalName}</p>
        )}

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-1.5">
          {image.width > 0 && (
            <Chip>{image.width}×{image.height}</Chip>
          )}
          <Chip>{fmt(image.sizeBytes)}</Chip>
          <Chip>{fmtDate(image.createdAt)}</Chip>
        </div>

        {/* Path (editable) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">URL Path</span>
            {!editingPath && (
              <button onClick={startPath} className="text-[10px] text-blue-500 hover:text-blue-700 font-medium transition">Edit ✎</button>
            )}
          </div>

          {editingPath ? (
            <div className="flex flex-col gap-1.5">
              <input autoFocus value={pathValue}
                onChange={e => setPathValue(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') commitPath(); if (e.key==='Escape') setEditingPath(false); }}
                className="w-full text-xs font-mono bg-blue-50 dark:bg-blue-900/30 border border-blue-400 rounded-lg px-2.5 py-1.5 outline-none text-gray-800 dark:text-gray-200"
                placeholder="/uploads/portfolio/my-image.jpg"
              />
              <div className="flex gap-1.5">
                <button onClick={commitPath} className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1 transition font-medium">Save path</button>
                <button onClick={() => setEditingPath(false)} className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg py-1 transition">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <code className="flex-1 text-[11px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1.5 rounded-lg truncate text-gray-600 dark:text-gray-300 font-mono">
                {image.relativePath}
              </code>
              <button onClick={() => handleCopy(image.relativePath, 'path')}
                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition shrink-0"
                title="Copy path">
                {copied === 'path' ? <Check /> : <Copy />}
              </button>
            </div>
          )}
        </div>

        {/* Production URL */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Production URL</span>
            {!cleanBase && <span className="text-[10px] text-amber-500">Set base URL ↑</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <code className={`flex-1 text-[11px] font-mono px-2 py-1.5 rounded-lg truncate border ${
              cleanBase
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
            }`}>
              {fullUrl || '(configure base URL)'}
            </code>
            <button onClick={() => handleCopy(fullUrl, 'url')}
              className="p-1.5 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition shrink-0"
              title="Copy URL">
              {copied === 'url' ? <Check /> : <Copy />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Micro components ─── */
const Chip = ({ children }) => (
  <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-medium">{children}</span>
);
const Copy = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>
);
const Check = () => (
  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);