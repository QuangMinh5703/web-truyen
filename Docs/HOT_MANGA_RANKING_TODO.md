# 📋 TODO List - Hệ Thống Xếp Hạng Truyện Hot

## 📊 Phân tích hiện trạng

### ✅ Đã có sẵn:
- ✓ `analytics.ts` - Hệ thống tracking cơ bản
- ✓ `TopRankings.tsx` - Component hiển thị ranking (hiện tại dùng API mặc định)
- ✓ `api.ts` - API client cho OTruyen
- ✓ Storage system (localStorage)
- ✓ Next.js 16 với App Router
- ✓ TypeScript + Zustand

### ❌ Cần làm:
- Tracking lượt xem truyện (story views)
- Lưu trữ dữ liệu lượt xem
- Tính toán ranking dựa trên dữ liệu thực
- Cập nhật TopRankings.tsx để dùng data thực

---

## 🎯 Phase 1: Tracking System (Ưu tiên cao)

### 1.1 Tạo file `src/lib/view-tracking.ts`
**Mục đích:** Service để track và lưu trữ lượt xem

**Nội dung cần có:**
```typescript
interface StoryView {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  timestamp: number;
  userId?: string; // Optional, có thể dùng sessionId
  sessionId: string;
}

interface StoryStats {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  totalViews: number;
  uniqueUsers: Set<string>;
  lastViewed: number;
  score: number; // Điểm để ranking
}

class ViewTrackingService {
  // Track khi user vào trang chi tiết truyện
  trackStoryView(story: { id, slug, title })
  
  // Lấy ranking theo khoảng thời gian
  getRanking(period: 'day' | 'week' | 'month' | 'all', limit: number)
  
  // Tính điểm ranking
  calculateScore(stats: StoryStats): number
  
  // Lưu vào localStorage
  saveToStorage()
  
  // Load từ localStorage
  loadFromStorage()
}
```

**Chi tiết:**
- [x] Tạo file mới `src/lib/view-tracking.ts`
- [x] Define interfaces: `StoryView`, `StoryStats`
- [x] Implement `ViewTrackingService` class
- [x] Method `trackStoryView()` - ghi nhận lượt xem
- [x] Method `getRanking()` - tính ranking theo time period
- [x] Method `calculateScore()` - công thức: `totalViews + (uniqueUsers * 2)`
- [x] Method `saveToStorage()` - lưu vào localStorage
- [x] Method `loadFromStorage()` - load từ localStorage
- [x] Export singleton instance

**Estimate:** 2-3 giờ

---

### 1.2 Tạo hook `src/lib/hooks/useViewTracking.ts`
**Mục đích:** React hook để dễ dàng sử dụng trong components

**Nội dung:**
```typescript
export function useViewTracking() {
  const trackView = (story: Story) => { ... }
  const getHotStories = (period, limit) => { ... }
  const getStoryStats = (storyId) => { ... }
  
  return { trackView, getHotStories, getStoryStats }
}
```

**Chi tiết:**
- [x] Tạo file `src/lib/hooks/useViewTracking.ts`
- [x] Implement `trackView()` function
- [x] Implement `getHotStories()` function
- [x] Implement `getStoryStats()` function
- [x] Handle loading states
- [x] Handle error states
- [x] Export hook

**Estimate:** 1 giờ

---

## 🔌 Phase 2: Integration (Ưu tiên cao)

### 2.1 Tích hợp vào trang chi tiết truyện
**File:** `src/app/truyen/[slug]/page.tsx`

**Cần làm:**
- [ ] Import `useViewTracking` hook
- [ ] Gọi `trackView()` trong `useEffect` khi load trang
- [ ] Đảm bảo chỉ track 1 lần mỗi session (dùng ref)
- [ ] Log để debug

**Code mẫu:**
```typescript
'use client';
import { useViewTracking } from '@/lib/hooks/useViewTracking';

export default function StoryDetailPage({ params }) {
  const { trackView } = useViewTracking();
  const trackedRef = useRef(false);
  
  useEffect(() => {
    if (story && !trackedRef.current) {
      trackView({
        id: story._id,
        slug: story.slug,
        title: story.name
      });
      trackedRef.current = true;
    }
  }, [story]);
  
  // ... rest of code
}
```

**Estimate:** 30 phút

---

### 2.2 Tích hợp vào TopRankings component
**File:** `src/components/TopRankings.tsx`

**Cần làm:**
- [ ] Import `useViewTracking` hook
- [ ] Thêm state cho period selection (day/week/month/all)
- [ ] Thêm state cho data source (API/Local)
- [ ] Thay thế `otruyenApi.getHomeStories()` bằng `getHotStories()`
- [ ] Thêm UI để switch giữa các period
- [ ] Thêm toggle để chọn giữa API data vs Local data
- [ ] Handle empty state khi chưa có data

**UI mới cần thêm:**
```typescript
const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week');

// Buttons để switch
<div className="flex gap-2 mb-4">
  <button onClick={() => setPeriod('day')}>Hôm nay</button>
  <button onClick={() => setPeriod('week')}>Tuần này</button>
  <button onClick={() => setPeriod('month')}>Tháng này</button>
  <button onClick={() => setPeriod('all')}>Tất cả</button>
</div>

<div className="flex gap-2 mb-4">
  <button onClick={() => setDataSource('local')}>Dữ liệu thực</button>
  <button onClick={() => setDataSource('api')}>Dữ liệu API</button>
</div>
```

**Estimate:** 2 giờ

---

## 🎨 Phase 3: Enhanced Features (Ưu tiên trung bình)

### 3.1 Tạo trang Ranking riêng (Optional)
**File:** `src/app/ranking/page.tsx`

**Mục đích:** Trang riêng để xem full ranking list

**Nội dung:**
- [ ] Tạo folder `src/app/ranking/`
- [ ] Tạo `page.tsx` với full ranking list
- [ ] Filter theo period (day/week/month/all)
- [ ] Filter theo genre
- [ ] Pagination
- [ ] Search trong ranking
- [ ] Export data (optional)

**Estimate:** 3-4 giờ

---

### 3.2 Cải thiện Analytics integration
**File:** `src/lib/analytics.ts`

**Cần làm:**
- [ ] Thêm method mới vào `AnalyticsService`:
  - `getHotStoriesByAnalytics()` - dùng data từ reading sessions
  - `getStoryEngagement(storyId)` - metrics chi tiết
  - `getTrendingStories()` - stories đang trending up
- [ ] Sync data giữa analytics và view tracking
- [ ] Consolidate dữ liệu định kỳ

**Estimate:** 2 giờ

---

### 3.3 Thêm visual indicators
**Files:** Various components

**Cần làm:**
- [ ] Badge "🔥 Hot" cho top 10 stories
- [ ] Badge "⬆️ Trending" cho stories tăng nhanh
- [ ] Badge "🆕 New" cho stories mới
- [ ] View count display (ví dụ: "👁️ 1.2K views")
- [ ] Ranking change indicator (▲ +3, ▼ -2)
- [ ] Animated transitions khi ranking thay đổi

**Estimate:** 2-3 giờ

---

## 💾 Phase 4: Data Management (Ưu tiên thấp)

### 4.1 Tạo Admin/Debug page
**File:** `src/app/admin/ranking-debug/page.tsx`

**Mục đích:** Debug và manage ranking data

**Nội dung:**
- [ ] Xem raw data
- [ ] Xóa data
- [ ] Import/Export data
- [ ] Simulate views để test
- [ ] View statistics
- [ ] Clear cache

**Estimate:** 2 giờ

---

### 4.2 Data persistence improvements

**Cần làm:**
- [ ] Implement data compression cho localStorage
- [ ] Tự động cleanup old data (> 3 tháng)
- [ ] Backup to cloud (optional - nếu có backend)
- [ ] Sync across devices (optional - nếu có auth)

**Estimate:** 3-4 giờ

---

## 🧪 Phase 5: Testing & Optimization

### 5.1 Testing
- [ ] Viết unit tests cho `view-tracking.ts`
- [ ] Viết integration tests cho tracking flow
- [ ] Test với nhiều edge cases
- [ ] Test performance với large dataset
- [ ] Test localStorage limits

**Estimate:** 3-4 giờ

---

### 5.2 Performance optimization
- [ ] Debounce tracking calls
- [ ] Memoize calculations
- [ ] Lazy load ranking data
- [ ] Optimize re-renders
- [ ] Add loading skeletons

**Estimate:** 2 giờ

---

## 📝 Phase 6: Documentation

- [ ] Document code với JSDoc comments
- [ ] Tạo README cho tracking system
- [ ] Document công thức ranking
- [ ] User guide (how to interpret rankings)
- [ ] API documentation cho các methods

**Estimate:** 1-2 giờ

---

## 🚀 Quick Start Implementation Plan

### Sprint 1 (Ngày 1-2): Core Functionality
1. ✅ Tạo `view-tracking.ts` với basic tracking
2. ✅ Tạo `useViewTracking.ts` hook
3. ✅ Tích hợp vào story detail page
4. ✅ Test tracking hoạt động

### Sprint 2 (Ngày 3-4): UI Integration
1. ✅ Cập nhật `TopRankings.tsx`
2. ✅ Thêm period selection
3. ✅ Thêm data source toggle
4. ✅ Style và polish UI

### Sprint 3 (Ngày 5+): Polish & Enhancement
1. ✅ Add visual indicators
2. ✅ Create ranking page
3. ✅ Add admin debug page
4. ✅ Testing và bug fixes

---

## 🎯 Key Files to Create/Modify

### Tạo mới:
- `src/lib/view-tracking.ts` ⭐⭐⭐
- `src/lib/hooks/useViewTracking.ts` ⭐⭐⭐
- `src/app/ranking/page.tsx` ⭐⭐
- `src/app/admin/ranking-debug/page.tsx` ⭐

### Modify:
- `src/app/truyen/[slug]/page.tsx` ⭐⭐⭐
- `src/components/TopRankings.tsx` ⭐⭐⭐
- `src/lib/analytics.ts` ⭐⭐

**Legend:** ⭐⭐⭐ Quan trọng nhất | ⭐⭐ Quan trọng | ⭐ Optional

---

## 💡 Tips & Best Practices

1. **Start small:** Implement basic tracking trước, rồi mới enhance
2. **Test frequently:** Test sau mỗi feature nhỏ
3. **Use TypeScript:** Giữ type safety chặt chẽ
4. **Handle errors:** Tracking không được fail UI
5. **Performance:** Tracking phải async và không block UI
6. **Privacy:** Không track sensitive info
7. **Clear data:** Cung cấp option để user xóa data

---

## 🐛 Common Issues & Solutions

### Issue 1: localStorage full
**Solution:** Implement data cleanup, compression

### Issue 2: Tracking duplicate views
**Solution:** Use session tracking với ref

### Issue 3: Slow ranking calculation
**Solution:** Cache results, calculate on background

### Issue 4: Data inconsistency
**Solution:** Validate data on load, implement schema versioning

---

## 📊 Success Metrics

Sau khi hoàn thành, bạn nên có:
- ✓ Top 10 stories được xếp hạng theo lượt xem thực
- ✓ Filter theo day/week/month/all
- ✓ Visual indicators (hot, trending, new)
- ✓ Admin page để debug
- ✓ Unit tests coverage > 80%
- ✓ Performance: tracking < 100ms
- ✓ No UI blocking

---

## 🚦 Status Tracking

| Phase | Status | Priority | Estimated Time |
|-------|--------|----------|----------------|
| Phase 1.1 | ✅ Done | 🔴 High | 2-3h |
| Phase 1.2 | ✅ Done | 🔴 High | 1h |
| Phase 2.1 | ⏳ Todo | 🔴 High | 30m |
| Phase 2.2 | ⏳ Todo | 🔴 High | 2h |
| Phase 3.1 | ⏳ Todo | 🟡 Medium | 3-4h |
| Phase 3.2 | ⏳ Todo | 🟡 Medium | 2h |
| Phase 3.3 | ⏳ Todo | 🟡 Medium | 2-3h |
| Phase 4.1 | ⏳ Todo | 🟢 Low | 2h |
| Phase 4.2 | ⏳ Todo | 🟢 Low | 3-4h |
| Phase 5 | ⏳ Todo | 🟡 Medium | 5-6h |
| Phase 6 | ⏳ Todo | 🟢 Low | 1-2h |

**Total estimated time:** 23-30 hours

---

## 🎉 Next Steps

Bắt đầu với **Phase 1.1** - tạo file `view-tracking.ts`. Đây là foundation cho toàn bộ hệ thống. Sau khi xong Phase 1 và 2, bạn sẽ có một hệ thống ranking cơ bản hoạt động được!