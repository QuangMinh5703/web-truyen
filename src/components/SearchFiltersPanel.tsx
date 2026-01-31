'use client';

import { useState, useEffect } from 'react';
import { otruyenApi, Genre } from '@/lib/api';
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

// Assuming SearchFilters is defined in a shared types file or within the search page
export interface SearchFilters {
  genres?: string[];
  status?: ('ongoing' | 'completed')[];
  author?: string;
  yearFrom?: number;
  yearTo?: number;
}

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  className?: string;
}

export default function SearchFiltersPanel({
  filters,
  onChange,
  className = '',
}: SearchFiltersPanelProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [authorInput, setAuthorInput] = useState(filters.author || '');

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await otruyenApi.getGenres();
        if (genresData) {
          // Sort genres alphabetically for better UX
          const sortedGenres = genresData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
          setGenres(sortedGenres);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Debounced callback for author input
  const debouncedAuthorChange = useDebouncedCallback((value: string) => {
    onChange({ ...filters, author: value.trim() || undefined });
  }, 500);

  useEffect(() => {
    debouncedAuthorChange(authorInput);
  }, [authorInput]);


  const handleGenreToggle = (genreSlug: string) => {
    const currentGenres = filters.genres || [];
    const newGenres = currentGenres.includes(genreSlug)
      ? currentGenres.filter(g => g !== genreSlug)
      : [...currentGenres, genreSlug];

    onChange({ ...filters, genres: newGenres.length > 0 ? newGenres : undefined });
  };

  const handleStatusToggle = (status: 'ongoing' | 'completed') => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];

    onChange({ ...filters, status: newStatus.length > 0 ? newStatus : undefined });
  };

  const handleClearAll = () => {
    setAuthorInput('');
    onChange({}); // Reset all filters to an empty object
  };

  const activeFilterCount =
    (filters.genres?.length || 0) +
    (filters.status?.length || 0) +
    (filters.author ? 1 : 0) +
    (filters.yearFrom || filters.yearTo ? 1 : 0);

  return (
    <div className={`bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black uppercase tracking-widest text-lg flex items-center gap-3 text-white">
          <span className="w-1.5 h-6 bg-lime-400 rounded-full"></span>
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="bg-lime-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(168,227,0,0.3)]">
              {activeFilterCount}
            </span>
          )}
        </h3>

        <div className="flex items-center gap-4">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[10px] font-black uppercase tracking-widest text-lime-400 hover:text-white transition-colors"
            >
              Xóa tất cả
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 bg-white/5 rounded-xl text-gray-400 active:scale-95 transition-all border border-white/5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isExpanded ? 'THU GỌN' : 'MỞ RỘNG'}
            </span>
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`space-y-8 ${isExpanded ? 'block' : 'hidden lg:block'}`}>

        {/* Genre Filter */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-500">Thể loại</h4>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-3 scrollbar-hide">
            {genres.map(genre => (
              <label
                key={genre._id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${filters.genres?.includes(genre.slug || '')
                  ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-200'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={filters.genres?.includes(genre.slug || '') || false}
                  onChange={() => handleGenreToggle(genre.slug || '')}
                  className="hidden"
                />
                <span className="text-xs font-bold select-none">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-500">Trạng thái</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleStatusToggle('ongoing')}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${filters.status?.includes('ongoing')
                ? 'bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/20'
                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Đang ra</span>
              <span className={`w-1.5 h-1.5 rounded-full ${filters.status?.includes('ongoing') ? 'bg-black' : 'bg-lime-400'}`}></span>
            </button>

            <button
              onClick={() => handleStatusToggle('completed')}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${filters.status?.includes('completed')
                ? 'bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/20'
                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Hoàn thành</span>
              <span className={`w-1.5 h-1.5 rounded-full ${filters.status?.includes('completed') ? 'bg-black' : 'bg-green-500'}`}></span>
            </button>
          </div>
        </div>

        {/* Author Filter */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-500">Tác giả</h4>
          <input
            type="text"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder="Tìm theo tác giả..."
            className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all"
          />
        </div>

        {/* Year Range Filter */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-500">Năm phát hành</h4>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={filters.yearFrom || ''}
              onChange={(e) => onChange({
                ...filters,
                yearFrom: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Từ"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-center text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 transition-all"
            />
            <span className="text-gray-600 font-bold">/</span>
            <input
              type="number"
              value={filters.yearTo || ''}
              onChange={(e) => onChange({
                ...filters,
                yearTo: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Đến"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-center text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
