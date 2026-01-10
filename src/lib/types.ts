/**
 * TypeScript type definitions d?a tr?n API response t? otruyenapi.com
 * Reference: https://docs.otruyenapi.com/
 */

// Base types t? API responses
export interface ApiPagination {
  currentPage: number;
  totalItems: number;
  totalItemsPerPage: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: {
    items?: T[];
    item?: T;
    params?: {
      pagination: ApiPagination;
    };
    stories?: T[];
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Story types
export interface Genre {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiChapter {
  _id: string;
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string; // Full URL to chapter data
}

export interface ChapterServer {
  server_name: string;
  server_data: ApiChapter[];
}

export interface Story {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  content?: string;
  description: string;
  author: string[];
  status: 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat';
  genres: string[]; // Array of genre names
  genre: Genre[]; // Full genre objects
  rating?: number;
  views?: number;
  followers?: number;
  cover?: string; // T?n file ?nh
  thumb_url?: string; // T?n file ?nh t? API
  updatedAt: string;
  createdAt: string;
  chapters?: ChapterServer[]; // Nested chapter structure
  chaptersLatest?: {
    filename: string;
    chapter_name: string;
    chapter_title: string;
    chapter_api_data: string;
  }[];
  lastChapter?: {
    _id: string;
    title: string;
    chapterNumber: number;
    slug: string;
  };
  totalChapters?: number;
}

// Chapter content types
export interface ChapterContent {
  _id: string;
  mangaId: string;
  server_name: string;
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
  images: string[]; // Array of image paths
  updatedAt: string;
}

// Search and filter types
export interface SearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  genre?: string;
  status?: string;
  author?: string;
}

export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// UI-specific types (computed from API data)
export interface UiStory {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string[];
  genres: string[];
  status: 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat';
  cover: string; // Full CDN URL
  thumb_url?: string;
  rating?: number;
  views?: number;
  followers?: number;
  updatedAt: string;
  createdAt: string;
  latestChapter?: string;
  totalChapters?: number;
}

export interface UiChapter {
  id: string; // Extracted from chapter_api_data URL
  name: string; // chapter_name from API
  title: string; // chapter_title from API
  number: number; // Extracted from chapter_name
  slug: string;
  url: string; // chapter_api_data full URL
}

export interface UiGenre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  storyCount?: number;
}

// API endpoint types
export type StoryListType = 'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh';

export interface ApiEndpoints {
  HOME: '/home';
  LIST: '/danh-sach';
  CATEGORY: '/the-loai';
  DETAIL: '/truyen-tranh';
  SEARCH: '/tim-kiem';
}

// Helper types
export type StoryStatus = 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat';
export type SortOrder = 'asc' | 'desc';

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Reading progress and sync types
export interface ReadingProgress {
  storySlug: string;
  chapterId: string;
  currentPage: number;
  totalPages: number;
  progress: number; // Percentage
  lastRead: number; // Timestamp
  lastSynced?: string; // ISO 8601 Date string
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// Bookmark types
export interface Bookmark {
  id: string;
  storySlug: string;
  chapterId: string;
  pageNumber?: number; // Optional, for specific page bookmarks
  createdAt: number; // Timestamp
  folder?: string; // For categorization
  notes?: string; // User notes
}