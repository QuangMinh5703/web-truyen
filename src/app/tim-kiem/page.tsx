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
import ErrorDisplay from '@/components/ui/ErrorDisplay';


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
    <div className="text-center py-20 px-6 bg-gray-900/30 rounded-3xl border border-white/5 backdrop-blur-sm">
      <div className="text-7xl mb-6 animate-bounce">📚</div>
      <h2 className="title-main mb-4">
        Không tìm thấy truyện
      </h2>
      <p className="text-gray-400 font-lexend-exa max-w-md mx-auto mb-8">
        {hasFilters
          ? `Chúng tôi không tìm thấy kết quả nào phù hợp với bộ lọc đã chọn cho từ khóa "${query}".`
          : `Không tìm thấy truyện nào với từ khóa "${query}". Hãy thử lại với từ khóa khác nhé!`
        }
      </p>

      <div className="max-w-xs mx-auto space-y-3 text-left bg-white/5 p-6 rounded-2xl border border-white/5 mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-lime-400">Gợi ý cho bạn:</p>
        <ul className="space-y-2 text-xs font-bold text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-lime-400 rounded-full"></span>
            Kiểm tra lại chính tả
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-lime-400 rounded-full"></span>
            Sử dụng từ khóa ngắn gọn hơn
          </li>
          {hasFilters && (
            <li className="flex items-center gap-2 text-lime-400">
              <span className="w-1 h-1 bg-lime-400 rounded-full"></span>
              Thử xóa bớt bộ lọc đã chọn
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto px-8 py-3.5 bg-lime-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-lime-400 transition-all shadow-lg shadow-lime-500/20 active:scale-95"
        >
          TRANG CHỦ
        </Link>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 text-gray-300 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all border border-white/5 active:scale-95"
          >
            XÓA BỘ LỌC
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 max-w-2xl mx-auto">
        <SearchBar initialQuery={query} />
      </div>

      {query && (
        <div className="mb-10 text-center lg:text-left">
          <h1 className="title-main mb-3">
            Kết quả: &quot;{query}&quot;
          </h1>
          {!isLoading && results && (
            <p className="text-gray-500 font-lexend-exa font-bold uppercase tracking-widest text-sm">
              Đã tìm thấy <span className="text-lime-400">{results.total}</span> kết quả
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
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-lime-400/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-lime-400 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Đang tìm kiếm...</p>
            </div>
          )}

          {error && (
            <div className="py-12">
              <ErrorDisplay
                message={error}
                onRetry={() => window.location.reload()}
                showHome={false}
              />
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
            <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-white/5 border-dashed">
              <div className="text-7xl mb-6 opacity-50">🔍</div>
              <h2 className="title-main mb-4">Tìm truyện tranh</h2>
              <p className="text-gray-500 font-lexend-exa max-w-sm mx-auto">Nhập tên truyện, tác giả hoặc thể loại vào ô tìm kiếm phía trên để bắt đầu khám phá thế giới truyện tranh.</p>
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