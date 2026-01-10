/**
 * API Response Utilities
 * Helper functions for handling API responses
 */

import { ApiResponse, Story, Genre, UiStory, UiChapter, ApiChapter, ChapterContent } from './types';
import { getImageUrl } from './api';

/**
 * Extract single item from API response
 */
export function extractSingleItem<T>(response: ApiResponse<T>): T | undefined {
  if (!response?.data) return undefined;
  
  // Try data.item first
  if (response.data.item) return response.data.item;
  
  // Try data.items if it's an array with single item
  if (response.data.items && response.data.items.length === 1) {
    return response.data.items[0];
  }
  
  // Try data.stories if it's an array with single item
  if (response.data.stories && response.data.stories.length === 1) {
    return response.data.stories[0];
  }
  
  return undefined;
}

/**
 * Extract list items and pagination from API response
 */
export function extractListData<T>(
  response: ApiResponse<T[]>
): { items: T[]; pagination?: any } | undefined {
  if (!response?.data) return undefined;
  
  // Try different data structures
  let items: T[] | undefined;
  
  if (response.data.items && Array.isArray(response.data.items)) {
    items = response.data.items as T[];
  } else if (response.data.stories && Array.isArray(response.data.stories)) {
    items = response.data.stories as T[];
  } else if (Array.isArray(response.data)) {
    items = response.data as T[];
  }
  
  if (!items) return undefined;
  
  // Extract pagination from different possible locations
  const pagination = response.pagination || 
    response.data.params?.pagination || {
      page: 1,
      limit: items.length,
      total: items.length,
      totalPages: 1
    };
  
  return { items, pagination };
}

/**
 * Transform API Story to UI Story
 */
export function transformToUiStory(apiStory: Story): UiStory {
  const cover = getImageUrl(apiStory.cover || apiStory.thumb_url || '');
  const genres = Array.isArray(apiStory.genres) ? apiStory.genres : [];
  const genreNames = Array.isArray(apiStory.genre) 
    ? apiStory.genre.map(g => g.name) 
    : genres;
  
  return {
    id: apiStory._id,
    title: apiStory.name,
    slug: apiStory.slug,
    description: apiStory.description || '',
    author: apiStory.author || [],
    genres: genreNames,
    status: apiStory.status,
    cover,
    thumb_url: apiStory.thumb_url,
    rating: apiStory.rating,
    views: apiStory.views,
    followers: apiStory.followers,
    updatedAt: apiStory.updatedAt,
    createdAt: apiStory.createdAt,
    latestChapter: apiStory.chaptersLatest?.[0]?.chapter_name,
    totalChapters: apiStory.totalChapters || apiStory.chaptersLatest?.length || 0
  };
}

/**
 * Extract chapter ID from chapter API data URL
 */
export function getChapterIdFromUrl(chapterApiData: string): string {
  if (!chapterApiData) return '';
  const urlParts = chapterApiData.split('/');
  return urlParts.pop() || '';
}

/**
 * Transform API Chapter to UI Chapter
 */
export function transformToUiChapter(apiChapter: ApiChapter): UiChapter {
  return {
    id: getChapterIdFromUrl(apiChapter.chapter_api_data),
    name: apiChapter.chapter_name,
    title: apiChapter.chapter_title,
    number: extractChapterNumber(apiChapter.chapter_name),
    slug: apiChapter.filename,
    url: apiChapter.chapter_api_data
  };
}

/**
 * Extract chapter number from chapter name
 */
export function extractChapterNumber(chapterName: string): number {
  if (!chapterName) return 0;
  
  // Match patterns like "Chapter 1", "Chuong 1", "1", etc.
  const match = chapterName.match(/(?:chapter|chuong|c)\s*(\d+)/i) || 
                chapterName.match(/^(\d+)/);
  
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Flatten chapter list from story chapters
 */
export function flattenChapters(story: Story): UiChapter[] {
  if (!story.chapters || !Array.isArray(story.chapters)) {
    return [];
  }
  
  const allChapters: UiChapter[] = [];
  
  story.chapters.forEach(server => {
    if (server?.server_data && Array.isArray(server.server_data)) {
      server.server_data.forEach(apiChapter => {
        if (apiChapter) {
          allChapters.push(transformToUiChapter(apiChapter));
        }
      });
    }
  });
  
  // Sort by chapter number
  return allChapters.sort((a, b) => a.number - b.number);
}

/**
 * Get latest chapters from story
 */
export function getLatestChapters(story: Story, limit: number = 10): UiChapter[] {
  if (!story.chaptersLatest || !Array.isArray(story.chaptersLatest)) {
    return [];
  }
  
  return story.chaptersLatest
    .slice(0, limit)
    .map(chapter => ({
      id: getChapterIdFromUrl(chapter.chapter_api_data),
      name: chapter.chapter_name,
      title: chapter.chapter_title,
      number: extractChapterNumber(chapter.chapter_name),
      slug: chapter.filename,
      url: chapter.chapter_api_data
    }));
}

/**
 * Normalize story status
 */
export function normalizeStatus(status: string): 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat' {
  const normalized = status?.toLowerCase().replace(/[\s-]/g, '');
  
  switch (normalized) {
    case 'ongoing':
    case 'dangphathanh':
      return 'dang-phat-hanh';
    case 'completed':
    case 'hoanthanh':
      return 'hoan-thanh';
    case 'saphamat':
      return 'sap-ra-mat';
    default:
      return 'dang-phat-hanh';
  }
}

/**
 * Format views number
 */
export function formatViews(views?: number): string {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

/**
 * Format rating
 */
export function formatRating(rating?: number): string {
  if (!rating) return '0.0';
  return rating.toFixed(1);
}

/**
 * Get status text in Vietnamese
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'ongoing':
    case 'dang-phat-hanh':
      return 'Dang phat hanh';
    case 'completed':
    case 'hoan-thanh':
      return 'Hoan thanh';
    case 'sap-ra-mat':
      return 'Sap ra mat';
    default:
      return 'Dang phat hanh';
  }
}

/**
 * Create search params URL
 */
export function buildSearchParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Validate API response
 */
export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && 
         typeof response === 'object' && 
         (response.status === 'success' || response.status === 'error') &&
         (response.data || response.items || response.results);
}

/**
 * Handle API errors
 */
export function handleApiError(error: any): { message: string; code?: string } {
  if (error?.message) {
    return { message: error.message, code: error.code };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  return { message: 'Co loi xay ra khi tai du lieu' };
}