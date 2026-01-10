# CẤU TRÚC THƯ MỤC - M-TRUYEN PROJECT

**Cập nhật:** 08/01/2026

---

## 📁 TỔNG QUAN CẤU TRÚC

```
m-truyen/
├── 📁 Docs/                      # Documentation
│   ├── TODO.md                   # ✅ TODO list (UPDATED)
│   ├── PROJECT_STRUCTURE.md      # ✅ File này
│   ├── TECH_STACK.md            # Tech stack details
│   ├── COMMIT_GUIDE.md          # Git conventions
│   ├── PROJECT_SUMMARY.md       # Project overview
│   └── README.md                # Getting started
│
├── 📁 public/                    # Static assets
│   ├── sw.js                     # ✅ Service Worker (PWA)
│   ├── manifest.json             # ✅ PWA manifest
│   ├── 📁 Black_Ops_One/        # Custom fonts
│   ├── 📁 Lexend_Exa/
│   ├── 📁 ig_banner/            # Banner images
│   ├── 📁 ig_logo/              # Logo assets
│   ├── 📁 ig_themes/            # Theme previews
│   └── 📁 ig_toprank/           # Ranking images
│
├── 📁 src/
│   │
│   ├── 📁 app/                   # Next.js 15 App Router
│   │   ├── layout.tsx            # ✅ Root layout với AnalyticsProvider
│   │   ├── page.tsx              # ✅ Homepage
│   │   ├── globals.css           # Global styles
│   │   ├── favicon.ico
│   │   │
│   │   ├── 📁 dang-phat-hanh/   # Ongoing stories page
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 offline/           # ✅ Offline fallback
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 cache-management/  # ✅ NEW - Cache management UI
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 the-loai/          # Genre pages
│   │   │   └── 📁 [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   └── 📁 truyen/            # Story pages
│   │       └── 📁 [slug]/
│   │           ├── page.tsx      # Story detail
│   │           └── 📁 chuong/
│   │               └── 📁 [chapterId]/
│   │                   └── page.tsx  # ✅ Chapter reader (MAIN)
│   │
│   ├── 📁 components/            # React components
│   │   ├── AnalyticsProvider.tsx # ✅ Analytics wrapper
│   │   ├── Banner.tsx
│   │   ├── BookmarkButton.tsx    # ✅ Bookmark (local only)
│   │   ├── CacheManager.tsx      # ✅ NEW - Cache UI component
│   │   ├── ChapterNav.tsx        # ✅ Chapter list modal
│   │   ├── CommentSection.tsx    # ⚠️ Stub only (no backend)
│   │   ├── ErrorBoundary.tsx     # ✅ Error handling
│   │   ├── Footer.tsx
│   │   ├── FooterComponent.tsx
│   │   ├── Header.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── Navbar.tsx
│   │   ├── PopularGenres.tsx
│   │   ├── ProgressBar.tsx       # ✅ Reading progress bar
│   │   ├── QuickStats.tsx
│   │   ├── ReaderControls.tsx    # ✅ Reader settings UI
│   │   ├── RecentUpdates.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StoryGrid.tsx         # ✅ Grid layout
│   │   ├── StoryList.tsx         # ✅ List layout
│   │   ├── TopRankings.tsx
│   │   ├── WebtoonImage.tsx      # ✅ Optimized image với retry
│   │   └── WebtoonReader.tsx     # ✅ Virtualized vertical reader
│   │
│   └── 📁 lib/                   # Core logic
│       │
│       ├── 📁 hooks/             # Custom React hooks
│       │   ├── useBookmarks.ts          # ✅ Bookmark management (local)
│       │   ├── useChapterData.ts        # ✅ Chapter data fetching + prefetch
│       │   ├── useChapterData.test.ts   # ✅ Unit tests
│       │   ├── useComments.ts           # ⚠️ Stub
│       │   ├── useDebounce.ts           # ✅ Debounce utility
│       │   ├── useDebouncedCallback.ts  # ✅ Debounced callbacks
│       │   ├── useReaderSettings.ts     # ✅ Reader preferences
│       │   ├── useReadingProgress.ts    # ✅ Progress tracking + sync
│       │   └── useTruyenMoiComic.ts     # ⚠️ Legacy?
│       │
│       ├── api.ts                # ✅ Main API client (OtruyenApi class)
│       ├── api-config.ts         # ✅ API configuration
│       ├── api-endpoints.ts      # ✅ Endpoint definitions
│       ├── api-examples.ts       # API usage examples
│       ├── api-utils.ts          # ✅ API utilities
│       ├── api-comments.ts       # ⚠️ Comment API stub
│       ├── api-sync.ts           # ✅ Sync API (mock for now)
│       ├── analytics.ts          # ✅ Analytics tracking
│       ├── cache.ts              # ✅ Cache utilities (TTL-based)
│       ├── store.ts              # State management
│       ├── types.ts              # ✅ TypeScript definitions
│       ├── test-api.ts           # API testing utilities
│       ├── accessibility-guide.md  # ✅ A11y docs
│       └── README.md             # API documentation
│
├── 📁 tests/
│   └── setup.ts                  # ✅ Vitest config
│
├── .gitignore
├── eslint.config.mjs             # ✅ ESLint config
├── next.config.ts                # ✅ Next.js config
├── next-env.d.ts
├── package.json                  # ✅ Dependencies
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json                 # ✅ TypeScript config
└── vitest.config.ts              # ✅ Test config
```

---

## 📊 PHÂN TÍCH CHI TIẾT

### Core Pages (src/app)

#### 1. Homepage (`page.tsx`)
- Hiển thị: Banner, QuickStats, TopRankings, RecentUpdates
- Data source: `otruyenApi.getHomeStories()`
- Status: ✅ Hoàn chỉnh

#### 2. Story Detail (`truyen/[slug]/page.tsx`)
- Hiển thị: Story info, chapter list, comments
- Data source: `otruyenApi.getStoryBySlug()`
- Status: ✅ Hoàn chỉnh

#### 3. Chapter Reader (`truyen/[slug]/chuong/[chapterId]/page.tsx`)
**File quan trọng nhất!**
- **Components used:**
  - `WebtoonReader` - Continuous scroll mode
  - `ReaderControls` - Settings panel
  - `ProgressBar` - Reading progress
  - `ChapterNav` - Chapter selection
  - `CommentSection` - Comments (stub)
  - Image rendering với `next/image` hoặc `WebtoonImage`

- **Hooks used:**
  - `useChapterData` - Fetch chapter + story data
  - `useReadingProgress` - Track progress + sync
  - `useReaderSettings` - User preferences
  - `useDrag` - Swipe gestures

- **Features:**
  - ✅ Single page mode (zoom/pan)
  - ✅ Continuous scroll mode (virtualized)
  - ✅ Keyboard navigation
  - ✅ Swipe gestures
  - ✅ Progress tracking
  - ✅ Auto-prefetch next chapter
  - ✅ Sync status indicator

- **Known Issues:**
  - ⚠️ Memory leak với `imageHeights` state
  - ⚠️ Race condition trong progress sync

#### 4. Cache Management (`cache-management/page.tsx`)
**NEW feature!**
- View cache size
- Clear cache button
- Analytics export
- Status: ✅ Implemented

---

### Core Components

#### WebtoonReader.tsx ⭐
**Advanced virtualized reader**

**Features:**
- Virtualization với `@tanstack/react-virtual`
- Auto-scroll mode
- Progress indicator
- Keyboard navigation (Space, Arrow keys, Home, End)
- Lazy loading images
- Performance optimized

**State:**
```typescript
const [pages, setPages] = useState<WebtoonPage[]>([]);
const [currentPageIndex, setCurrentPageIndex] = useState(0);
const [isAutoScroll, setIsAutoScroll] = useState(false);
const [scrollSpeed, setScrollSpeed] = useState(1);
```

**Issues:**
- ⚠️ `imageHeights` trong parent component có thể leak memory

#### WebtoonImage.tsx ⭐
**Optimized image component**

**Features:**
- Auto-measure image height
- Loading skeleton
- Error handling với retry (max 3 attempts)
- Retry với cache bypass (`?retry=N`)
- Dark mode support

**Code highlights:**
```typescript
const imageSrc = `${src}?retry=${retryCount}`;
// Bypass cache khi retry

const handleLoad = (e) => {
  const renderedHeight = (naturalHeight / naturalWidth) * containerWidth;
  onHeightMeasured(renderedHeight);
};
```

#### ReaderControls.tsx
**Responsive settings panel**

- Desktop: Full controls bar
- Mobile: Compact with settings modal
- Controls:
  - Reader mode toggle
  - Background color (white/black/sepia)
  - Page width (fit-width/fit-height/original)
  - Bookmark button
  - Chapter navigation

---

### Core Hooks

#### useChapterData.ts ⭐
**Critical hook for data fetching**

**Features:**
- Fetch story + chapter data
- Cache story data (30 min TTL)
- Auto-prefetch next chapter (80% scroll)
- Retry mechanism (3 retries với exponential backoff)
- AbortController support

**Code structure:**
```typescript
export const useChapterData = (slug: string, chapterId: string) => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch logic với cache
  // Prefetch logic với scroll detection
  
  return { chapter, allChapters, story, loading, error };
}
```

**Status:** ✅ Has unit tests

#### useReadingProgress.ts ⚠️
**Progress tracking với sync**

**Features:**
- Track current page
- Save to localStorage
- Debounced remote sync (2 seconds)
- Conflict resolution (newer timestamp wins)
- Sync status indicator

**Issues:**
- ⚠️ No cleanup khi chapterId changes
- ⚠️ Race condition possible
- ⚠️ Debounce timeout leak

**Fix needed:**
```typescript
useEffect(() => {
  return () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };
}, [chapterId]); // Add this cleanup
```

#### useReaderSettings.ts
**Reader preferences management**

Uses Zustand store:
```typescript
interface ReaderState {
  readerMode: 'single' | 'continuous';
  backgroundColor: 'white' | 'black' | 'sepia';
  pageWidth: PageWidth;
  isFullscreen: boolean;
  swipeThreshold: number;
  // ... setters
}
```

Persisted to localStorage.

---

### API Layer (src/lib)

#### api.ts ⭐
**Main API client**

**OtruyenApi class methods:**
```typescript
// Stories
getHomeStories(params?)
getStoriesByType(type, params?)
getStoryBySlug(slug, options?)
searchStories(keyword, params?)

// Chapters
getChapters(storySlug)
getChapterByUrl(chapterApiUrl, options?)

// Genres
getGenres()
getStoriesByGenre(genreSlug, params?)

// Aliases
getLatestStories(params?)
getOngoingStories(params?)
getCompletedStories(params?)
```

**Features:**
- Automatic caching (cache.ts)
- Error handling với retry
- Response normalization
- AbortController support
- TypeScript typed

#### cache.ts
**Simple TTL-based cache**

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function createCache<T>(ttl: number) {
  return {
    get(key: string): T | null,
    set(key: string, value: T): void,
    invalidate(key: string): void,
  };
}
```

**Issues:**
- ⚠️ No automatic invalidation khi data changes
- ⚠️ No cache size limits
- ⚠️ No LRU eviction

---

### Service Worker (public/sw.js)

**Caching strategies:**
1. **Static assets:** Cache First
2. **API requests:** Network First, fallback to cache
3. **Images:** Cache First với network fallback
4. **Pages:** Network First với offline page fallback

**Features:**
- ✅ Cache size limit (500MB)
- ✅ Auto-cleanup (oldest first)
- ✅ Multiple cache namespaces
- ✅ Background sync support (stub)
- ✅ Push notifications (stub)
- ✅ Message handling từ main thread

**Message handlers:**
- `SKIP_WAITING` - Activate new SW
- `CACHE_CHAPTERS` - Cache specific chapters
- `CLEAR_CACHE` - Clear all caches
- `GET_CACHE_SIZE` - Return total cache size

---

## 🔍 FILE DEPENDENCIES

### Chapter Reader Dependencies
```
page.tsx (Chapter Reader)
  ├── useChapterData
  │   ├── api.ts (OtruyenApi)
  │   ├── cache.ts
  │   └── types.ts
  ├── useReadingProgress
  │   ├── api-sync.ts (mock)
  │   └── types.ts
  ├── useReaderSettings
  │   └── zustand store
  ├── WebtoonReader
  │   ├── WebtoonImage
  │   ├── @tanstack/react-virtual
  │   └── useReaderSettings
  ├── ReaderControls
  │   ├── BookmarkButton
  │   │   └── useBookmarks
  │   └── useReaderSettings
  ├── ChapterNav (dynamic)
  └── CommentSection (dynamic, stub)
```

### API Call Flow
```
Component
  ↓
useChapterData hook
  ↓
OtruyenApi.getStoryBySlug()
  ↓
Check cache (cache.ts)
  ├─ Hit  → Return cached data
  └─ Miss → Fetch from API
      ↓
  Transform response
      ↓
  Save to cache
      ↓
  Return to hook
      ↓
  Update component state
```

---

## 📦 DEPENDENCIES BREAKDOWN

### Production Dependencies
```json
{
  "@tanstack/react-virtual": "^3.13.13",  // Virtualization
  "@use-gesture/react": "^10.3.1",        // Touch gestures
  "lucide-react": "^0.460.0",             // Icons
  "next": "16.0.1",                       // Framework
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "react-intersection-observer": "^10.0.0", // Lazy loading
  "react-zoom-pan-pinch": "^3.7.0",       // Zoom/pan
  "screenfull": "^6.0.2",                 // Fullscreen
  "zustand": "^5.0.9"                     // State management
}
```

### Dev Dependencies
```json
{
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/react": "^16.3.1",
  "@vitejs/plugin-react": "^5.1.2",
  "vitest": "^4.0.16",                    // Testing
  "eslint": "^9",
  "typescript": "^5"
}
```

---

## 🚨 CRITICAL FILES (DO NOT DELETE)

**App Router:**
- `src/app/layout.tsx` - Root layout
- `src/app/truyen/[slug]/chuong/[chapterId]/page.tsx` - Main reader

**Components:**
- `src/components/WebtoonReader.tsx`
- `src/components/WebtoonImage.tsx`
- `src/components/ReaderControls.tsx`

**Hooks:**
- `src/lib/hooks/useChapterData.ts`
- `src/lib/hooks/useReadingProgress.ts`
- `src/lib/hooks/useReaderSettings.ts`

**API:**
- `src/lib/api.ts`
- `src/lib/cache.ts`
- `src/lib/types.ts`

**PWA:**
- `public/sw.js`
- `public/manifest.json`

---

## 📝 FILES CẦN REFACTOR

1. **page.tsx (Chapter Reader)** - 600+ lines
   - Split into smaller components
   - Extract gesture logic
   - Extract navigation logic

2. **WebtoonReader.tsx** - 300+ lines
   - Complex state management
   - Can split scroll logic

3. **api.ts** - 400+ lines
   - Consider splitting by domain (stories, chapters, genres)

---

## 🆕 FILES MISSING / CẦN TẠO

**Components:**
- `src/components/DownloadManager.tsx`
- `src/components/AdvancedSearch.tsx`
- `src/components/UserProfile.tsx`
- `src/components/ReadingHistory.tsx`

**Pages:**
- `src/app/settings/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/history/page.tsx`

**Hooks:**
- `src/lib/hooks/useDownload.ts`
- `src/lib/hooks/useAuth.ts`
- `src/lib/hooks/useSearch.ts`

**API:**
- `src/lib/api-auth.ts` (khi có backend)
- `src/lib/api-bookmarks.ts` (real backend)
- `src/lib/api-progress.ts` (real backend)

---

**Last updated:** 08/01/2026
