# TODO LIST - M-TRUYEN PROJECT
**Cập nhật:** 08/01/2026  
**Trạng thái dự án:** Core features hoàn chỉnh, cần refactor và expand

---

## 📋 TÓM TẮT HIỆN TRẠNG

### ✅ ĐÃ HOÀN THÀNH
- Core infrastructure: API, types, cache, error handling
- Reader features: Single/continuous mode, gestures, keyboard nav
- PWA: Service Worker, offline support, cache management
- State management: Zustand, custom hooks
- Basic testing: Vitest setup, some unit tests

### 🚧 CẦN LÀM NGAY
1. Fix memory leaks trong WebtoonReader
2. Fix race conditions trong useReadingProgress
3. Improve cache invalidation
4. Expand test coverage lên 70%+
5. Cross-browser testing

---

## 🐛 BUGS CẦN FIX (Priority Order)

### 🔴 CRITICAL

**1. Memory Leak - WebtoonReader**
- **File:** `src/components/WebtoonReader.tsx`
- **Issue:** `imageHeights` state grows unbounded
- **Fix:** Limit stored heights to visible range only
```typescript
const handleImageHeightMeasured = useCallback((index: number, height: number) => {
  setImageHeights(prev => {
    const visibleRange = /* calculate from virtualizer */;
    const filtered = Object.fromEntries(
      Object.entries(prev).filter(([k]) => visibleRange.includes(+k))
    );
    return { ...filtered, [index]: height };
  });
}, []);
```

**2. Race Condition - useReadingProgress**
- **File:** `src/lib/hooks/useReadingProgress.ts`
- **Issue:** Multiple save operations khi chuyển chapter nhanh
- **Fix:** Add AbortController và cleanup debounce
```typescript
useEffect(() => {
  return () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
  };
}, [chapterId]);
```

**3. Cache Invalidation Missing**
- **File:** `src/lib/cache.ts`, `src/lib/api.ts`
- **Issue:** No way to force refresh stale data
- **Fix:** Add invalidateCache() function và refresh button

### 🟡 MEDIUM

**4. Service Worker Cache Performance**
- `getCacheSize()` slow với nhiều entries
- `trimCache()` chưa test với 500MB+
- Add progress events

**5. Swipe Gesture Improvements**
- Increase threshold để avoid false swipes
- Add haptic feedback
- Better visual feedback

**6. Comment System**
- Currently just UI stub
- Need mock API implementation
- Design data schema

---

## 🎯 FEATURES MỚI

- [x] PHASE 11: Global UI Polish & Critical Bug Fixes ✅
- [ ] PHASE 12: Testing & Validation

### Backend Integration (HIGH Priority)

**Authentication features are currently out of scope and have been removed from the TODO list.**

**1. Real Bookmarks System**
- [x] Design API endpoints (mocked)
- [x] Database schema (in localStorage)
- [x] Sync local → cloud (mocked)
- [x] Bookmark folders
- [x] Share bookmarks
- Current: `src/lib/hooks/useBookmarks.ts` (refactored with mock API)

**2. Reading History Sync**
- [x] Replace mock API in `api-sync.ts`
- [ ] Real backend endpoints
- [x] Conflict resolution
- [x] Reading history page
- [x] Continue reading section

### Reader Features (MEDIUM Priority)

**4. Download for Offline**
- [ ] DownloadManager component
- [ ] Download queue
- [ ] Progress indicators
- [ ] Storage management UI
- [ ] Auto-download next chapters
- SW infrastructure: `public/sw.js` (có sẵn)

**5. Advanced Settings**
- [ ] Font customization
- [ ] Custom themes
- [ ] Page transition effects
- [ ] Low data mode
- [ ] Settings import/export
- Expand: `src/lib/hooks/useReaderSettings.ts`

**6. Social Features**
- [ ] User profiles
- [ ] Follow system
- [ ] Reading groups
- [ ] Activity feed
- [ ] Reading challenges

### Search & Discovery (MEDIUM Priority)

**7. Advanced Search**
- [ ] Multi-genre filters
- [ ] Author search
- [ ] Rating filters
- [ ] Advanced sort options
- [ ] Search autocomplete
- [ ] Saved searches

**8. Ranking Page Improvements**
- See `HOT_MANGA_RANKING_TODO.md` and `SEARCH_FEATURE_TODO.md` for details.

**9. Recommendations**
- [ ] Algorithm design
- [ ] User interaction tracking
- [ ] "Recommended for you" section
- [ ] "Similar stories" feature
- [ ] A/B testing

---

## 🧪 TESTING (HIGH Priority)

### Unit Tests (Target: 70% coverage)

**API Layer:**
- [ ] `api.ts` - Test all methods, error handling, retry
- [ ] `cache.ts` - Test TTL, invalidation

**Hooks:**
- [x] `useChapterData.ts` - ✅ Done
- [ ] `useReadingProgress.ts` - Sync, conflicts, debounce
- [ ] `useReaderSettings.ts` - Persistence
- [x] `useBookmarks.ts` - ✅ Done (CRUD operations)

**Components:**
- [ ] `WebtoonImage.tsx` - Loading, error, retry
- [ ] `WebtoonReader.tsx` - Virtualization, scroll
- [ ] `ReaderControls.tsx` - Desktop/mobile
- [ ] `ChapterNav.tsx` - Filtering, navigation

### Integration Tests (E2E)
- [ ] Setup Playwright
- [ ] Browse → Read flow
- [ ] Search → Filter → Read
- [ ] Settings persistence
- [ ] Offline mode
- [ ] Mobile gestures

### Performance Tests
- [ ] Lighthouse audits (target 90+)
- [ ] Core Web Vitals
- [ ] Slow 3G testing
- [ ] Memory profiling
- [ ] Long session tests

### Cross-Browser Tests
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Chrome Mobile
- [ ] Feature compatibility matrix
- [ ] Document known issues

---

## ⚡ PERFORMANCE

**Image Optimization:**
- [ ] Re-enable Next.js optimization
- [ ] WebP/AVIF support
- [ ] Responsive images
- [ ] Progressive loading

**Bundle Size:**
- [ ] Run bundle analyzer
- [ ] Target < 300KB gzipped
- [ ] More dynamic imports
- [ ] Remove unused deps

**Runtime Performance:**
- [ ] Fix memory leaks
- [ ] Optimize re-renders
- [ ] Improve scroll performance
- [ ] Profile React components

---

## 🎨 UI/UX

**Design Consistency:**
- [ ] Uniform spacing system
- [ ] Consistent loading states
- [ ] Smooth animations
- [ ] Dark mode polish

**Accessibility:**
- [ ] ARIA labels audit
- [ ] Keyboard shortcuts guide
- [ ] Focus indicators
- [ ] Screen reader testing

**Mobile Experience:**
- [ ] Better touch targets (44x44px min)
- [ ] Optimize for one-handed use
- [ ] Better gesture feedback

---

## 📚 DOCUMENTATION

**Code Documentation:**
- [ ] JSDoc for public APIs
- [ ] Component prop docs
- [ ] Hook usage examples
- [ ] Architecture diagrams

**User Documentation:**
- [ ] User guide
- [ ] FAQ page
- [ ] Keyboard shortcuts
- [ ] Troubleshooting

---

## 🔧 TECHNICAL DEBT

**Code Quality:**
- [ ] Remove console.logs
- [ ] Fix TypeScript `any` types
- [ ] Consistent error handling
- [ ] Refactor large components (>300 lines)

**Dependencies:**
- [ ] npm audit fix
- [x] Update documentation (TODO.md, RESPONSIVE_UI_TODO.md)
- [/] Bug Fixes
    - [x] Standardize layout for Ongoing, Ranking, and Homepage (5 cols, 2/3 aspect ratio)
    - [x] Fix Ranking Badge css shape and shadow
    - [x] Fix missing "Đã hoàn thành" section title on Home Page
    - [x] Analyze type error in `ReaderControls.tsx`
- [x] Fix the type mismatch between `BackgroundColor` and `string`
- [x] Verify the fix
- [x] Update TODO.md if necessary
- [x] Proposed commit message
- [x] Search Page UI: Sync layout width, refactor filters (remove genre, compact design)
- [x] Comment Section: Modern dark UI, glassmorphism, floating inputs
- [x] Theme Toggle: Remove broken 'white' background option, default to black
- [x] Ranking Page: Sync badge style, fix clipping, enhance image border

---

## 🚀 ROADMAP

### Sprint 1 (1-2 tuần) - Critical Fixes
- Fix memory leaks
- Fix race conditions
- Cache invalidation
- Core test coverage 50%+

### Sprint 2 (2-3 tuần) - Testing & Quality
- Test coverage → 70%
- Cross-browser testing
- Performance audits
- Accessibility fixes

### Sprint 3 (3-4 tuần) - Backend Integration
- Real bookmarks
- History sync
- Comment system

### Sprint 4 (2-3 tuần) - Advanced Features
- Download manager
- Advanced search
- Recommendations
- Social features (basic)

### Sprint 5 (1-2 tuần) - Polish & Launch
- UI/UX improvements
- Documentation
- Final testing
- Production deployment

---

## 📊 SUCCESS CRITERIA

Project production-ready khi:
- ✅ All CRITICAL bugs fixed
- ✅ Test coverage ≥ 70%
- ✅ Lighthouse score ≥ 90
- ✅ Works on all major browsers
- ✅ WCAG AA compliant
- ✅ Zero critical security vulnerabilities
- ✅ Documentation complete
- ✅ Backend integration stable

---

**Ghi chú quan trọng:**
- Ưu tiên fix bugs trước khi thêm features
- Test coverage phải tăng song song với development
- Cross-browser testing không thể bỏ qua
- Performance là top priority

**Next review:** Sau mỗi sprint (1-2 tuần)
