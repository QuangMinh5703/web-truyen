'use client';

import { useState, useRef, useEffect } from 'react';

// Assuming SortOptions is defined in a shared types file or within the search page
export interface SortOptions {
  field: 'updatedAt' | 'views' | 'rating' | 'name';
  order: 'asc' | 'desc';
}

interface SearchSortBarProps {
  sort: SortOptions;
  onChange: (sort: SortOptions) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { field: 'updatedAt' as const, label: 'Mới cập nhật' },
  { field: 'views' as const, label: 'Xem nhiều nhất' },
  { field: 'rating' as const, label: 'Đánh giá cao' },
  { field: 'name' as const, label: 'Tên A-Z' },
];

export default function SearchSortBar({
  sort,
  onChange,
  className = '',
}: SearchSortBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSortChange = (field: SortOptions['field']) => {
    // If the same field is chosen, toggle the order. Otherwise, default to 'desc'.
    const newOrder = sort.field === field ? (sort.order === 'asc' ? 'desc' : 'asc') : 'desc';
    onChange({ field, order: newOrder });
    setIsOpen(false);
  };

  const handleOrderToggle = () => {
    onChange({
      ...sort,
      order: sort.order === 'asc' ? 'desc' : 'asc',
    });
  };

  const currentOption = SORT_OPTIONS.find(opt => opt.field === sort.field);

  return (
    <div className={`flex items-center gap-3 ${className}`} ref={dropdownRef}>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 shrink-0">
        Sắp xếp:
      </span>

      {/* Sort Field Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-44 gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
        >
          <span className="text-xs font-bold text-white uppercase tracking-widest">{currentOption?.label}</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.field}
                onClick={() => handleSortChange(option.field)}
                className={`w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${sort.field === option.field
                    ? 'bg-lime-400 text-black'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Toggle */}
      <button
        onClick={handleOrderToggle}
        className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
        title={sort.order === 'desc' ? 'Sắp xếp giảm dần' : 'Sắp xếp tăng dần'}
      >
        {sort.order === 'desc'
          ? <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h14a1 1 0 100-2H3z" /></svg>
          : <svg className="w-5 h-5 transform rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h14a1 1 0 100-2H3z" /></svg>
        }
      </button>
    </div>
  );
}
