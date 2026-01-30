# API Documentation - Comic Reader

## Overview

D? án Comic Reader s? d?ng API t? `otruyenapi.com` ?? cung c?p d? li?u truy?n tranh. Th? m?c này ch?a t?t c? các utilities, types, và API client functions.

## File Structure

```
src/lib/
??? api.ts                 # Main API client class
??? api-config.ts          # API configuration constants
??? api-utils.ts           # Helper utilities for API responses
??? types.ts               # TypeScript type definitions
??? cache.ts               # Caching utilities
??? store.ts               # State management utilities
??? hooks/                 # Custom React hooks
?   ??? useChapterData.ts  # Chapter data fetching hook
?   ??? useBookmarks.ts    # Bookmark management hook
?   ??? useComments.ts     # Comment system hook
?   ??? useDebounce.ts     # Debounce utility hook
?   ??? useReaderSettings.ts # Reader settings hook
?   ??? useReadingProgress.ts # Reading progress tracking
?   ??? useTruyenMoiComic.ts  # Comic data fetching hook
??? __tests__/             # Unit tests
    ??? api-utils.test.ts  # Tests for api-utils functions
```

## API Endpoints

### Base URLs
- **API Base**: `https://otruyenapi.com/v1/api`
- **CDN Base**: `https://img.otruyenapi.com`

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/home` | GET | Get home page data (featured stories, popular, latest) |
| `/danh-sach/{type}` | GET | Get story list by type |
| `/the-loai` | GET | Get all genres |
| `/the-loai/{slug}` | GET | Get stories by genre |
| `/truyen-tranh/{slug}` | GET | Get story details by slug |
| `/tim-kiem` | GET | Search stories |
| `https://sv1.otruyencdn.com/v1/api/chapter/{id}` | GET | Get chapter content |

### Story List Types
- `truyen-moi` - New stories
- `sap-ra-mat` - Upcoming stories
- `dang-phat-hanh` - Ongoing stories
- `hoan-thanh` - Completed stories

## Core Classes & Functions

### OtruyenApi Class

Main API client class v?i các methods:

```typescript
class OtruyenApi {
  // Story operations
  async getHomeStories(params?)
  async getStoriesByType(type, params?)
  async getStoryBySlug(slug)
  async searchStories(keyword, params?)
  async getStoriesByGenre(genreSlug, params?)
  
  // Chapter operations
  async getChapters(storySlug)
  async getChapterById(chapterId)
  async getChapterContentById(chapterId)
  
  // Genre operations
  async getGenres()
}
```

### Utility Functions (api-utils.ts)

#### Response Handling
- `extractSingleItem(response)` - Extract single item from API response
- `extractListData(response)` - Extract list items and pagination
- `isValidApiResponse(response)` - Validate API response structure

#### Data Transformation
- `transformToUiStory(apiStory)` - Transform API story to UI format
- `transformToUiChapter(apiChapter)` - Transform API chapter to UI format
- `flattenChapters(story)` - Flatten nested chapter structure

#### Helper Functions
- `getChapterIdFromUrl(url)` - Extract chapter ID from API URL
- `extractChapterNumber(chapterName)` - Extract chapter number from name
- `getImageUrl(path)` - Generate full CDN URL for images
- `formatViews(views)` - Format view counts (1.2K, 2.5M)
- `formatRating(rating)` - Format rating scores

## Type Definitions (types.ts)

### Core Types

#### Story
```typescript
interface Story {
  _id: string;
  name: string;
  slug: string;
  description: string;
  author: string[];
  status: 'ongoing' | 'completed' | 'dang-phat-hanh' | 'hoan-thanh' | 'sap-ra-mat';
  genres: string[];
  cover?: string;
  thumb_url?: string;
  rating?: number;
  views?: number;
  chaptersLatest?: ChapterLatest[];
  // ... more fields
}
```

#### Chapter
```typescript
interface Chapter {
  _id: string;
  mangaId: string;
  filename: string;
  chapter_name: string;
  chapter_title: string;
  images: string[];
  updatedAt: string;
}
```

#### API Response
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: {
    items?: T[];
    item?: T;
    params?: {
      pagination: ApiPagination;
    };
  };
  pagination?: PaginationInfo;
}
```

## Custom Hooks

### useChapterData
```typescript
const { chapter, allChapters, story, loading, error } = useChapterData(slug, chapterId);
```

Fetches chapter data, story information, and all chapters for navigation.

### useReaderSettings
```typescript
const { readerMode, backgroundColor, pageWidth, isFullscreen } = useReaderSettings();
```

Manages reader interface settings (single/continuous mode, theme, etc.).

### useReadingProgress
```typescript
const { currentPage, progress, nextPage, prevPage } = useReadingProgress(chapterId, chapter);
```

Tracks reading progress and page navigation.

## Error Handling

### API Errors
```typescript
// Automatic retry with exponential backoff
try {
  const data = await fetchWithRetry(() => api.getStoryBySlug(slug));
} catch (error) {
  console.error('API call failed after retries:', error);
}
```

### Response Validation
```typescript
// Check if response has valid structure
if (isValidApiResponse(response)) {
  const data = extractSingleItem(response);
}
```

## Caching Strategy

### Cache Implementation
- **Memory Cache**: In-memory storage for API responses
- **TTL**: 5 minutes for story data, 1 hour for static data
- **Invalidation**: Automatic on API errors

### Cache Usage
```typescript
const cachedData = getCache<Story>(url);
if (cachedData) {
  return cachedData;
}
const freshData = await fetch(url);
setCache(url, freshData);
return freshData;
```

## Performance Optimizations

### Image Loading
- **CDN**: Automatic CDN URL generation
- **Lazy Loading**: Images load as needed
- **Progressive Loading**: Blur-to-sharp transition
- **Error Handling**: Fallback to placeholder images

### API Optimizations
- **Request Deduplication**: Prevent duplicate requests
- **Retry Logic**: Automatic retry with backoff
- **Pagination**: Efficient data loading
- **Caching**: Reduce unnecessary API calls

## Development Guidelines

### Adding New API Endpoints

1. **Update Configuration** (`api-config.ts`):
```typescript
export const API_CONFIG = {
  // ... existing config
  ENDPOINTS: {
    // ... existing endpoints
    NEW_ENDPOINT: '/new-endpoint'
  }
}
```

2. **Add Type Definitions** (`types.ts`):
```typescript
export interface NewResponse {
  // Define response structure
}
```

3. **Implement Method** (`api.ts`):
```typescript
async getNewData(params?: NewParams): Promise<NewResponse> {
  const response = await this.fetch<NewResponse>(API_CONFIG.ENDPOINTS.NEW_ENDPOINT);
  return this.extractSingleData(response);
}
```

4. **Add Tests** (`__tests__/api.test.ts`):
```typescript
describe('getNewData', () => {
  it('should fetch new data correctly', async () => {
    // Test implementation
  });
});
```

### Best Practices

1. **Error Handling**: Always wrap API calls in try-catch
2. **Type Safety**: Use proper TypeScript types
3. **Loading States**: Handle loading states in UI
4. **Cache Invalidation**: Clear cache when data updates
5. **Performance**: Use React.memo for expensive components
6. **Testing**: Write unit tests for utility functions

## Troubleshooting

### Common Issues

#### API Returns Empty Data
- Check API response structure
- Verify endpoint URL
- Ensure proper authentication (if required)

#### Images Not Loading
- Verify CDN URL generation
- Check image path format
- Ensure proper error handling

#### TypeScript Errors
- Update type definitions
- Check API response matches expected structure
- Use proper generic types

### Debug Mode
Enable debug logging:
```typescript
// Set environment variable
DEBUG_API=true

// Check console logs
console.log('[API] Fetching:', url);
console.log('[API] Response:', data);
```

## Contributing

When contributing to the API layer:

1. **Follow TypeScript strict mode**
2. **Write unit tests for new functions**
3. **Update documentation**
4. **Use proper error handling**
5. **Consider performance implications**
6. **Test with real API responses**

## Resources

- [API Documentation](https://docs.otruyenapi.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)