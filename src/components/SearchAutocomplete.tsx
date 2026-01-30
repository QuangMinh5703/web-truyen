'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { otruyenApi, Story } from '@/lib/api';
import { API_CONFIG } from '@/lib/api-config';
import { SearchHistory } from '@/lib/search-history';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import Image from 'next/image';

interface SearchAutocompleteProps {
  onSelect?: (query: string) => void;
  className?: string;
}

export default function SearchAutocomplete({
  onSelect,
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Story[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load history when dropdown opens and there is no query
  useEffect(() => {
    if (isOpen && !query) {
      const recentSearches = SearchHistory.get().map(item => item.query);
      setHistory(recentSearches.slice(0, 5));
    }
  }, [isOpen, query]);

  // Fetch suggestions (debounced)
  const fetchSuggestions = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await otruyenApi.searchStories(searchQuery, { page: 1, limit: 5 });
      setSuggestions(response?.items || []);
    } catch (error) {
      console.error('[Autocomplete] Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
    fetchSuggestions(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (query ? suggestions.length : history.length);
    if (!isOpen || totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === -1) {
          handleSearch(query);
        } else if (!query) { // History is showing
          handleSearch(history[selectedIndex]);
        } else { // Suggestions are showing
          const story = suggestions[selectedIndex];
          router.push(`/truyen-tranh/${story.slug}`);
          setIsOpen(false);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    SearchHistory.add(trimmedQuery);
    setIsOpen(false);
    setQuery('');
    
    if (onSelect) {
      onSelect(trimmedQuery);
    } else {
      router.push(`/tim-kiem?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showHistory = isOpen && !query && history.length > 0;
  const showSuggestions = isOpen && query && (suggestions.length > 0 || isLoading);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
         <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              className="w-full h-10 p-2 pl-4 pr-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
              onClick={() => handleSearch(query)}
              className="absolute right-0 top-0 h-10 px-3 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-500"
          >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              )}
          </button>
      </div>

      {(showHistory || showSuggestions) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
        >
          {showHistory && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Lịch sử tìm kiếm</span>
                <button
                  onClick={() => { SearchHistory.clear(); setHistory([]); }}
                  className="text-blue-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
              {history.map((item, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleSearch(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3 py-2 rounded text-gray-800 dark:text-gray-300 ${selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <div className="flex items-center gap-2">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{item}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showSuggestions && (
            <div className="p-2">
              {isLoading && suggestions.length === 0 && <div className="p-4 text-center text-gray-500">Đang tìm...</div>}
              {!isLoading && suggestions.length === 0 && <div className="p-4 text-center text-gray-500">Không có kết quả nào.</div>}
              {suggestions.map((story, index) => (
                <Link
                  href={`/truyen-tranh/${story.slug}`}
                  key={story._id}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`block w-full text-left px-3 py-2 rounded ${selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 flex-shrink-0">
                      <Image
                        src={`${API_CONFIG.CDN_URL}/uploads/comics/${story.thumb_url}`}
                        alt={story.name || ''}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {story.name}
                      </p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {story.author?.join(', ')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
