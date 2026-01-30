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
        const response = await otruyenApi.getGenres();
        if (response?.items) {
          // Sort genres alphabetically for better UX
          const sortedGenres = response.items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        
        <div className="flex items-center gap-4">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-blue-600 hover:underline"
            >
              Xóa tất cả
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-gray-600 dark:text-gray-300"
          >
            {isExpanded ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        
        {/* Genre Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Thể loại</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
            {genres.map(genre => (
              <label
                key={genre._id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.genres?.includes(genre.slug || '') || false}
                  onChange={() => handleGenreToggle(genre.slug || '')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm select-none text-gray-800 dark:text-gray-300">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Trạng thái</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status?.includes('ongoing') || false}
                onChange={() => handleStatusToggle('ongoing')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm select-none text-gray-800 dark:text-gray-300">Đang phát hành</span>
            </label>
            
            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status?.includes('completed') || false}
                onChange={() => handleStatusToggle('completed')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm select-none text-gray-800 dark:text-gray-300">Hoàn thành</span>
            </label>
          </div>
        </div>

        {/* Author Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Tác giả</h4>
          <input
            type="text"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder="Nhập tên tác giả..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Year Range Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Năm phát hành</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.yearFrom || ''}
              onChange={(e) => onChange({
                ...filters,
                yearFrom: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Từ năm"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={filters.yearTo || ''}
              onChange={(e) => onChange({
                ...filters,
                yearTo: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Đến năm"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
