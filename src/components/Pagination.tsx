'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 3; // Number of page buttons to show near current page

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 4);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }

    // Always add first page
    pageNumbers.push(1);

    if (startPage > 2) {
      pageNumbers.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }

    // Always add last page if totalPages > 1
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 py-8 border-t border-white/5 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 disabled:opacity-20 hover:bg-white/10 hover:text-white transition-all border border-white/5 active:scale-90"
          title="Trang đầu"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 disabled:opacity-20 hover:bg-white/10 hover:text-white transition-all border border-white/5 active:scale-90"
          title="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide px-4 max-w-full">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="w-11 h-11 flex items-center justify-center text-gray-600 font-black">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${currentPage === pageNum
                ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(168,227,0,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 disabled:opacity-20 hover:bg-white/10 hover:text-white transition-all border border-white/5 active:scale-90"
          title="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 disabled:opacity-20 hover:bg-white/10 hover:text-white transition-all border border-white/5 active:scale-90"
          title="Trang cuối"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
