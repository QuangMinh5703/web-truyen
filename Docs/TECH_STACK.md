# CÔNG NGHỆ SỬ DỤNG - M-TRUYEN

**Cập nhật:** 08/01/2026

---

## 🛠️ TECH STACK OVERVIEW

```
Frontend Framework: Next.js 16.0.1 (App Router)
├── React 19.2.0
├── TypeScript 5.x (strict mode)
└── Tailwind CSS 4.x

State Management: Zustand 5.0.9 + React Hooks

API: REST (otruyenapi.com)

Storage: 
├── LocalStorage (settings, bookmarks, progress)
├── Service Worker Cache (PWA)
└── IndexedDB (future)

Testing: Vitest 4.0.16 + React Testing Library

Build Tool: Next.js (Turbopack)
Package Manager: pnpm
```

---

## 📚 DEPENDENCIES CHI TIẾT

### Core Framework

#### Next.js 16.0.1
**Tính năng sử dụng:**
- ✅ App Router (không dùng Pages Router)
- ✅ Server Components (một số pages)
- ✅ Client Components (most UI)
- ✅ Image Optimization (`next/image`)
- ✅ Dynamic Imports (code splitting)
- ✅ Route Groups
- ✅ Parallel Routes (chưa dùng nhiều)

**Config quan trọng (`next.config.ts`):**
```typescript
const nextConfig = {
  images: {
    domains: ['img.otruyenapi.com'],
    unoptimized: false, // Enable optimization
  },
  // Turbopack for faster builds
  experimental: {
    turbo: {},
  }
}
```

#### React 19.2.0
**Features used:**
- ✅ Hooks (useState, useEffect, useCallback, useMemo, useRef)
- ✅ Context API (ít dùng, prefer Zustand)
- ✅ Suspense (với dynamic imports)
- ✅ Error Boundaries
- ❌ Server Actions (chưa dùng - chưa có backend)
- ❌ React Server Components (dùng ít)

#### TypeScript 5.x
**Cấu hình strict:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "preserve"
  }
}
```

**Type definitions (`src/lib/types.ts`):**
- Story, Chapter, Genre interfaces
- API response types
- UI component types
- Hook return types

---

### UI & Styling

#### Tailwind CSS 4.x
**Utility classes used extensively:**
```tsx
// Example usage
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-white dark:bg-gray-800
  rounded-lg shadow-sm
  hover:shadow-md transition-shadow
">
```

**Custom configuration:**
- Dark mode: `class` strategy
- Custom colors (nếu có)
- Custom spacing
- Custom breakpoints (default)

**Plugins:**
- `@tailwindcss/postcss` - PostCSS integration

#### Lucide React (Icons)
**Version:** 0.460.0
```tsx
import { Settings, ChevronLeft, CheckCircle } from 'lucide-react';

<Settings className="w-5 h-5 text-gray-600" />
```

**Ưu điểm:**
- Tree-shakeable
- Consistent design
- TypeScript support
- Small bundle size (~2KB per icon)

---

### Reader Features

#### @tanstack/react-virtual (3.13.13)
**Virtual scrolling cho performance**

**Usage trong WebtoonReader:**
```typescript
const rowVirtualizer = useVirtualizer({
  count: pages.length,
  getScrollElement: () => containerRef.current,
  estimateSize: (index) => pages[index]?.height || 800,
  overscan: 3, // Render 3 items outside viewport
});

// Render chỉ visible items
rowVirtualizer.getVirtualItems().map(virtualItem => (
  <div key={virtualItem.key} style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${virtualItem.start}px)`,
  }}>
    <WebtoonImage src={pages[virtualItem.index].imageUrl} />
  </div>
))
```

**Benefits:**
- ✅ Chỉ render visible items
- ✅ Handle thousands of items
- ✅ Auto-calculate sizes
- ✅ Smooth scrolling

**Considerations:**
- ⚠️ `overscan` càng thấp càng tiết kiệm memory
- ⚠️ `estimateSize` phải accurate để tránh CLS

#### react-zoom-pan-pinch (3.7.0)
**Zoom & pan cho single page mode**

**Usage:**
```tsx
<TransformWrapper>
  <TransformComponent>
    <Image src={currentImageUrl} />
  </TransformComponent>
</TransformWrapper>
```

**Features:**
- ✅ Pinch zoom
- ✅ Wheel zoom
- ✅ Double-click zoom
- ✅ Pan with mouse/touch
- ✅ Reset transform
- ✅ Min/max scale limits

**Bundle size:** ~50KB

#### @use-gesture/react (10.3.1)
**Advanced touch/mouse gestures**

**Usage trong chapter reader:**
```typescript
const bind = useDrag(({ down, movement: [mx, my], last }) => {
  if (Math.abs(mx) < Math.abs(my)) {
    // Vertical scroll - ignore
    if (down) setSwipeOffset(0);
    return;
  }
  
  if (down) {
    setSwipeOffset(mx); // Visual feedback
  } else if (last) {
    if (mx > swipeThreshold) prevPage();
    else if (mx < -swipeThreshold) nextPage();
    setSwipeOffset(0);
  }
});
```

**Features:**
- ✅ Drag, swipe, pinch, wheel events
- ✅ Velocity tracking
- ✅ Direction detection
- ✅ Threshold configuration
- ✅ Works with touch & mouse

**Configuration:**
```typescript
// In useReaderSettings
const [swipeThreshold, setSwipeThreshold] = useState(50);
```

#### react-intersection-observer (10.0.0)
**Lazy loading & infinite scroll**

**Usage:**
```typescript
const { ref, inView } = useInView({
  threshold: 0.5,
  triggerOnce: true,
  rootMargin: '200px', // Trigger 200px before entering viewport
});

// Trigger load more
useEffect(() => {
  if (inView) loadMoreContent();
}, [inView]);
```

**Use cases:**
- ✅ Lazy load images
- ✅ Infinite scroll
- ✅ Prefetch next chapter
- ✅ Analytics viewport tracking

#### screenfull (6.0.2)
**Fullscreen API wrapper**

**Usage:**
```typescript
import screenfull from 'screenfull';

const toggleFullscreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle(elementRef.current);
  }
};
```

**Features:**
- ✅ Cross-browser compatibility
- ✅ Type-safe API
- ✅ Event listeners
- ✅ Element-specific fullscreen

**Bundle size:** ~2KB

---

### State Management

#### Zustand 5.0.9
**Lightweight global state**

**Usage trong useReaderSettings:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReaderState {
  readerMode: 'single' | 'continuous';
  backgroundColor: 'white' | 'black' | 'sepia';
  pageWidth: PageWidth;
  isFullscreen: boolean;
  swipeThreshold: number;
  
  setReaderMode: (mode: 'single' | 'continuous') => void;
  setBackgroundColor: (color: string) => void;
  // ... other setters
}

const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      // Default values
      readerMode: 'single',
      backgroundColor: 'white',
      pageWidth: 'fit-width',
      isFullscreen: false,
      swipeThreshold: 50,
      
      // Actions
      setReaderMode: (mode) => set({ readerMode: mode }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      // ...
    }),
    {
      name: 'reader-settings', // localStorage key
    }
  )
);
```

**Why Zustand over Redux/Context:**
- ✅ No boilerplate
- ✅ No Provider wrapper needed
- ✅ Hook-based API
- ✅ Built-in persistence
- ✅ DevTools support
- ✅ Tiny bundle size (~1KB)

**Alternative considered:**
- ❌ Redux Toolkit - too heavy
- ❌ Jotai - similar but prefer Zustand
- ❌ Context API - re-render issues

---

### Testing

#### Vitest 4.0.16
**Fast unit test runner**

**Config (`vitest.config.ts`):**
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

**Example test (`useChapterData.test.ts`):**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChapterData } from './useChapterData';

describe('useChapterData', () => {
  it('should fetch chapter data', async () => {
    const { result } = renderHook(() => 
      useChapterData('test-slug', 'chapter-1')
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.chapter).toBeDefined();
    });
  });
});
```

**Why Vitest over Jest:**
- ✅ Faster (Vite-powered)
- ✅ ESM native
- ✅ Jest-compatible API
- ✅ TypeScript out of the box
- ✅ Better watch mode

#### React Testing Library 16.3.1
**Component testing**

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('ReaderControls changes mode', () => {
  render(<ReaderControls {...props} />);
  
  const modeButton = screen.getByText('Từng trang');
  fireEvent.click(modeButton);
  
  expect(screen.getByText('Cuộn liên tục')).toBeInTheDocument();
});
```

#### @testing-library/jest-dom 6.9.1
**Custom matchers**

```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveClass('active');
expect(element).toHaveTextContent('Hello');
```

---

### PWA & Offline

#### Service Worker (Custom)
**File:** `public/sw.js`

**Features implemented:**
- ✅ Multiple cache namespaces
- ✅ Cache strategies (Cache First, Network First)
- ✅ Cache size limits (500MB max)
- ✅ Auto-cleanup (LRU-ish)
- ✅ Background sync (stub)
- ✅ Push notifications (stub)

**Caching strategy:**
```javascript
// Static assets: Cache First
if (isStaticAsset(request)) {
  return caches.match(request) || fetch(request);
}

// API: Network First, fallback to cache
if (isApiRequest(url)) {
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request) || offlineResponse;
  }
}

// Images: Cache First với network fallback
if (isImageRequest(url)) {
  return caches.match(request) || 
         fetch(request).then(res => {
           cache.put(request, res.clone());
           return res;
         });
}
```

**Message handling:**
```javascript
self.addEventListener('message', event => {
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_CHAPTERS':
      cacheChapters(event.data.chapters);
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => 
        event.ports[0].postMessage({ cacheSize: size })
      );
      break;
  }
});
```

#### Manifest.json
**PWA configuration:**
```json
{
  "name": "M-Truyện",
  "short_name": "M-Truyện",
  "description": "Đọc truyện online",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/logo.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

---

### Development Tools

#### ESLint 9.x
**Code quality & consistency**

**Config (`eslint.config.mjs`):**
```javascript
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
```

**Plugins used:**
- `eslint-config-next` - Next.js rules
- TypeScript ESLint

#### PostCSS
**CSS processing**

**Config (`postcss.config.mjs`):**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

---

## 📦 BUNDLE SIZE ANALYSIS

**Current estimates (need verification):**

```
Main bundle:        ~300KB (JS)
Vendor bundles:     ~200KB (React, Next.js)
Dynamic imports:    ~100KB (per route)

Total first load:   ~600KB gzipped
```

**Heavy dependencies:**
- react-zoom-pan-pinch: ~50KB
- @tanstack/react-virtual: ~20KB
- @use-gesture/react: ~30KB
- lucide-react: ~2KB per icon
- zustand: ~5KB ✅

**Optimization opportunities:**
- [ ] Analyze với @next/bundle-analyzer
- [ ] More dynamic imports
- [ ] Remove unused dependencies
- [ ] Tree-shaking verification

---

## 🚀 PERFORMANCE CONSIDERATIONS

### Image Loading Strategy

**Current implementation:**
```tsx
<Image
  src={imageUrl}
  alt={alt}
  width={1024}
  height={1536}
  loading="lazy"
  priority={index < 3}
  quality={90}
  unoptimized={true} // ⚠️ Disable optimization
/>
```

**Issues:**
- ⚠️ `unoptimized={true}` bypasses Next.js optimization
- ⚠️ No WebP/AVIF support
- ⚠️ No responsive sizes

**Recommended fix:**
```tsx
<Image
  src={imageUrl}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
  quality={85}
  unoptimized={false} // Enable optimization
  loader={customLoader}
/>
```

### Code Splitting

**Current strategy:**
- ✅ Automatic route-based splitting (Next.js)
- ✅ Dynamic imports cho heavy components
- ✅ Lazy load comments, chapter nav

**Dynamic imports example:**
```typescript
const WebtoonReader = dynamic(() => import('@/components/WebtoonReader'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});

const CommentSection = dynamic(() => import('@/components/CommentSection'), {
  loading: () => <div>Đang tải bình luận...</div>,
  ssr: false,
});
```

### Caching Strategy

**API Cache (in-memory):**
```typescript
// src/lib/cache.ts
const TTL = 30 * 60 * 1000; // 30 minutes

const cache = new Map<string, CacheEntry>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}
```

**Service Worker Cache:**
- Static: Cache First (never expires)
- API: Network First (5 min stale)
- Images: Cache First (never expires, size limited)

---

## 🔮 FUTURE TECH STACK

### Backend (Planned)
**Options being considered:**
1. **Next.js API Routes** + **PostgreSQL**
   - Pros: Same codebase, easy deployment
   - Cons: Tightly coupled

2. **Separate NestJS** + **PostgreSQL**
   - Pros: Better separation, scalable
   - Cons: More infrastructure

3. **Supabase** (BaaS)
   - Pros: Fast development, auth built-in
   - Cons: Vendor lock-in

**Decision:** TBD (sau khi MVP stable)

### Database
**Options:**
1. **PostgreSQL** - Relational, complex queries
2. **MongoDB** - Flexible schema, fast reads
3. **Prisma ORM** - Type-safe queries

### Authentication
**Options:**
1. **NextAuth.js** - Free, self-hosted
2. **Clerk** - Paid, feature-rich
3. **Supabase Auth** - If using Supabase

### Real-time Features
**Options:**
1. **Pusher** - Paid, easy
2. **Socket.io** - Self-hosted, flexible
3. **Supabase Realtime** - If using Supabase

### Analytics
**Current:** Custom implementation (localStorage)
**Future:**
1. **Vercel Analytics** - Built-in
2. **Google Analytics 4**
3. **Mixpanel** - Advanced tracking

### Error Tracking
**Options:**
1. **Sentry** - Industry standard
2. **LogRocket** - Session replay
3. **BugSnag**

---

## 📊 TECH DEBT

### Known Issues
1. **WebtoonImage unoptimized flag**
   - Bypasses Next.js image optimization
   - Should enable and test

2. **No bundle size monitoring**
   - Need to setup bundle analyzer
   - Track size over time

3. **Limited browser testing**
   - Need automated cross-browser tests
   - Setup BrowserStack/Sauce Labs

4. **No performance monitoring**
   - Need Real User Monitoring (RUM)
   - Track Core Web Vitals in production

### Deprecated Dependencies
- None currently (all up to date)

### Security Considerations
- [ ] Run `npm audit` regularly
- [ ] Update dependencies monthly
- [ ] Review OWASP Top 10
- [ ] Add security headers
- [ ] Implement CSP

---

**Last updated:** 08/01/2026
