/**
 * @file API Service for otruyenapi.com
 * @author Gemini
 * @see https://docs.otruyenapi.com/
 */
import { getCache, setCache, removeCache, clearCache } from '@/lib/cache';
import { API_CONFIG } from './api-config';

const { BASE_URL, ENDPOINTS } = API_CONFIG;

// Types cho API responses
export interface Story {
  id?: string;
  _id?: string;
  name?: string; // Tên truyện từ API
  title?: string; // Alias cho name
  slug?: string;
  description?: string;
  author?: string[];
  cover?: string;
  thumbnail?: string;
  thumb_url?: string; // Tên file ảnh từ API
  origin_name?: string[];
  status?: 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat';
  category?: Genre[]; // Thể loại từ API
  genres?: string[] | Genre[];
  chapters?: Array<{
    server_name?: string;
    server_data?: ApiChapter[];
  }>;
  totalChapters?: number;
  views?: number;
  rating?: number;
  updatedAt?: string;
  createdAt?: string;
  chaptersLatest?: Array<{
    filename?: string;
    chapter_name?: string;
    chapter_title?: string;
    chapter_api_data?: string;
  }>;
  lastChapter?: {
    id?: string;
    title?: string;
    chapterNumber?: number;
    slug?: string;
  };
}

export interface Chapter {
  id?: string;
  _id?: string;
  storyId?: string;
  name?: string;
  title: string;
  chapterNumber?: number;
  slug?: string;
  images?: string[];
  views?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface Genre {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  storyCount?: number;
  totalStories?: number;
}

// Response structure có thể khác nhau tùy API
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  items?: T;
  results?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Nếu API trả về trực tiếp array
  [key: string]: unknown;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  keyword?: string;
  genre?: string;
  status?: string;
}

export type StoryListType = 'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface ApiChapter {
  id: string; // Added ID
  filename?: string;
  chapter_name?: string;
  chapter_title?: string;
  chapter_api_data?: string;
}

export interface UiChapter {
  id: string;
  name: string;
  title: string;
}

/**
 * Constructs the full image URL from a given path.
 * If the path is already a full URL, it returns it as is.
 * Otherwise, it prepends the CDN URL.
 * @param path - The image path from the API.
 * @returns The full image URL.
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  // If the path is already a full URL, return it as is.
  if (path.startsWith('http')) return path;
  // If the path starts with /uploads, it's likely from the chapter image list.
  if (path.startsWith('/uploads/')) {
    return `${API_CONFIG.CDN_URL}${path}`;
  }
  // Otherwise, assume it's a thumbnail filename and prepend the full path.
  return `${API_CONFIG.CDN_URL}/uploads/comics/${path}`;
}

/**
 * API client class to manage all API calls to otruyenapi.com.
 * It handles caching, error handling, and response normalization.
 */
class OtruyenApi {
  private baseUrl: string;

  /**
   * Creates an instance of OtruyenApi.
   * @param {string} [baseUrl=BASE_URL] - The base URL for the API.
   */
  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch method with caching, timeout, and error handling.
   * @template T
   * @param {string} endpoint - The API endpoint to call.
   * @param {RequestInit} [options] - Optional fetch options.
   * @param {number} [timeoutMs=15000] - Timeout in milliseconds.
   * @returns {Promise<ApiResponse<T>>} A promise that resolves to the API response.
   * @private
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Do not return from cache if the request is specifically for non-cached data
    const cache_policy = options?.cache;
    if (cache_policy !== 'no-store') {
      const cachedData = getCache(url);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        referrerPolicy: 'no-referrer',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        console.error(`[API] HTTP error! status: ${response.status}`, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract and normalize pagination info from the diverse API responses
      const apiPagination = data.data?.params?.pagination;
      if (apiPagination) {
        data.pagination = {
          page: apiPagination.currentPage,
          limit: apiPagination.totalItemsPerPage,
          total: apiPagination.totalItems,
          totalPages: Math.ceil(apiPagination.totalItems / apiPagination.totalItemsPerPage),
        };
      }

      // Don't cache aborted requests or non-cacheable requests
      if (options?.signal?.aborted || cache_policy === 'no-store') {
        // We don't throw an error for aborted requests, as it's an expected state.
        // The calling function should handle the aborted state.
      } else {
        setCache(url, data);
      }

      return data as ApiResponse<T>;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Silently ignore abort errors as they are expected.
      } else {
        console.error(`[API] Error fetching ${endpoint}:`, error);
      }
      throw error;
    }
  }

  /**
   * Extracts a single data item (e.g., a Story or Chapter) from the API response.
   * @template T
   * @param {ApiResponse<T>} response - The API response.
   * @returns {T | undefined} The extracted data item.
   * @private
   */
  private extractSingleData<T>(response: ApiResponse<T>): T | undefined {
    const data = response.data as { item?: T } | undefined;
    return data?.item;
  }

  /**
   * Extracts a list of data items and pagination info from the API response.
   * @template T
   * @param {ApiResponse<T[]>} response - The API response containing a list.
   * @returns {ListResponse<T> | undefined} An object with items and pagination, or undefined.
   * @private
   */
  private extractListData<T>(response: ApiResponse<T[]>): ListResponse<T> | undefined {
    // The API returns lists in different properties, so we check multiple possibilities.
    const data = response.data as { items?: T[]; stories?: T[] } | T[] | undefined;
    const items = (data as any)?.items || (data as any)?.stories || (Array.isArray(data) ? data : undefined);
    const pagination = response.pagination;

    if (items && pagination) {
      return { items, pagination };
    }
    return undefined;
  }

  /**
   * Fetches the list of stories for the homepage.
   * @param {object} [params] - Optional parameters.
   * @param {number} [params.page] - The page number to fetch.
   * @param {number} [params.limit] - The number of items per page.
   * @returns {Promise<ListResponse<Story> | undefined>} A list of stories with pagination.
   */
  async getHomeStories(params?: { page?: number; limit?: number }): Promise<ListResponse<Story> | undefined> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `${ENDPOINTS.HOME}${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<Story[]>(endpoint);
    return this.extractListData(response);
  }

  /**
   * Fetches a list of stories based on a specific type.
   * @param {StoryListType} [type='truyen-moi'] - The type of story list (e.g., 'truyen-moi', 'hoan-thanh').
   * @param {object} [params] - Optional parameters.
   * @param {number} [params.page] - The page number to fetch.
   * @param {number} [params.limit] - The number of items per page.
   * @returns {Promise<ListResponse<Story> | undefined>} A list of stories with pagination.
   */
  async getStoriesByType(
    type: StoryListType = 'truyen-moi',
    params?: { page?: number; limit?: number }
  ): Promise<ListResponse<Story> | undefined> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `${ENDPOINTS.LIST}/${type}${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<Story[]>(endpoint);
    return this.extractListData(response);
  }

  /**
   * Fetches the detailed information for a single story by its slug.
   * @param {string} slug - The story's unique slug.
   * @returns {Promise<Story | undefined>} The story object or undefined if not found.
   */
  async getStoryBySlug(slug: string, options?: RequestInit): Promise<Story | undefined> {
    const response = await this.fetch<Story>(`${ENDPOINTS.DETAIL}/${slug}`, options);
    return this.extractSingleData(response);
  }

  /**
   * Fetches the detailed information for a single story by its slug.
   * @param {string} slug - The story's unique slug.
   * @returns {Promise<Story | undefined>} The story object or undefined if not found.
   */
  async getCategory(slug: string, params: SearchParams = {}): Promise<ApiResponse<Story[]>> {
    const response = await this.fetch<Story>(`${ENDPOINTS.DETAIL}/${slug}`); // Removed 'options' as it's not in signature
    return this.extractSingleData(response) as unknown as ApiResponse<Story[]>; // Cast to match return type
  }

  /**
   * Searches for stories based on a keyword.
   * @param {string} keyword - The search term.
   * @param {object} [params] - Optional parameters.
   * @param {number} [params.page] - The page number for pagination.
   * @param {number} [params.limit] - The number of results per page.
   * @returns {Promise<ListResponse<Story> | undefined>} A list of matching stories with pagination.
   */
  async searchStories(keyword: string, params?: { page?: number; limit?: number }): Promise<ListResponse<Story> | undefined> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `${ENDPOINTS.SEARCH}?${queryString}`;

    const response = await this.fetch<Story[]>(endpoint);
    return this.extractListData(response);
  }

  /**
   * Fetches the list of all chapters for a given story from its details.
   * Note: This data is part of the `getStoryBySlug` response.
   * @param {string} storySlug - The slug of the story.
   * @returns {Promise<ApiChapter[] | undefined>} An array of chapter data.
   */
  async getChapters(storySlug: string): Promise<ApiChapter[] | undefined> {
    const story = await this.getStoryBySlug(storySlug);
    return story?.chapters?.flatMap(server => server.server_data).filter(Boolean) as ApiChapter[];
  }

  /**
   * Fetches the content (image list) of a specific chapter using its full API URL.
   * This URL is typically retrieved from the story's chapter list.
   * @param {string} chapterApiUrl - The full URL to the chapter's data API endpoint.
   * @returns {Promise<Chapter | undefined>} The chapter object with its images.
   */
  async getChapterByUrl(chapterApiUrl: string, options?: RequestInit): Promise<Chapter | undefined> {
    if (!chapterApiUrl) {
      console.error("[API] getChapterByUrl received an empty URL.");
      return undefined;
    }
    const response = await this.fetch<unknown>(chapterApiUrl, options); // Fetch as unknown to handle raw structure
    const rawData = this.extractSingleData(response);
    const domainCdn = (response.data as { domain_cdn?: string })?.domain_cdn;

    if (rawData && domainCdn) {
      // Transform the raw data to match the application's Chapter type
      const chapter: Chapter = {
        id: (rawData as { _id: string })._id,
        _id: (rawData as { _id: string })._id,
        name: (rawData as { chapter_name: string }).chapter_name,
        title: (rawData as { chapter_title: string }).chapter_title,
        images: (rawData as { chapter_image: { image_file: string }[]; chapter_path: string }).chapter_image.map(
          (img: { image_file: string }) => `${domainCdn}/${(rawData as { chapter_path: string }).chapter_path}/${img.image_file}`
        ),
      };
      return chapter;
    }

    return undefined;
  }

  /**
   * Fetches the list of all available genres.
   * @returns {Promise<Genre[] | undefined>} A list of genres.
   */
  async getGenres(): Promise<Genre[] | undefined> {
    const response = await this.fetch<unknown>(ENDPOINTS.CATEGORY);
    const items = (response as { items?: Genre[] }).items || (Array.isArray(response) ? response : undefined);
    return items as Genre[];
  }

  /**
   * Fetches data for the home page (v1).
   * @returns {Promise<ApiResponse<Story[]>>}
   */
  async getAppHomeV1(): Promise<ApiResponse<Story[]>> {
    const response = await this.fetch<unknown>(ENDPOINTS.HOME);
    return response as ApiResponse<Story[]>;
  }

  /**
   * Fetches stories belonging to a specific genre.
   * @param {string} genreSlug - The slug of the genre.
   * @param {object} [params] - Optional parameters for pagination.
   * @returns {Promise<ListResponse<Story> | undefined>}
   */
  async getStoriesByGenre(genreSlug: string, params?: { page?: number; limit?: number }): Promise<ListResponse<Story> | undefined> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `${ENDPOINTS.CATEGORY}/${genreSlug}${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<Story[]>(endpoint);
    return this.extractListData(response);
  }

  async getLatestStories(params?: { page?: number; limit?: number }): Promise<ListResponse<Story> | undefined> {
    return this.getStoriesByType('truyen-moi', params);
  }

  async getOngoingStories(params?: { page?: number; limit?: number }): Promise<ListResponse<Story> | undefined> {
    return this.getStoriesByType('dang-phat-hanh', params);
  }

  async getCompletedStories(params?: { page?: number; limit?: number }): Promise<ListResponse<Story> | undefined> {
    return this.getStoriesByType('hoan-thanh', params);
  }

  invalidateCache(endpoint: string): void {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    removeCache(url);
  }

  clearAllCache(): void {
    clearCache();
  }
}

// Export a singleton instance for general use
export const otruyenApi = new OtruyenApi();

// Export the class for creating new instances if needed
export default OtruyenApi;


