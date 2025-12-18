/**
 * API Endpoints constants cho otruyenapi.com
 * Base URL: https://otruyenapi.com/v1/api/
 */

export const API_ENDPOINTS = {
  // Stories endpoints
  STORIES: {
    LIST: '/stories',
    DETAIL: (id: string) => `/stories/${id}`,
    BY_SLUG: (slug: string) => `/stories/slug/${slug}`,
    SEARCH: '/stories/search',
    LATEST: '/stories/latest',
    POPULAR: '/stories/popular',
    TOP_VIEWS: '/stories/top-views',
    TOP_RATED: '/stories/top-rated',
    ONGOING: '/stories/ongoing',
    COMPLETED: '/stories/completed',
    NEW: '/stories/new',
    RELATED: (id: string) => `/stories/${id}/related`,
    CHAPTERS: (storyId: string) => `/stories/${storyId}/chapters`,
    CHAPTER_BY_NUMBER: (storyId: string, chapterNumber: number) => 
      `/stories/${storyId}/chapters/${chapterNumber}`,
  },

  // Chapters endpoints
  CHAPTERS: {
    DETAIL: (id: string) => `/chapters/${id}`,
  },

  // Genres endpoints
  GENRES: {
    LIST: '/genres',
    DETAIL: (id: string) => `/genres/${id}`,
    STORIES: (id: string) => `/genres/${id}/stories`,
  },
} as const;

/**
 * Query parameters helpers
 */
export const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams.toString();
};

