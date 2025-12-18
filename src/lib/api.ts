/**
 * API Service cho otruyenapi.com
 * Base URL: https://otruyenapi.com/v1/api/
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://otruyenapi.com/v1/api';

// Types cho API responses
export interface Story {
  id?: string;
  _id?: string;
  name?: string; // Tên truyện từ API
  title?: string; // Alias cho name
  slug?: string;
  description?: string;
  author?: string;
  cover?: string;
  thumbnail?: string;
  thumb_url?: string; // Tên file ảnh từ API
  origin_name?: string[];
  status?: 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat';
  category?: Genre[]; // Thể loại từ API
  genres?: string[] | Genre[];
  chapters?: Chapter[];
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
  content?: string;
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
  [key: string]: any;
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

/**
 * API Client class để quản lý tất cả các API calls
 */
class OtruyenApi {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Helper method để thực hiện fetch request
   */
import { getCache, setCache } from './cache';
.
.
.
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    timeoutMs: number = 15000 // Default timeout of 15 seconds
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const cachedData = getCache<ApiResponse<T>>(url);
    if (cachedData) {
        console.log(`[API] Cache hit for: ${url}`);
        return cachedData;
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[API] Fetching: ${url}`);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal, // Pass the signal to the fetch request
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(id); // Clear the timeout if the fetch completes in time

      if (!response.ok) {
        console.error(`[API] HTTP error! status: ${response.status}`, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCache(url, data);
.
.
.
      console.log(`[API] Response from ${endpoint}:`, data);
      console.log(`[API] Response type:`, typeof data);
      console.log(`[API] Is array:`, Array.isArray(data));
      
      // Xử lý các format response khác nhau
      // Nếu response là array trực tiếp
      if (Array.isArray(data)) {
        console.log(`[API] Returning array directly, length:`, data.length);
        return { data: data as T, success: true } as ApiResponse<T>;
      }
      
      // Nếu có data field (cấu trúc: {status, message, data: {items: [...]}})
      if (data.data !== undefined) {
        console.log(`[API] Found data field, type:`, typeof data.data, 'isArray:', Array.isArray(data.data));
        // Nếu data.data là object và có items field
        if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          if (data.data.items !== undefined) {
            console.log(`[API] Found data.items field, isArray:`, Array.isArray(data.data.items));
            return { ...data, data: data.data.items as T } as ApiResponse<T>;
          }
          if (data.data.data !== undefined) {
            return { ...data, data: data.data.data as T } as ApiResponse<T>;
          }
        }
        return { ...data, data: data.data as T } as ApiResponse<T>;
      }
      
      // Nếu có items field
      if (data.items !== undefined) {
        console.log(`[API] Found items field, type:`, typeof data.items, 'isArray:', Array.isArray(data.items));
        return { ...data, data: data.items as T } as ApiResponse<T>;
      }
      
      // Nếu có results field
      if (data.results !== undefined) {
        console.log(`[API] Found results field, type:`, typeof data.results, 'isArray:', Array.isArray(data.results));
        return { ...data, data: data.results as T } as ApiResponse<T>;
      }
      
      // Nếu có list field (một số API dùng)
      if (data.list !== undefined) {
        console.log(`[API] Found list field, type:`, typeof data.list, 'isArray:', Array.isArray(data.list));
        return { ...data, data: data.list as T } as ApiResponse<T>;
      }
      
      // Nếu có stories field
      if (data.stories !== undefined) {
        console.log(`[API] Found stories field, type:`, typeof data.stories, 'isArray:', Array.isArray(data.stories));
        return { ...data, data: data.stories as T } as ApiResponse<T>;
      }
      
      console.log(`[API] Returning data as-is`);
      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`[API] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Helper để extract data từ response
   */
  private extractData<T>(response: ApiResponse<T>): T {
    if (Array.isArray(response)) {
      return response as T;
    }
    if (response.data) return response.data;
    if (response.items) return response.items as T;
    if (response.results) return response.results as T;
    return response as T;
  }

  /**
   * Lấy danh sách truyện tại trang chủ
   * GET /home
   */
  async getHomeStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/home${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch<Story[]>(endpoint);
  }

  /**
   * Lấy danh sách truyện theo type
   * GET /danh-sach/{type}
   * type: truyen-moi, sap-ra-mat, dang-phat-hanh, hoan-thanh
   */
  async getStoriesByType(
    type: StoryListType = 'truyen-moi',
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<Story[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/danh-sach/${type}${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch<Story[]>(endpoint);
  }

  /**
   * Lấy danh sách truyện (deprecated - dùng getHomeStories hoặc getStoriesByType)
   */
  async getStories(params?: SearchParams): Promise<ApiResponse<Story[]>> {
    return this.getHomeStories({ page: params?.page, limit: params?.limit });
  }

  /**
   * Lấy thông tin truyện theo slug
   * GET /truyen-tranh/{slug}
   */
  async getStoryBySlug(slug: string): Promise<ApiResponse<Story>> {
    return this.fetch<Story>(`/v1/truyen-moi/manga/${slug}`);
  }

  /**
   * Lấy chi tiết truyện theo ID hoặc slug (alias)
   */
  async getStoryById(idOrSlug: string): Promise<ApiResponse<Story>> {
    return this.getStoryBySlug(idOrSlug);
  }

  /**
   * Tìm kiếm truyện
   * GET /tim-kiem?keyword=...
   */
  async searchStories(keyword: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/tim-kiem?${queryString}`;
    
    return this.fetch<Story[]>(endpoint);
  }

  /**
   * Lấy danh sách chương của truyện
   * Có thể từ thông tin truyện hoặc endpoint riêng
   * Tạm thời giả định có endpoint /truyen-tranh/{slug}/chapters hoặc từ story detail
   */
  async getChapters(storySlug: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<Chapter[]>> {
    // Có thể cần lấy từ story detail trước, hoặc có endpoint riêng
    // Tạm thời trả về empty, cần kiểm tra API thực tế
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    // Giả định endpoint, có thể cần điều chỉnh
    const endpoint = `/truyen-tranh/${storySlug}/chapters${queryString ? `?${queryString}` : ''}`;
    
    try {
      return await this.fetch<Chapter[]>(endpoint);
    } catch {
      // Nếu không có endpoint riêng, trả về empty
      return { data: [], success: true } as ApiResponse<Chapter[]>;
    }
  }

  /**
   * Lấy chi tiết chương
   * Có thể là /truyen-tranh/{slug}/chuong/{chapterSlug} hoặc tương tự
   */
  async getChapterById(chapterId: string): Promise<ApiResponse<Chapter>> {
    // This method needs to be aligned with the actual API endpoint for chapter details.
    // Assuming the API provides chapter content directly via this endpoint.
    return this.fetch<Chapter>(`/chapter/${chapterId}`);
  }

  /**
   * Lấy nội dung đầy đủ của chương theo ID
   * GET /chapter/{chapterId}
   */
  async getChapterContentById(chapterId: string): Promise<ApiResponse<Chapter>> {
    return this.fetch<Chapter>(`/chapter/${chapterId}`);
  }

  /**
   * Lấy nội dung chương theo story slug và chapter number
   */
  async getChapterByNumber(storySlug: string, chapterNumber: number): Promise<ApiResponse<Chapter>> {
    try {
      return await this.fetch<Chapter>(`/v1/truyen-moi/manga/${storySlug}/chapter/${chapterNumber}`);
    } catch {
      throw new Error('Chapter endpoint not found');
    }
  }

  /**
   * Lấy danh sách thể loại
   * GET /the-loai
   */
  async getGenres(): Promise<ApiResponse<Genre[]>> {
    return this.fetch<Genre[]>(`/the-loai`);
  }

  /**
   * Lấy danh sách truyện của thể loại
   * GET /the-loai/{slug}
   */
  async getStoriesByGenre(genreSlug: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/the-loai/${genreSlug}${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch<Story[]>(endpoint);
  }

  /**
   * Lấy chi tiết thể loại (alias - có thể không có endpoint riêng)
   */
  async getGenreById(slug: string): Promise<ApiResponse<Genre>> {
    // Nếu không có endpoint riêng, có thể lấy từ danh sách
    const response = await this.getGenres();
    if (response.data) {
      const genre = (response.data as Genre[]).find(g => g.slug === slug || g.id === slug);
      if (genre) {
        return { data: genre, success: true } as ApiResponse<Genre>;
      }
    }
    throw new Error('Genre not found');
  }

  /**
   * Lấy truyện mới cập nhật (sử dụng /danh-sach/truyen-moi)
   */
  async getLatestStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    return this.getStoriesByType('truyen-moi', params);
  }

  /**
   * Lấy truyện phổ biến (sử dụng /home)
   */
  async getPopularStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    return this.getHomeStories(params);
  }

  /**
   * Lấy truyện xem nhiều nhất (sử dụng /home hoặc có thể là endpoint riêng)
   */
  async getTopViewedStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    // Có thể API có endpoint riêng, nhưng tạm thời dùng /home
    return this.getHomeStories(params);
  }

  /**
   * Lấy truyện đánh giá cao nhất (sử dụng /home)
   */
  async getTopRatedStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    return this.getHomeStories(params);
  }

  /**
   * Lấy truyện đang phát hành
   */
  async getOngoingStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    return this.getStoriesByType('dang-phat-hanh', params);
  }

  /**
   * Lấy truyện đã hoàn thành
   */
  async getCompletedStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    return this.getStoriesByType('hoan-thanh', params);
  }

  /**
   * Lấy truyện mới thêm (sử dụng /danh-sach/truyen-moi)
   */
  async getNewStories(params?: { page?: number; limit?: number }): Promise<ApiResponse<Story[]>> {
    return this.getStoriesByType('truyen-moi', params);
  }

  /**
   * Lấy truyện liên quan (có thể không có endpoint riêng, tạm thời trả về empty)
   */
  async getRelatedStories(storyId: string, params?: { limit?: number }): Promise<ApiResponse<Story[]>> {
    // Có thể API không có endpoint này, trả về empty array
    return { data: [], success: true } as ApiResponse<Story[]>;
  }
}

// Export singleton instance
export const otruyenApi = new OtruyenApi();

// Export class để có thể tạo instance mới nếu cần
export default OtruyenApi;

