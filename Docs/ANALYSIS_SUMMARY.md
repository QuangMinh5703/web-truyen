# PHÂN TÍCH PROJECT - M-TRUYEN
**Ngày:** 08/01/2026

---

## 📊 TÓM TẮT NHANH

### Trạng thái: BETA (Core features hoàn chỉnh, cần testing & polish)

**Đã hoàn thành:**
- ✅ API integration hoàn chỉnh với caching
- ✅ Reader modes: Single page (zoom/pan) + Continuous scroll (virtualized)
- ✅ PWA với Service Worker, offline support
- ✅ Reading progress tracking với mock sync
- ✅ Responsive UI (desktop + mobile)
- ✅ Basic analytics tracking

**Cần làm ngay:**
- 🔴 Fix memory leaks (WebtoonReader)
- 🔴 Fix race conditions (useReadingProgress)
- 🔴 Expand test coverage (hiện tại ~10%, target 70%)
- 🔴 Cross-browser testing
- 🟡 Backend integration (auth, bookmarks, comments)

---

## 🏗️ KIẾN TRÚC

```
Next.js 16 App Router
├── React 19 + TypeScript 5 (strict)
├── Zustand (state)
├── Tailwind CSS 4 (styling)
└── Vitest + RTL (testing)

Reader Engine:
├── @tanstack/react-virtual (virtualization)
├── react-zoom-pan-pinch (zoom/pan)
├── @use-gesture/react (touch gestures)
└── WebtoonImage component (optimized loading)

Storage:
├── LocalStorage (settings, bookmarks, progress)
├── Service Worker Cache (PWA, 500MB limit)
└── In-memory cache (API responses, 30 min TTL)
```

---

## 📁 CẤU TRÚC QUAN TRỌNG

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   └── truyen/[slug]/chuong/[chapterId]/
│       └── page.tsx                  # ⭐ Main reader (600+ lines)
│
├── components/
│   ├── WebtoonReader.tsx             # ⭐ Virtualized reader
│   ├── WebtoonImage.tsx              # ⭐ Image với retry
│   ├── ReaderControls.tsx            # Settings UI
│   └── ChapterNav.tsx                # Chapter navigation
│
└── lib/
    ├── hooks/
    │   ├── useChapterData.ts         # ⭐ Data fetching + prefetch
    │   ├── useReadingProgress.ts     # ⭐ Progress + sync
    │   └── useReaderSettings.ts      # User preferences
    │
    ├── api.ts                        # ⭐ OtruyenApi class
    ├── cache.ts                      # ⭐ TTL-based cache
    └── types.ts                      # TypeScript definitions
```

---

## 🐛 BUGS PHÁT HIỆN

### 1. Memory Leak - WebtoonReader ⚠️
**File:** `src/components/WebtoonReader.tsx`, `src/app/truyen/[slug]/chuong/[chapterId]/page.tsx`

**Vấn đề:**
```typescript
// page.tsx
const [imageHeights, setImageHeights] = useState<Record<number, number>>({});

const handleImageHeightMeasured = useCallback((index: number, height: number) => {
  setImageHeights(prev => ({
    ...prev,
    [index]: height // ❌ Grows unbounded
  }));
}, []);
```

**Fix:**
```typescript
const handleImageHeightMeasured = useCallback((index: number, height: number) => {
  setImageHeights(prev => {
    // Only keep heights for visible range
    const visibleRange = /* calculate from virtualizer */;
    const filtered = Object.fromEntries(
      Object.entries(prev).filter(([idx]) => visibleRange.includes(Number(idx)))
    );
    return { ...filtered, [index]: height };
  });
}, []);
```

### 2. Race Condition - useReadingProgress ⚠️
**File:** `src/lib/hooks/useReadingProgress.ts`

**Vấn đề:**
- Không cleanup debounce timeout khi chapterId changes
- Multiple save operations có thể conflict

**Fix:**
```typescript
// Add cleanup
useEffect(() => {
  return () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
  };
}, [chapterId]);

// Add AbortController
const abortControllerRef = useRef<AbortController>();
// ... use in save operations
```

### 3. Cache Không Invalidate ⚠️
**File:** `src/lib/cache.ts`

**Vấn đề:**
- Cache có TTL nhưng không auto-invalidate khi data stale
- Không có mechanism force refresh

**Fix:**
```typescript
export const invalidateCache = (pattern: string) => {
  const keys = Object.keys(cacheStore).filter(key => key.includes(pattern));
  keys.forEach(key => delete cacheStore[key]);
};
```

---

## 📊 DEPENDENCIES

**Production (10 packages):**
```
Core:
- next@16.0.1
- react@19.2.0
- typescript@5.x

UI:
- tailwindcss@4.x
- lucide-react@0.460.0

Reader:
- @tanstack/react-virtual@3.13.13    # Virtualization
- react-zoom-pan-pinch@3.7.0         # Zoom/pan
- @use-gesture/react@10.3.1          # Gestures
- react-intersection-observer@10.0.0 # Lazy loading
- screenfull@6.0.2                   # Fullscreen

State:
- zustand@5.0.9                      # Global state
```

**Dev Dependencies:**
```
Testing:
- vitest@4.0.16
- @testing-library/react@16.3.1
- @testing-library/jest-dom@6.9.1
- jsdom@27.3.0

Quality:
- eslint@9.x
- @vitejs/plugin-react@5.1.2
```

**Bundle size estimate:** ~600KB first load (chưa optimize)

---

## 🧪 TESTING STATUS

**Current coverage:** ~10-20%
**Target:** 70%+

**Tests có:**
- ✅ `useChapterData.test.ts` - Basic tests

**Tests cần:**
- [ ] API layer (api.ts, cache.ts)
- [ ] Hooks (useReadingProgress, useReaderSettings, useBookmarks)
- [ ] Components (WebtoonImage, WebtoonReader, ReaderControls)
- [ ] Integration tests (E2E flows)
- [ ] Cross-browser tests

---

## 🚀 ROADMAP ƯU TIÊN

### Phase 1: Fix Critical Bugs (1-2 tuần)
1. Fix memory leaks
2. Fix race conditions  
3. Add cache invalidation
4. Test coverage → 50%+

### Phase 2: Testing & Quality (2-3 tuần)
1. Test coverage → 70%
2. Cross-browser testing
3. Performance audits
4. Accessibility fixes

### Phase 3: Backend Integration (3-4 tuần)
1. User authentication
2. Real bookmarks API
3. History sync API
4. Comment system backend

### Phase 4: Advanced Features (2-3 tuần)
1. Download manager UI
2. Advanced search & filters
3. Recommendation engine
4. Social features (basic)

### Phase 5: Polish & Launch (1-2 tuần)
1. UI/UX improvements
2. Complete documentation
3. Final testing
4. Production deployment

---

## 📝 RECOMMENDATIONS

### Immediate Actions (This Week)
1. **Fix memory leak trong WebtoonReader** - HIGH impact
2. **Add cleanup cho useReadingProgress** - Prevent data corruption
3. **Setup bundle analyzer** - Understand current size
4. **Write more unit tests** - Target 30% coverage first

### Short Term (1-2 Weeks)
1. **Cross-browser testing** - Safari, Firefox issues
2. **Performance profiling** - Find bottlenecks
3. **Accessibility audit** - WCAG AA compliance
4. **API cache strategy review** - Better invalidation

### Medium Term (1 Month)
1. **Backend API design** - Plan database schema
2. **Authentication system** - Choose provider
3. **Real bookmark system** - Cloud sync
4. **Download manager** - Offline reading

### Long Term (2-3 Months)
1. **Social features** - User profiles, activity feed
2. **Recommendation engine** - Personalized suggestions
3. **Mobile app** - React Native or PWA wrapper
4. **Analytics dashboard** - Track user behavior

---

## ⚠️ RISKS & CONCERNS

1. **Memory leaks** - Có thể làm crash browser sau đọc nhiều chapters
2. **No backend** - Hiện tại all data local, mất khi clear browser
3. **Limited testing** - Bugs có thể bị bỏ sót
4. **Bundle size** - 600KB có thể lớn cho slow connections
5. **Browser compatibility** - Chưa test đầy đủ Safari, Firefox

---

## 💡 STRENGTHS

1. ✅ **Solid architecture** - Clean separation of concerns
2. ✅ **Good performance** - Virtualization cho large chapters
3. ✅ **PWA ready** - Offline support implemented
4. ✅ **Type-safe** - TypeScript strict mode
5. ✅ **Modern stack** - Latest React, Next.js
6. ✅ **Good UX** - Responsive, touch-friendly
7. ✅ **Extensible** - Easy to add new features

---

## 📞 NEXT STEPS

**Developer nên:**
1. Đọc kỹ `TODO.md` để hiểu task list
2. Đọc `PROJECT_STRUCTURE.md` để hiểu codebase
3. Chạy `npm run test` để xem test coverage hiện tại
4. Fix critical bugs trước (memory leak, race condition)
5. Viết tests cho code mới
6. Review code với checklist trong docs

**Project Manager nên:**
1. Prioritize bug fixes over new features
2. Allocate time cho testing (at least 30% dev time)
3. Plan backend integration timeline
4. Budget cho cross-browser testing tools (BrowserStack)
5. Consider hiring QA tester

---

**Contact:** 
- Docs location: `Docs/` folder
- Main TODO: `Docs/TODO.md`
- Architecture: `Docs/PROJECT_STRUCTURE.md`
- Tech details: `Docs/TECH_STACK.md`

**Last updated:** 08/01/2026
