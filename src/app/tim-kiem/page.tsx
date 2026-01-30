'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { searchEngine, SearchResults } from '@/lib/search-engine';
import { Story } from '@/lib/api';

import StoryGrid from '@/components/StoryGrid';
import SearchBar from '@/components/SearchBar';
import SearchFiltersPanel, { SearchFilters } from '@/components/SearchFiltersPanel';
import SearchSortBar, { SortOptions } from '@/components/SearchSortBar';
import Pagination from '@/components/Pagination';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';


function EmptySearchState({ 
  query, 
  filters 
}: { 
  query: string; 
  filters: SearchFilters;
}) {
  const hasFilters = (filters.genres?.length || 0) > 0 
    || (filters.status?.length || 0) > 0 
    || !!filters.author
    || !!filters.yearFrom
    || !!filters.yearTo;

  const router = useRouter();
  
  const handleClearFilters = () => {
    router.push(`/tim-kiem?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Không tìm thấy truyện nào
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {hasFilters 
          ? `Không có truyện nào phù hợp với bộ lọc của bạn cho từ khóa "${query}"`
          : `Không tìm thấy truyện nào với từ khóa "${query}"`
        }
      </p>
      
      <div className="space-y-2 text-gray-600 dark:text-gray-400">
        <p className="font-medium">Gợi ý:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Thử từ khóa khác</li>
          <li>Kiểm tra chính tả</li>
          {hasFilters && <li>Thử xóa bớt bộ lọc</li>}
          <li>Tìm kiếm với từ khóa ngắn gọn hơn</li>
        </ul>
      </div>

      <div className="mt-8 space-x-4">
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Trang chủ
        </Link>
        {hasFilters && (
          <button 
            onClick={handleClearFilters}
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}


function SearchPageComponentContent() { // Renamed to avoid confusion with the exported component
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL is the single source of truth. Derive state from it on every render.
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const filters: SearchFilters = {
      genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
      status: searchParams.get('status')?.split(',').filter(Boolean) as ('ongoing' | 'completed')[] || [],
      author: searchParams.get('author') || undefined,
      yearFrom: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : undefined,
      yearTo: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : undefined,
  };
  
  const sort: SortOptions = {
    field: (searchParams.get('sort') as SortOptions['field']) || 'updatedAt',
    order: (searchParams.get('order') as SortOptions['order']) || 'desc',
  };

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to perform search when URL params change
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchEngine.search(query, filters, sort, page);
        setResults(searchResults);
      } catch (err) {
        console.error('[SearchPage] Search failed:', err);
        setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, page, searchParams.toString()]); // Depend on the string representation of params.

  // Handlers now just update the URL.
  const handleFilterChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update or delete params based on the new filter state
    if (newFilters.genres?.length) params.set('genres', newFilters.genres.join(',')); else params.delete('genres');
    if (newFilters.status?.length) params.set('status', newFilters.status.join(',')); else params.delete('status');
    if (newFilters.author) params.set('author', newFilters.author); else params.delete('author');
    if (newFilters.yearFrom) params.set('yearFrom', newFilters.yearFrom.toString()); else params.delete('yearFrom');
    if (newFilters.yearTo) params.set('yearTo', newFilters.yearTo.toString()); else params.delete('yearTo');
    
    params.delete('page'); // Reset to page 1 on filter change

    router.push(`/tim-kiem?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (newSort: SortOptions) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort.field);
    params.set('order', newSort.order);
    params.delete('page'); // Reset to page 1 on sort change

    router.push(`/tim-kiem?${params.toString()}`, { scroll: false });
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/tim-kiem?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar initialQuery={query} />

      {query && (
        <div className="mt-6 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kết quả tìm kiếm cho "{query}"
          </h1>
          {!isLoading && results && (
            <p className="text-gray-600 dark:text-gray-400">
              Tìm thấy {results.total} truyện
            </p>
          )}
        </div>
      )}
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-6">
        <aside className="lg:col-span-3">
            <SearchFiltersPanel
              filters={filters}
              onChange={handleFilterChange}
              className="mb-6 lg:mb-0"
            />
        </aside>

        <main className="lg:col-span-9">
            <div className="flex justify-end mb-4">
                <SearchSortBar
                  sort={sort}
                  onChange={handleSortChange}
                />
            </div>
          
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tìm kiếm...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            {!isLoading && !error && results && (
              <>
                {results.stories.length > 0 ? (
                  <>
                    <StoryGrid stories={results.stories as Story[]} />
                    
                    {results.totalPages > 1 && (
                      <Pagination
                        currentPage={results.page}
                        totalPages={results.totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                ) : (
                  <EmptySearchState query={query} filters={filters} />
                )}
              </>
            )}
            
            {!isLoading && !error && !results && !query && (
                 <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tìm kiếm truyện tranh</h2>
                    <p className="text-gray-600 dark:text-gray-400">Nhập từ khóa vào ô tìm kiếm phía trên để bắt đầu.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}

// Wrap the component in Suspense because useSearchParams() requires it.
export default function SearchPage() {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main>
          <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Đang tải trang tìm kiếm...</div>}>
              <SearchPageComponentContent />
          </Suspense>
        </main>
        <FooterComponent />
      </div>
    );
}