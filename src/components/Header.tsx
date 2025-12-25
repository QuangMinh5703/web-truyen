'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, BookOpen, TrendingUp } from 'lucide-react';
import { otruyenApi, Genre } from '@/lib/api';

/**
 * The main header for the application.
 * Includes the logo, site stats (currently hardcoded), main navigation,
 * and a dynamic, accessible genre dropdown menu.
 */
export default function Header() {
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const genreButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * @effect Fetches the list of genres from the API when the component mounts.
   */
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await otruyenApi.getGenres();
        if (response?.items) {
          setGenres(response.items);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, []);

  /**
   * @effect Handles keyboard interaction for the genre dropdown (e.g., closing with Escape).
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsGenreOpen(false);
        genreButtonRef.current?.focus();
      }
    };

    if (isGenreOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGenreOpen]);

  // Note: Site stats are currently hardcoded as the API does not provide this data.
  const stats = {
    dailyUpdates: 127,
    totalStories: 3542,
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Trang chủ MTruyen">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              MTruyen
            </span>
          </Link>

          {/* Site Statistics */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cập nhật hôm nay</p>
                <p className="font-bold text-green-600 dark:text-green-400">{stats.dailyUpdates.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tổng số truyện</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">{stats.totalStories.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav aria-label="Main navigation" className="flex items-center justify-center gap-1 py-2 border-t border-gray-100 dark:border-gray-800">
          <Link href="/" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400">
            Trang chủ
          </Link>
          <Link href="/truyen-moi" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400">
            Truyện mới
          </Link>
          <Link href="/hoan-thanh" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400">
            Hoàn thành
          </Link>

          {/* Genre Dropdown */}
          <div className="relative">
            <button
              ref={genreButtonRef}
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
              aria-haspopup="true"
              aria-expanded={isGenreOpen}
              aria-controls="genre-menu"
            >
              Thể loại
              <ChevronDown className={`h-4 w-4 transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isGenreOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsGenreOpen(false)} aria-hidden="true" />
                <div
                  id="genre-menu"
                  className="absolute left-1/2 -translate-x-1/2 top-full z-20 mt-2 w-[480px] rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  role="menu"
                  aria-labelledby="genre-button"
                >
                  {genres.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                      {genres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/the-loai/${genre.slug}`}
                          className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                          onClick={() => setIsGenreOpen(false)}
                          role="menuitem"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                     <p className="text-center text-sm text-gray-500 p-4">Đang tải thể loại...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
