# TODO: TÍNH NĂNG TÌM KIẾM TRUYỆN - M-TRUYEN
## Strategy: Client-Side Filtering

**Ngày tạo:** 18/01/2026  
**Priority:** HIGH  
**Estimate:** 2-3 tuần  
**Approach:** Client-side filtering với API pagination

---

## 📊 TỔNG QUAN

### Mục tiêu
Xây dựng hệ thống tìm kiếm truyện toàn diện với:
- Tìm kiếm nhanh từ thanh search trong Navbar
- Trang tìm kiếm nâng cao với bộ lọc đa dạng (client-side)
- Autocomplete và gợi ý tìm kiếm
- Lưu lịch sử tìm kiếm
- Tối ưu UX và performance

### Hiện trạng
- ✅ API search đã có: `otruyenApi.searchStories(keyword, params)`
- ✅ UI search basic trong Navbar (chỉ console.log)
- ⚠️ Chưa có trang search results
- ⚠️ Chưa có advanced filters
- ⚠️ Chưa có autocomplete
- ⚠️ Chưa có search history

### ⚙️ Technical Strategy
**Client-Side Filtering Approach:**
- API chỉ tìm kiếm theo keyword
- Lấy results từ API (nhiều pages nếu cần)
- Filter, sort, và paginate ở client-side
- Cache results để improve performance
- Smart pagination để balance UX và performance

---

## 🎯 PHASE 1: CORE SEARCH ENGINE (1 tuần) - PRIORITY: CRITICAL

### 1.1 Search Data Manager
**File:** `src/lib/search-engine.ts`

**Purpose:** Quản lý việc fetch, cache, và filter search results

**Tasks:**
- [ ] Create SearchEngine class
- [ ] Implement smart pagination fetching
- [ ] Client-side filtering logic
- [ ] Client-side sorting logic
- [ ] Result caching system
- [ ] Performance optimization

**Code Structure:**
```typescript
interface SearchFilters {
  genres?: string[];
  status?: ('ongoing' | 'completed')[];
  author?: string;
  yearFrom?: number;
  yearTo?: number;
}

interface SortOptions {
  field: 'views' | 'rating' | 'updatedAt' | 'name';
  order: 'asc' | 'desc';
}

interface SearchEngineOptions {
  maxPagesToFetch?: number;  // Default: 3 (60 stories with limit=20)
  cacheTimeout?: number;      // Default: 5 minutes
  resultsPerPage?: number;    // Default: 20
}

class SearchEngine {
  private cache: Map<string, CachedResults>;
  private options: SearchEngineOptions;

  constructor(options?: SearchEngineOptions);

  /**
   * Main search method
   * 1. Fetch results from API (multiple pages if needed)
   * 2. Apply client-side filters
   * 3. Sort results
   * 4. Paginate for display
   */
  async search(
    keyword: string,
    filters?: SearchFilters,
    sort?: SortOptions,
    page?: number
  ): Promise<SearchResults>;

  /**
   * Fetch multiple pages from API in parallel
   */
  private async fetchAllPages(
    keyword: string,
    maxPages: number
  ): Promise<Story[]>;

  /**
   * Filter results based on criteria
   */
  private filterResults(
    stories: Story[],
    filters: SearchFilters
  ): Story[];

  /**
   * Sort results
   */
  private sortResults(
    stories: Story[],
    sort: SortOptions
  ): Story[];

  /**
   * Paginate filtered results
   */
  private paginateResults(
    stories: Story[],
    page: number,
    limit: number
  ): PaginatedResults;

  /**
   * Get from cache or fetch new
   */
  private getCachedOrFetch(
    keyword: string
  ): Promise<Story[]>;

  /**
   * Clear cache
   */
  clearCache(): void;
}

interface CachedResults {
  keyword: string;
  stories: Story[];
  timestamp: number;
}

interface SearchResults {
  stories: Story[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  filters: SearchFilters;
  sort: SortOptions;
}

export const searchEngine = new SearchEngine();
```

**Implementation Details:**

**1. Smart Pagination Strategy:**
```typescript
private async fetchAllPages(
  keyword: string,
  maxPages: number = 3
): Promise<Story[]> {
  const allStories: Story[] = [];
  const promises: Promise<ListResponse<Story> | undefined>[] = [];

  // Fetch first 3 pages in parallel (60 stories)
  for (let page = 1; page <= maxPages; page++) {
    promises.push(
      otruyenApi.searchStories(keyword, { page, limit: 20 })
    );
  }

  const results = await Promise.all(promises);

  for (const result of results) {
    if (result?.items) {
      allStories.push(...result.items);
    }
  }

  return allStories;
}
```

**2. Client-Side Filtering:**
```typescript
private filterResults(
  stories: Story[],
  filters: SearchFilters
): Story[] {
  return stories.filter(story => {
    // Genre filter
    if (filters.genres && filters.genres.length > 0) {
      const storyGenres = story.category?.map(g => g.slug || g.name.toLowerCase()) || [];
      const hasMatchingGenre = filters.genres.some(filterGenre =>
        storyGenres.includes(filterGenre.toLowerCase())
      );
      if (!hasMatchingGenre) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      // Normalize status values
      const storyStatus = this.normalizeStatus(story.status);
      if (!filters.status.includes(storyStatus)) return false;
    }

    // Author filter (case-insensitive partial match)
    if (filters.author) {
      const authorText = (story.author || []).join(' ').toLowerCase();
      if (!authorText.includes(filters.author.toLowerCase())) {
        return false;
      }
    }

    // Year filter
    if (filters.yearFrom || filters.yearTo) {
      const storyYear = story.createdAt 
        ? new Date(story.createdAt).getFullYear()
        : null;
      
      if (storyYear) {
        if (filters.yearFrom && storyYear < filters.yearFrom) return false;
        if (filters.yearTo && storyYear > filters.yearTo) return false;
      }
    }

    return true;
  });
}

private normalizeStatus(status?: string): 'ongoing' | 'completed' {
  if (!status) return 'ongoing';
  
  const normalized = status.toLowerCase();
  if (normalized.includes('hoan-thanh') || normalized.includes('completed')) {
    return 'completed';
  }
  return 'ongoing';
}
```

**3. Client-Side Sorting:**
```typescript
private sortResults(
  stories: Story[],
  sort: SortOptions
): Story[] {
  return [...stories].sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'views':
        comparison = (a.views || 0) - (b.views || 0);
        break;
      
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      
      case 'updatedAt':
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
        break;
      
      case 'name':
        const nameA = a.name || a.title || '';
        const nameB = b.name || b.title || '';
        comparison = nameA.localeCompare(nameB, 'vi');
        break;
    }

    return sort.order === 'desc' ? -comparison : comparison;
  });
}
```

**4. Caching Strategy:**
```typescript
private getCachedOrFetch(keyword: string): Promise<Story[]> {
  const cacheKey = keyword.toLowerCase().trim();
  const cached = this.cache.get(cacheKey);

  // Check if cache is valid (within timeout)
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > this.options.cacheTimeout;
    if (!isExpired) {
      console.log('[SearchEngine] Using cached results for:', keyword);
      return Promise.resolve(cached.stories);
    }
  }

  // Fetch new results
  console.log('[SearchEngine] Fetching new results for:', keyword);
  return this.fetchAllPages(keyword, this.options.maxPagesToFetch).then(stories => {
    // Save to cache
    this.cache.set(cacheKey, {
      keyword: cacheKey,
      stories,
      timestamp: Date.now(),
    });
    return stories;
  });
}
```

**Checklist:**
- [ ] Implement SearchEngine class
- [ ] Test parallel API fetching
- [ ] Test genre filtering
- [ ] Test status filtering
- [ ] Test author filtering
- [ ] Test year filtering
- [ ] Test sorting (all fields)
- [ ] Test caching mechanism
- [ ] Test cache expiration
- [ ] Add TypeScript strict types
- [ ] Add JSDoc comments
- [ ] Handle edge cases (empty results, API errors)

---

### 1.2 Search Results Page
**File:** `src/app/tim-kiem/page.tsx`

**Tasks:**
- [ ] Create page layout
- [ ] Integrate SearchEngine
- [ ] Display results using StoryGrid
- [ ] Client-side pagination
- [ ] Loading states (initial + filter changes)
- [ ] Empty state
- [ ] Error handling

**Component Structure:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchEngine } from '@/lib/search-engine';
import type { SearchFilters, SortOptions } from '@/lib/search-engine';
import StoryGrid from '@/components/StoryGrid';
import SearchBar from '@/components/SearchBar';
import SearchFiltersPanel from '@/components/SearchFiltersPanel';
import SearchSortBar from '@/components/SearchSortBar';
import Pagination from '@/components/Pagination';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get params from URL
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Parse filters from URL
  const [filters, setFilters] = useState<SearchFilters>({
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
    status: searchParams.get('status')?.split(',').filter(Boolean) as any || [],
    author: searchParams.get('author') || undefined,
  });

  const [sort, setSort] = useState<SortOptions>({
    field: (searchParams.get('sort') as any) || 'updatedAt',
    order: (searchParams.get('order') as any) || 'desc',
  });

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perform search when params change
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchEngine.search(
          query,
          filters,
          sort,
          page
        );
        setResults(searchResults);
      } catch (err) {
        console.error('[SearchPage] Search failed:', err);
        setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, page, JSON.stringify(filters), JSON.stringify(sort)]);

  // Update URL when filters/sort change
  const updateURL = (newFilters?: SearchFilters, newSort?: SortOptions, newPage?: number) => {
    const params = new URLSearchParams();
    params.set('q', query);

    const currentFilters = newFilters || filters;
    const currentSort = newSort || sort;
    const currentPage = newPage || page;

    if (currentFilters.genres?.length) {
      params.set('genres', currentFilters.genres.join(','));
    }
    if (currentFilters.status?.length) {
      params.set('status', currentFilters.status.join(','));
    }
    if (currentFilters.author) {
      params.set('author', currentFilters.author);
    }
    
    params.set('sort', currentSort.field);
    params.set('order', currentSort.order);
    params.set('page', currentPage.toString());

    router.push(`/tim-kiem?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    updateURL(newFilters, sort, 1); // Reset to page 1
  };

  const handleSortChange = (newSort: SortOptions) => {
    setSort(newSort);
    updateURL(filters, newSort, 1); // Reset to page 1
  };

  const handlePageChange = (newPage: number) => {
    updateURL(filters, sort, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <SearchBar initialQuery={query} />

      {/* Results Header */}
      {results && (
        <div className="mt-6 mb-4">
          <h1 className="text-2xl font-bold">
            Kết quả tìm kiếm cho "{query}"
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tìm thấy {results.total} truyện
          </p>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex gap-4 mb-6">
        <SearchFiltersPanel
          filters={filters}
          onChange={handleFilterChange}
        />
        <SearchSortBar
          sort={sort}
          onChange={handleSortChange}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && results && (
        <>
          {results.stories.length > 0 ? (
            <>
              <StoryGrid stories={results.stories} />
              
              {/* Pagination */}
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
    </div>
  );
}

function EmptySearchState({ 
  query, 
  filters 
}: { 
  query: string; 
  filters: SearchFilters;
}) {
  const hasFilters = (filters.genres?.length || 0) > 0 
    || (filters.status?.length || 0) > 0 
    || !!filters.author;

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-2xl font-bold mb-2">
        Không tìm thấy truyện nào
      </h2>
      <p className="text-gray-600 mb-6">
        {hasFilters 
          ? `Không có truyện nào phù hợp với bộ lọc của bạn`
          : `Không tìm thấy truyện nào với từ khóa "${query}"`
        }
      </p>
      
      <div className="space-y-2 text-gray-600">
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
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Xem truyện mới
        </Link>
        {hasFilters && (
          <button 
            onClick={() => window.location.href = `/tim-kiem?q=${query}`}
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] URL params sync với state
- [ ] Browser back/forward support
- [ ] Loading states smooth
- [ ] Empty state helpful
- [ ] Error handling graceful
- [ ] Mobile responsive
- [ ] SEO meta tags
- [ ] Keyboard navigation

---

### 1.3 Update Navbar Integration
**File:** `src/components/Navbar.tsx`

**Tasks:**
- [ ] Navigate to search page on submit
- [ ] Pass query via URL params
- [ ] Clear input after search
- [ ] Add loading indicator (optional)

**Changes:**
```typescript
const router = useRouter();

const handleSearch = () => {
  if (searchTerm.trim()) {
    router.push(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  }
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

// Update input
<input
  type="text"
  placeholder="Tìm kiếm"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={handleKeyDown}
  className="..."
/>

// Update button
<button onClick={handleSearch} className="...">
  <Image src="/ri_search_ai_2_line.svg" ... />
</button>
```

**Checklist:**
- [ ] Enter key works
- [ ] Click search button works
- [ ] Input clears after search
- [ ] URL encoding correct
- [ ] Mobile overlay (if applicable)

---

## 🎯 PHASE 2: ADVANCED FILTERS (5-7 ngày) - PRIORITY: HIGH

### 2.1 SearchFiltersPanel Component
**File:** `src/components/SearchFiltersPanel.tsx`

**Purpose:** Panel hiển thị và quản lý tất cả bộ lọc (client-side)

**Tasks:**
- [ ] Create filter panel component
- [ ] Genre multi-select
- [ ] Status filter (ongoing/completed)
- [ ] Author input with debounce
- [ ] Year range inputs
- [ ] Active filters chips display
- [ ] Clear all filters button
- [ ] Mobile: Collapsible/modal design

**Component Structure:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { otruyenApi, type Genre } from '@/lib/api';
import type { SearchFilters } from '@/lib/search-engine';

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

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await otruyenApi.getGenres();
        if (response?.items) {
          setGenres(response.items);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Debounce author input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authorInput !== filters.author) {
        onChange({ ...filters, author: authorInput || undefined });
      }
    }, 500);

    return () => clearTimeout(timeout);
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
    onChange({});
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
        <h3 className="font-bold text-lg flex items-center gap-2">
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        
        <div className="flex items-center gap-2">
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
            className="md:hidden text-gray-600"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        
        {/* Genre Filter */}
        <div>
          <h4 className="font-medium mb-3">Thể loại</h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {genres.map(genre => (
              <label
                key={genre.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.genres?.includes(genre.slug || '') || false}
                  onChange={() => handleGenreToggle(genre.slug || '')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h4 className="font-medium mb-3">Trạng thái</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status?.includes('ongoing') || false}
                onChange={() => handleStatusToggle('ongoing')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Đang phát hành</span>
            </label>
            
            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status?.includes('completed') || false}
                onChange={() => handleStatusToggle('completed')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Hoàn thành</span>
            </label>
          </div>
        </div>

        {/* Author Filter */}
        <div>
          <h4 className="font-medium mb-3">Tác giả</h4>
          <input
            type="text"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder="Nhập tên tác giả..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {authorInput && (
            <p className="text-xs text-gray-500 mt-1">
              Tìm kiếm sẽ tự động cập nhật...
            </p>
          )}
        </div>

        {/* Year Range Filter */}
        <div>
          <h4 className="font-medium mb-3">Năm phát hành</h4>
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2">Bộ lọc đang áp dụng:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.genres?.map(genreSlug => {
              const genre = genres.find(g => g.slug === genreSlug);
              return (
                <span
                  key={genreSlug}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {genre?.name || genreSlug}
                  <button
                    onClick={() => handleGenreToggle(genreSlug)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            
            {filters.status?.map(status => (
              <span
                key={status}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
              >
                {status === 'ongoing' ? 'Đang phát hành' : 'Hoàn thành'}
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            
            {filters.author && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Tác giả: {filters.author}
                <button
                  onClick={() => {
                    setAuthorInput('');
                    onChange({ ...filters, author: undefined });
                  }}
                  className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            
            {(filters.yearFrom || filters.yearTo) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                {filters.yearFrom || '...'} - {filters.yearTo || '...'}
                <button
                  onClick={() => onChange({
                    ...filters,
                    yearFrom: undefined,
                    yearTo: undefined
                  })}
                  className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Genre list loads from API
- [ ] Checkboxes work correctly
- [ ] Author input debounced
- [ ] Year validation
- [ ] Active filters display
- [ ] Remove filter chips work
- [ ] Clear all works
- [ ] Mobile responsive
- [ ] Keyboard accessible

---

### 2.2 SearchSortBar Component
**File:** `src/components/SearchSortBar.tsx`

**Purpose:** Dropdown để chọn cách sắp xếp results

**Tasks:**
- [ ] Create sort dropdown
- [ ] Sort options: Mới nhất, Xem nhiều nhất, Đánh giá cao, Tên A-Z
- [ ] Order toggle (asc/desc)
- [ ] Mobile friendly

**Component Structure:**
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import type { SortOptions } from '@/lib/search-engine';

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
    onChange({ ...sort, field });
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
    <div className={`flex items-center gap-2 ${className}`} ref={dropdownRef}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Sắp xếp:
      </span>
      
      {/* Sort Field Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <span>{currentOption?.label}</span>
          <span className="text-gray-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.field}
                onClick={() => handleSortChange(option.field)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  sort.field === option.field ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
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
        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        title={sort.order === 'desc' ? 'Giảm dần' : 'Tăng dần'}
      >
        {sort.order === 'desc' ? '↓' : '↑'}
      </button>
    </div>
  );
}
```

**Checklist:**
- [ ] Dropdown opens/closes correctly
- [ ] Click outside closes dropdown
- [ ] Current selection highlighted
- [ ] Order toggle works
- [ ] Mobile friendly
- [ ] Keyboard navigation

---

### 2.3 Update Search Page
**File:** `src/app/tim-kiem/page.tsx`

**Tasks:**
- [ ] Integrate SearchFiltersPanel
- [ ] Integrate SearchSortBar
- [ ] Update URL params when filters change
- [ ] Parse filters from URL on page load
- [ ] Reset to page 1 when filters change

**Implementation:** (Already included in Phase 1.2)

**Checklist:**
- [ ] Filters persist in URL
- [ ] Browser back/forward works
- [ ] Page refreshes correctly
- [ ] Filters reset works

---

## 🎯 PHASE 3: AUTOCOMPLETE & HISTORY (3-4 ngày) - PRIORITY: MEDIUM

### 3.1 SearchAutocomplete Component
**File:** `src/components/SearchAutocomplete.tsx`

**Purpose:** Dropdown gợi ý khi user đang gõ trong search box

**Strategy:** 
- Dùng cached search results để suggest
- Show search history từ localStorage
- Debounce để avoid quá nhiều searches

**Tasks:**
- [ ] Create autocomplete dropdown
- [ ] Show top 5 matching stories (from cache nếu có)
- [ ] Show recent search history
- [ ] Highlight matching text
- [ ] Keyboard navigation (Arrow keys, Enter, Esc)
- [ ] Click outside to close

**Component Structure:**
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { otruyenApi, type Story } from '@/lib/api';
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

  // Load history on mount
  useEffect(() => {
    const recentSearches = SearchHistory.get().map(item => item.query);
    setHistory(recentSearches.slice(0, 5));
  }, []);

  // Fetch suggestions (debounced)
  const fetchSuggestions = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Chỉ fetch page đầu tiên để quick suggest
      const response = await otruyenApi.searchStories(searchQuery, { 
        page: 1, 
        limit: 10 
      });
      
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
    
    if (value.trim()) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = history.length + suggestions.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === -1) {
          // No selection, search current query
          handleSearch(query);
        } else if (selectedIndex < history.length) {
          // Selected from history
          handleSearch(history[selectedIndex]);
        } else {
          // Selected from suggestions
          const story = suggestions[selectedIndex - history.length];
          router.push(`/truyen/${story.slug}`);
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
    if (!searchQuery.trim()) return;

    SearchHistory.add(searchQuery);
    setIsOpen(false);
    setQuery('');
    
    if (onSelect) {
      onSelect(searchQuery);
    } else {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery)}`);
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

  const showHistory = isOpen && query.trim() === '' && history.length > 0;
  const showSuggestions = isOpen && query.trim() !== '' && suggestions.length > 0;
  const showDropdown = showHistory || showSuggestions || (isOpen && isLoading);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm truyện..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        
        {/* Search Icon / Loading */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
        >
          {/* History Section */}
          {showHistory && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Lịch sử tìm kiếm</span>
                <button
                  onClick={() => {
                    SearchHistory.clear();
                    setHistory([]);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
              {history.map((item, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleSearch(item)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                    selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{item}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions Section */}
          {showSuggestions && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Kết quả gợi ý
              </div>
              {suggestions.map((story, index) => {
                const actualIndex = history.length + index;
                return (
                  <button
                    key={story.id || story._id}
                    onClick={() => router.push(`/truyen/${story.slug}`)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                      selectedIndex === actualIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-14 flex-shrink-0">
                        <Image
                          src={story.thumb_url ? `${API_CONFIG.CDN_URL}/uploads/comics/${story.thumb_url}` : '/placeholder.jpg'}
                          alt={story.name || story.title || ''}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {story.name || story.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {story.author?.join(', ')}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !showSuggestions && (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-sm">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && query.trim() && suggestions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Không tìm thấy truyện nào phù hợp</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Debounced search works
- [ ] History loads and displays
- [ ] Suggestions display correctly
- [ ] Keyboard navigation smooth
- [ ] Click outside closes
- [ ] Enter key submits search
- [ ] Story thumbnails load
- [ ] Mobile responsive
- [ ] Loading states clear
- [ ] Empty states helpful

---

### 3.2 Search History Manager
**File:** `src/lib/search-history.ts`

**Purpose:** Manage search history in localStorage

**Tasks:**
- [ ] Save search queries
- [ ] Limit to 20 recent searches
- [ ] Remove duplicates
- [ ] Clear history function
- [ ] Handle localStorage errors

**Implementation:**
```typescript
interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export class SearchHistory {
  private static readonly KEY = 'mtruyen_search_history';
  private static readonly MAX_ITEMS = 20;

  /**
   * Add a search query to history
   */
  static add(query: string): void {
    try {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return;

      const history = this.get();
      
      // Remove if already exists
      const filtered = history.filter(item => 
        item.query.toLowerCase() !== normalized
      );

      // Add to front
      filtered.unshift({
        query: query.trim(),
        timestamp: Date.now(),
      });

      // Limit size
      const limited = filtered.slice(0, this.MAX_ITEMS);

      // Save
      localStorage.setItem(this.KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('[SearchHistory] Failed to save:', error);
    }
  }

  /**
   * Get all search history
   */
  static get(): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('[SearchHistory] Failed to load:', error);
      return [];
    }
  }

  /**
   * Remove a specific query
   */
  static remove(query: string): void {
    try {
      const history = this.get();
      const filtered = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      localStorage.setItem(this.KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[SearchHistory] Failed to remove:', error);
    }
  }

  /**
   * Clear all history
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.KEY);
    } catch (error) {
      console.error('[SearchHistory] Failed to clear:', error);
    }
  }

  /**
   * Get recent searches (most recent first)
   */
  static getRecent(limit: number = 5): string[] {
    return this.get()
      .slice(0, limit)
      .map(item => item.query);
  }
}
```

**Checklist:**
- [ ] localStorage save/load works
- [ ] Duplicates removed
- [ ] Max items enforced
- [ ] Error handling robust
- [ ] Privacy mode handled

---

### 3.3 Update Navbar with Autocomplete
**File:** `src/components/Navbar.tsx`

**Tasks:**
- [ ] Replace plain input với SearchAutocomplete
- [ ] Handle selection
- [ ] Maintain existing styles

**Changes:**
```typescript
import SearchAutocomplete from './SearchAutocomplete';

// Replace the search input section with:
<SearchAutocomplete 
  onSelect={(query) => {
    router.push(`/tim-kiem?q=${encodeURIComponent(query)}`);
  }}
  className="hidden lg:block w-96"
/>
```

**Checklist:**
- [ ] Autocomplete integrates smoothly
- [ ] Styles match navbar
- [ ] Mobile: Consider full-screen modal
- [ ] Desktop: Dropdown works well

---

## 🎯 PHASE 4: UX ENHANCEMENTS (2-3 ngày) - PRIORITY: MEDIUM

### 4.1 Search Analytics
**File:** `src/lib/search-analytics.ts`

**Track:**
- [ ] Search queries (anonymized)
- [ ] Results clicked
- [ ] Empty search rate
- [ ] Popular search terms
- [ ] Search refinements

**Integration:**
```typescript
// In search results page
trackEvent('search_performed', {
  query: searchQuery,
  results_count: results.length,
  filters_used: Object.keys(filters).length,
});

// When user clicks result
trackEvent('search_result_clicked', {
  query: searchQuery,
  result_position: index,
  story_id: story.id,
});
```

---

### 4.2 Search Performance
**Tasks:**
- [ ] Implement request caching (5 min TTL)
- [ ] Optimize re-renders
- [ ] Virtual scrolling cho results (if >100 items)
- [ ] Lazy load images
- [ ] Prefetch next page results

**Optimization:**
```typescript
// Memoize search results
const memoizedResults = useMemo(() => {
  return filterAndSortResults(rawResults, filters);
}, [rawResults, filters]);

// Virtual list for large result sets
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

### 4.3 Empty States & Errors
**Tasks:**
- [ ] No results found UI với suggestions
- [ ] Search error state
- [ ] Network error fallback
- [ ] Retry mechanism
- [ ] Helpful error messages

**Empty State UI:**
```
+-----------------------------------+
|     [Icon: Empty Box]            |
|                                   |
|   Không tìm thấy truyện nào      |
|   phù hợp với "keyword"          |
|                                   |
|   Gợi ý:                         |
|   • Thử từ khóa khác             |
|   • Kiểm tra chính tả            |
|   • Dùng bộ lọc nâng cao         |
|                                   |
|   [Xem truyện mới] [Xóa bộ lọc] |
+-----------------------------------+
```

---

### 4.4 Mobile Experience
**Tasks:**
- [ ] Full-screen search modal trên mobile
- [ ] Sticky search bar khi scroll
- [ ] Swipe to close search
- [ ] Bottom sheet for filters
- [ ] Touch-friendly filter controls

---

## 🧪 TESTING

### Unit Tests
- [ ] `useSearch.test.ts` - Hook logic
- [ ] `search-history.test.ts` - History management
- [ ] `SearchAutocomplete.test.tsx` - Component behavior

### Integration Tests
- [ ] Search flow: input → results → detail
- [ ] Filter application
- [ ] Pagination
- [ ] History functionality

### E2E Tests (Playwright)
- [ ] Complete search journey
- [ ] Mobile search flow
- [ ] Keyboard navigation
- [ ] Empty state handling

### Performance Tests
- [ ] Large result sets (1000+ items)
- [ ] Rapid typing (debounce test)
- [ ] Multiple filters applied
- [ ] Memory leaks check

---

## 📝 DOCUMENTATION

### User Docs
- [ ] How to use search (FAQ)
- [ ] Advanced search guide
- [ ] Search tips & tricks
- [ ] Keyboard shortcuts

### Developer Docs
- [ ] Search API documentation
- [ ] Hook usage examples
- [ ] Component props reference
- [ ] Architecture diagram

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-launch
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (WAVE, axe)
- [ ] Cross-browser testing
- [ ] Mobile device testing

### Monitoring
- [ ] Setup search analytics
- [ ] Track error rates
- [ ] Monitor API performance
- [ ] User feedback collection

### Post-launch
- [ ] Monitor search queries
- [ ] A/B test search UX variants
- [ ] Gather user feedback
- [ ] Iterate based on data

---

## 🔍 API LIMITATIONS & CLIENT-SIDE STRATEGY

### Current API Support
API `otruyenapi.com` chỉ support:
```typescript
searchStories(keyword: string, params?: {
  page?: number;
  limit?: number;
})
```

### Client-Side Filtering Strategy

**Approach:**
1. API search chỉ dùng cho keyword matching
2. Fetch 2-3 pages đầu (40-60 stories) để có dataset đủ lớn
3. Apply filters, sort ở client-side
4. Client-side pagination từ filtered results
5. Cache heavily để avoid re-fetching

**Pros:**
- ✅ Works với current API (no backend changes)
- ✅ Instant filter/sort (no loading)
- ✅ Flexible filtering logic
- ✅ Good UX với proper caching

**Cons:**
- ⚠️ Limited dataset (chỉ 60 stories đầu tiên)
- ⚠️ Không scale với very specific searches
- ⚠️ Initial fetch slower (2-3 API calls)

**Optimizations:**
```typescript
// Parallel fetching
const fetchMultiplePages = async (keyword: string, maxPages: number = 3) => {
  const promises = Array.from({ length: maxPages }, (_, i) =>
    otruyenApi.searchStories(keyword, { page: i + 1, limit: 20 })
  );
  
  const results = await Promise.all(promises);
  return results.flatMap(r => r?.items || []);
};

// Smart caching
const cacheKey = `search:${keyword.toLowerCase().trim()}`;
const cachedResults = getCache<Story[]>(cacheKey);

if (cachedResults && Date.now() - cachedResults.timestamp < 5 * 60 * 1000) {
  // Use cache if less than 5 minutes old
  return filterAndSort(cachedResults.data, filters, sort);
}

// Fetch và cache
const freshResults = await fetchMultiplePages(keyword);
setCache(cacheKey, freshResults);
return filterAndSort(freshResults, filters, sort);
```

**Trade-offs:**
- Fetching 3 pages = 60 results (reasonable dataset)
- 5 minute cache = good balance (fresh but not excessive)
- Client filtering = instant UX
- Works well cho 90% of searches

**Future Enhancement:**
Nếu cần scale, có thể:
1. Build middleware API với Algolia/Elasticsearch
2. Pre-index all stories
3. Support server-side filtering
4. But requires backend infrastructure

---

## 📊 SUCCESS METRICS

### User Engagement
- Search usage rate (% of visitors using search)
- Search success rate (% searches with clicks)
- Average results per search
- Filter usage rate

### Performance
- Search response time (target: <500ms)
- Autocomplete response time (target: <200ms)
- Cache hit rate (target: >60%)

### Quality
- Zero-result rate (target: <15%)
- Search refinement rate
- Popular search terms
- User satisfaction score

---

## 🎯 PRIORITIZATION

### Must Have (MVP)
1. Basic search page với results
2. Integration với Navbar
3. Pagination
4. Loading & error states
5. Mobile responsive

### Should Have
1. Advanced filters (genre, status)
2. Autocomplete
3. Search history
4. Sort options

### Nice to Have
1. Search analytics
2. Trending searches
3. Search suggestions
4. Related stories
5. Export search results

---

## 📅 TIMELINE ESTIMATE

### Week 1: Foundation
- Days 1-2: Search page & hook
- Days 3-4: Navbar integration
- Day 5: Testing & bug fixes

### Week 2: Advanced Features
- Days 1-2: Advanced filters
- Days 3-4: Autocomplete
- Day 5: Search history

### Week 3: Polish & Testing
- Days 1-2: UX enhancements
- Days 3-4: Testing & optimization
- Day 5: Documentation & deployment

**Total: 15 working days (3 weeks)**

---

## 🔗 DEPENDENCIES

### External Dependencies
- Next.js routing
- API client (`otruyenApi`)
- Cache system
- Analytics system

### Internal Dependencies
- StoryGrid/StoryList components
- Pagination component
- Loading skeletons
- Error boundaries

### New Dependencies (if needed)
```json
{
  "match-sorter": "^6.3.1",      // For autocomplete filtering
  "fuse.js": "^7.0.0",           // Fuzzy search (optional)
  "react-window": "^1.8.10"      // Virtual scrolling (optional)
}
```

---

## 📌 NOTES

### Best Practices
- Always debounce search inputs
- Cache search results
- Provide clear feedback (loading, errors)
- Make filters obvious and easy to use
- Test với diverse search queries
- Optimize for mobile-first

### Common Pitfalls
- ❌ Not debouncing → too many API calls
- ❌ Not canceling previous requests → race conditions
- ❌ No empty states → confused users
- ❌ Too many filters → analysis paralysis
- ❌ Not mobile optimized → poor UX

### Future Enhancements
- Voice search
- Image search (search by cover)
- AI-powered recommendations
- Multi-language search
- Search within story content
- Save search queries (favorites)

---

**Last Updated:** 18/01/2026  
**Status:** TODO  
**Owner:** [Your Name]  
**Reviewers:** [Team]

---

## ✅ CHECKLIST SUMMARY

### Phase 1: Core Search (Week 1)
```markdown
- [x] Create SearchEngine class (`src/lib/search-engine.ts`)
  - [x] Parallel page fetching
  - [x] Client-side filtering (genre, status, author, year)
  - [x] Client-side sorting (views, rating, date, name)
  - [x] Caching mechanism (5min TTL)
  - [x] Pagination logic
  - [x] Unit tests
- [x] Create Search Results Page (`src/app/tim-kiem/page.tsx`)
  - [x] Layout và UI
  - [x] Integrate SearchEngine
  - [x] URL params sync
  - [x] Loading states
  - [x] Empty states
  - [x] Error handling
  - [x] SEO meta tags
- [x] Update Navbar (`src/components/Navbar.tsx`)
  - [x] Navigate to search page
  - [x] Clear input after search
  - [x] Mobile experience
```

### Phase 2: Advanced Filters (Week 2)
```markdown
- [x] Create SearchFiltersPanel (`src/components/SearchFiltersPanel.tsx`)
  - [x] Genre multi-select với checkboxes
  - [x] Status checkboxes (ongoing/completed)
  - [x] Author input với debounce
  - [x] Year range inputs
  - [x] Active filters chips
  - [x] Clear all button
  - [x] Mobile responsive

- [x] Create SearchSortBar (`src/components/SearchSortBar.tsx`)
  - [x] Sort dropdown (newest, views, rating, name)
  - [x] Order toggle (asc/desc)
  - [x] Mobile friendly

- [x] Integrate filters vào Search Page
  - [x] URL params for filters
  - [x] Browser back/forward support
  - [x] Reset to page 1 on filter change
```

### Phase 3: Autocomplete & History (Week 2-3)
```markdown
- [ ] Create SearchAutocomplete (`src/components/SearchAutocomplete.tsx`)
  - [ ] Debounced suggestions (300ms)
  - [ ] Show recent searches from history
  - [ ] Show top matching stories
  - [ ] Keyboard navigation (arrows, enter, esc)
  - [ ] Click outside to close
  - [ ] Loading state
  - [ ] Empty state

- [ ] Create SearchHistory (`src/lib/search-history.ts`)
  - [ ] Save to localStorage
  - [ ] Max 20 items
  - [ ] Remove duplicates
  - [ ] Clear function
  - [ ] Error handling

- [ ] Integrate Autocomplete vào Navbar
  - [ ] Replace plain input
  - [ ] Handle selection
  - [ ] Mobile full-screen modal (optional)
```

### Phase 4: Testing & Polish (Week 3)
```markdown
- [ ] Unit Tests
  - [ ] SearchEngine class tests
  - [ ] Filter logic tests
  - [ ] Sort logic tests
  - [ ] SearchHistory tests

- [ ] Integration Tests
  - [ ] Search flow end-to-end
  - [ ] Filter application
  - [ ] URL params sync
  - [ ] Browser navigation

- [ ] Performance
  - [ ] Lighthouse audit
  - [ ] Bundle size check
  - [ ] Cache hit rate monitoring
  - [ ] Memory leak check

- [ ] Cross-browser Testing
  - [ ] Chrome, Firefox, Safari, Edge
  - [ ] Mobile browsers (iOS Safari, Chrome Mobile)

- [ ] Documentation
  - [ ] User guide (how to search)
  - [ ] Developer docs (API reference)
  - [ ] Code comments (JSDoc)
```

---

## 📅 DETAILED TIMELINE

### Week 1: Foundation (5 days)
**Day 1-2: Core Search Engine**
- Morning: Design SearchEngine class structure
- Afternoon: Implement fetch + caching
- Next day: Implement filtering + sorting + tests

**Day 3: Search Results Page**
- Morning: Page layout + StoryGrid integration
- Afternoon: URL params + pagination

**Day 4: Integration + Polish**
- Morning: Update Navbar
- Afternoon: Loading states, error handling

**Day 5: Testing + Bug Fixes**
- Full day: Test everything, fix bugs

### Week 2: Advanced Features (5 days)
**Day 1-2: Filter Panel**
- Day 1: Genre + Status filters
- Day 2: Author + Year filters + Active chips

**Day 3: Sort Bar + Integration**
- Morning: Sort dropdown component
- Afternoon: Integrate all filters vào search page

**Day 4-5: Autocomplete**
- Day 4: SearchAutocomplete component + SearchHistory
- Day 5: Integration + keyboard navigation

### Week 3: Polish & Deploy (3-5 days)
**Day 1-2: Testing**
- Unit tests
- Integration tests
- Performance testing

**Day 3: Documentation**
- User guide
- Code documentation
- README updates

**Day 4-5: Final Polish + Deploy**
- Cross-browser testing
- Mobile testing
- Bug fixes
- Deploy to production

**Total: 13-15 working days (~3 weeks)**

---