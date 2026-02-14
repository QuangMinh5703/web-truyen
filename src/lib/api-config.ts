// src/lib/api-config.ts
export const API_CONFIG = {
  BASE_URL: 'https://otruyenapi.com/v1/api',
  CDN_URL: 'https://img.otruyenapi.com',
  ENDPOINTS: {
    HOME: '/home',
    LIST: '/danh-sach',
    CATEGORY: '/the-loai',
    DETAIL: '/truyen-tranh',
    SEARCH: '/tim-kiem',
  }
} as const;

// Ranking Worker API (Cloudflare Worker + D1)
export const RANKING_API_URL =
  process.env.NEXT_PUBLIC_RANKING_API_URL || 'https://mtruyen-ranking.kinal.workers.dev';
