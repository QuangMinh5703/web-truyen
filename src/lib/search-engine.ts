
import { otruyenApi, Story, ListResponse, Genre } from '@/lib/api';

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
  maxPagesToFetch?: number;
  cacheTimeout?: number;
  resultsPerPage?: number;
}

interface CachedResults {
  keyword: string;
  stories: Story[];
  timestamp: number;
}

export interface SearchResults {
  stories: Story[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  filters: SearchFilters;
  sort: SortOptions;
}

class SearchEngine {
  private cache: Map<string, CachedResults>;
  private options: SearchEngineOptions;

  constructor(options?: SearchEngineOptions) {
    this.cache = new Map();
    this.options = {
      maxPagesToFetch: 3,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      resultsPerPage: 20,
      ...options,
    };
  }

  async search(
    keyword: string,
    filters: SearchFilters = {},
    sort: SortOptions = { field: 'updatedAt', order: 'desc' },
    page: number = 1
  ): Promise<SearchResults> {
    const allStories = await this.getCachedOrFetch(keyword);
    
    const filteredStories = this.filterResults(allStories, filters);
    const sortedStories = this.sortResults(filteredStories, sort);
    
    return this.paginateResults(sortedStories, page, filters, sort);
  }

  private async fetchAllPages(
    keyword: string,
    maxPages: number
  ): Promise<Story[]> {
    const allStories: Story[] = [];
    const promises: Promise<ListResponse<Story> | undefined>[] = [];

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

  private filterResults(
    stories: Story[],
    filters: SearchFilters
  ): Story[] {
    return stories.filter(story => {
      if (filters.genres && filters.genres.length > 0) {
        const storyGenres = story.category?.map(g => g.slug || g.name.toLowerCase()) || [];
        const hasMatchingGenre = filters.genres.some(filterGenre =>
          storyGenres.includes(filterGenre.toLowerCase())
        );
        if (!hasMatchingGenre) return false;
      }

      if (filters.status && filters.status.length > 0) {
        const storyStatus = this.normalizeStatus(story.status);
        if (!filters.status.includes(storyStatus)) return false;
      }

      if (filters.author) {
        const authorText = (story.author || []).join(' ').toLowerCase();
        if (!authorText.includes(filters.author.toLowerCase())) {
          return false;
        }
      }
      
      if (filters.yearFrom || filters.yearTo) {
          const storyYear = story.createdAt
            ? new Date(story.createdAt).getFullYear()
            : null;
          
          if (storyYear) {
            if (filters.yearFrom && storyYear < filters.yearFrom) return false;
            if (filters.yearTo && storyYear > filters.yearTo) return false;
          } else {
              // If story has no year, it shouldn't match a year filter
              return false;
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

  private sortResults(
    stories: Story[],
    sort: SortOptions
  ): Story[] {
    return [...stories].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'views':
          comparison = (b.views || 0) - (a.views || 0);
          break;
        
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        
        case 'updatedAt':
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          comparison = dateB - dateA;
          break;
        
        case 'name':
          const nameA = a.name || a.title || '';
          const nameB = b.name || b.title || '';
          comparison = nameA.localeCompare(nameB, 'vi');
          break;
      }

      return sort.order === 'desc' ? comparison : -comparison;
    });
  }

  private paginateResults(
    stories: Story[],
    page: number,
    filters: SearchFilters,
    sort: SortOptions
  ): SearchResults {
    const limit = this.options.resultsPerPage || 20;
    const total = stories.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedStories = stories.slice(startIndex, endIndex);

    return {
      stories: paginatedStories,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
      filters,
      sort,
    };
  }

  private async getCachedOrFetch(keyword: string): Promise<Story[]> {
    const cacheKey = keyword.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);

    if (cached) {
      const isExpired = Date.now() - cached.timestamp > (this.options.cacheTimeout || 0);
      if (!isExpired) {
        console.log('[SearchEngine] Using cached results for:', keyword);
        return Promise.resolve(cached.stories);
      }
    }

    console.log('[SearchEngine] Fetching new results for:', keyword);
    const stories = await this.fetchAllPages(keyword, this.options.maxPagesToFetch || 3);
    
    this.cache.set(cacheKey, {
      keyword: cacheKey,
      stories,
      timestamp: Date.now(),
    });
    return stories;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('[SearchEngine] Cache cleared.');
  }
}

export const searchEngine = new SearchEngine();
