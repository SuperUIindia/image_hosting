import React, { useState } from 'react';

export default function SearchBar({ onSearch, onFilter, onSort }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort,   setSort]   = useState('newest');

  const FILTER_OPTIONS = [
    { value: 'all',  label: 'All Types' },
    { value: 'png',  label: 'PNG'       },
    { value: 'jpeg', label: 'JPEG'      },
    { value: 'webp', label: 'WebP'      },
    { value: 'gif',  label: 'GIF'       }
  ];

  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first'   },
    { value: 'oldest', label: 'Oldest first'   },
    { value: 'name',   label: 'Name A → Z'     }
  ];

  const onSearchChange = e => { setSearch(e.target.value); onSearch(e.target.value); };
  const onFilterChange = e => { setFilter(e.target.value); onFilter(e.target.value); };
  const onSortChange   = e => { setSort(e.target.value);   onSort(e.target.value);   };

  return (
    <div className="flex flex-col sm:flex-row gap-3">

      {/* Search */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search images…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 transition"
        />
        {search && (
          <button onClick={() => { setSearch(''); onSearch(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filter */}
      <select value={filter} onChange={onFilterChange}
        className="px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 dark:text-gray-200 transition cursor-pointer">
        {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Sort */}
      <select value={sort} onChange={onSortChange}
        className="px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 dark:text-gray-200 transition cursor-pointer">
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}