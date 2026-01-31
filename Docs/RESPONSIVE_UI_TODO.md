# TODO LIST - RESPONSIVE UI/UX PROJECT
**Ngày tạo:** 30/01/2026  
**Mục tiêu:** Hoàn thiện tính năng responsive với UI/UX đồng bộ về cỡ chữ, màu sắc trên toàn bộ project

---

## 📋 TÓM TẮT HIỆN TRẠNG
- LƯU Ý: Lấy Trang chủ làm layout mẫu. Các danh sách truyện trong trang "Đang phát hành" làm mẫu cho các danh sách truyện khác.

### ✅ Đã có Design System cơ bản
- CSS Variables cho màu sắc, fonts, kích thước trong `globals.css`
- Font families: `Black Ops One`, `Lexend Exa`
- Màu chủ đạo: Gradient `#A8E300 → #EAF6C6`
- Background: `#000000`, Text: `#FFFFFF`

### ⚠️ Vấn đề hiện tại
1. **Breakpoints không đồng bộ** - Mỗi component sử dụng breakpoints khác nhau
2. **Font sizes hard-coded** - Nhiều component dùng giá trị cố định thay vì responsive
3. **Spacing không nhất quán** - Padding/margin không tuân theo hệ thống
4. **Một số components chưa responsive** - `TopRankings`, `PopularGenres`, `HeroBanner`
5. **Typography không tỉ lệ** - Tiêu đề và text không scale theo viewport

---

## ✅ PHASE 1: Design System Foundation (Priority: HIGH) - HOÀN THÀNH

### 1.1 Cập nhật CSS Variables cho Responsive
- [x] Thêm responsive CSS variables vào `globals.css`:
  - Typography Scale với `clamp()` (--font-size-xs đến --font-size-5xl)
  - Spacing Scale (--space-0 đến --space-24)
  - Container Widths (--container-xs đến --container-3xl)
  - Gray color palette (--gray-100 đến --gray-900)
  - Component-specific variables với responsive values
  - Transitions, Border Radius, Shadows

- [x] Thêm responsive media queries cho CSS variables:
  - Mobile (default): base values
  - Tablet (≥768px): adjusted values
  - Desktop (≥1024px): full values

### 1.2 Chuẩn hóa Breakpoints
- [x] Tạo file `src/lib/breakpoints.ts` với:
  - BREAKPOINTS constants
  - MEDIA_QUERIES strings
  - CONTAINER_WIDTHS
  - SPACING scale
  - TYPOGRAPHY reference
  - Helper functions (isAtBreakpoint, getCurrentBreakpoint, isMobile, isTablet, isDesktop)

- [x] Tạo file `src/lib/hooks/useMediaQuery.ts` với:
  - useMediaQuery hook
  - useBreakpoint hook
  - useWindowSize hook
  - useCurrentBreakpoint hook
  - useResponsive hook
  - useResponsiveValue hook

- [x] Cập nhật utility classes trong globals.css để sử dụng CSS variables mới

---

## ✅ PHASE 2: Navbar Component (Priority: HIGH) - HOÀN THÀNH

### File: `src/components/Navbar.tsx`

### 2.1 Mobile Menu
- [x] Tạo mobile sidebar/drawer menu (Sử dụng `Menu` và `X` icons từ `lucide-react`)
- [x] Thêm hamberger menu animation và transition slide-in
- [x] Di chuyển all menu items (Trang chủ, Đang phát hành...) và Thể loại vào mobile drawer
- [x] Thêm backdrop overlay với hiệu ứng blur khi menu mở

### 2.2 Search Bar Responsive
- [x] Ẩn search bar mặc định trên mobile, thay bằng Search icon
- [x] Click search icon → mở fullscreen search modal với auto-focus
- [x] Đồng bộ logic tìm kiếm giữa desktop và mobile

### 2.3 Genre Dropdown
- [x] Điều chỉnh grid columns responsive: 2 cols (mobile) → 4 cols (desktop)
- [x] Sử dụng backdrop-blur và shadow-2xl cho dropdown desktop
- [x] Tối ưu hóa UI cho mobile với danh sách gọn gàng trong drawer

### 2.4 Logo và Spacing
- [x] Logo size responsive thông qua CSS variables (--height-logo, --width-logo)
- [x] Navbar height responsive (--navbar-height)
- [x] Sử dụng `useResponsive` hook để điều chỉnh layout linh hoạt dữ trên breakpoints.ts
---

## ✅ PHASE 3: HeroBanner Component (Priority: HIGH) - HOÀN THÀNH

### File: `src/components/HeroBanner.tsx`

### 3.1 Banner Dimensions
- [x] Thay đổi fixed height thành responsive:
  - Mobile: 350px
  - Tablet: 500px
  - Desktop: 650px (Giữ nguyên kích thước gốc theo yêu cầu)
- [x] Width: 100% trên mobile, max-width 1300px trên desktop

### 3.2 Content Positioning
- [x] Căn chỉnh content sử dụng Flexbox (justify-end)
- [x] Padding responsive:
  - Mobile: `p-6`
  - Tablet: `p-12`
  - Desktop: `p-16`

### 3.3 Typography
- [x] `.black-ops-one-text` responsive (sử dụng clamp() và responsive classes)
- [x] `.herobanner-description-text` responsive (14px → 20px)

### 3.4 Read Now Button
- [x] Button size responsive (120px mobile → 157px desktop)
- [x] Đảm bảo touch target tốt cho mobile

### 3.5 Slide Indicators
- [x] Di chuyển indicators xuống phía dưới banner trên mobile để không che content
- [x] Tăng touch target cho indicators bằng cách bọc trong button với padding
- [x] Thêm hiệu ứng màu sắc (Lime-400) cho active indicator để dễ nhận diện

---

## ✅ PHASE 4: TopRankings Component (Priority: HIGH) - HOÀN THÀNH

### 4.1 Layout Restructure
- [x] **Mobile (< 768px):** Stack layout (featured story trên, list dưới)
- [x] **Tablet (768px - 1023px):** Side-by-side với tỷ lệ 60/40
- [x] **Desktop (≥ 1024px):** Giữ nguyên tỷ lệ 3/4 và 1/4

### 4.2 Featured Story Card
- [x] Responsive image/thumbnail sizes sử dụng CSS variables
- [x] Content text sizes (Title, Views, Button) tự động căn chỉnh theo viewport

### 4.3 Title Responsive
- [x] `.title-main` và `.top-ranking-title` đã được tối ưu hóa hiển thị trên mọi thiết bị

### 4.4 Ranking List Items
- [x] MangaItem component: Tối ưu hóa thumbnail và font size cho mobile

---

## ✅ PHASE 5: RecentUpdates Component (Priority: MEDIUM) - HOÀN THÀNH

### File: `src/components/RecentUpdates.tsx`

### 5.1 Card Width Responsive
- [x] Đã triển khai chiều ngang card thích ứng:
  - Mobile (< 640px): ~45% (hiển thị 2 cards)
  - Tablet (640px - 1023px): ~33% (hiển thị 3 cards)
  - Desktop (≥ 1024px): 20% (hiển thị 5 cards)
- [x] Tối ưu hóa Loading Skeleton với cùng tỷ lệ responsive

### 5.2 Typography Đồng bộ
- [x] `.recent-update-title` và `.recent-update-sup-title` đã được scale phù hơp
- [x] Đồng bộ hover effects và shadow

### 5.3 Section Title
- [x] Thống nhất `title-main` và spacing với các thành phần khác trên trang chủ

---

## ✅ PHASE 6: PopularGenres Component (Priority: MEDIUM) - HOÀN THÀNH

### File: `src/components/PopularGenres.tsx`

### 6.1 Grid Layout Responsive
- [x] Grid chuyển đổi linh hoạt: 2 cột (mobile) → 3 cột (tablet) → 4 cột (desktop)
- [x] Tối ưu hóa gap (4 md:6) để tiết kiệm không gian màn hình nhỏ

### 6.2 Genre Card Size
- [x] Chiều cao responsive: 150px (mobile) → 175px (tablet) → 200px (desktop)
- [x] Bo góc đồng bộ 2xl cho section container

### 6.3 Genre Text
- [x] `.genres-text` scale mượt mà và căn giữa chuẩn trên mọi thiết bị
- [x] Thêm drop-shadow để tăng tính đọc được trên các màu nền khác nhau

### 6.4 Clip-path Scaling
- [x] Đã sử dụng `cornerSize` và `bottomCut` biến thiên theo breakpoint để đảm bảo hình dáng card cân đối trên mobile

---

## ✅ PHASE 7: StoryGrid Component (Priority: MEDIUM) - HOÀN THÀNH

### File: `src/components/StoryGrid.tsx`

### 7.1 Unified Responsive Grid
- [x] Triển khai grid đa năng: 2 cột (mobile) → 3-4 cột (tablet) → 5-6 cột (desktop)
- [x] Đồng bộ hóa `StoryList.tsx` và các trang danh sách truyện sử dụng `StoryGrid`
- [x] Tối ưu hóa gap và padding cho mobile (`gap-4 sm:gap-6`)

### 7.2 Modernized StoryCard
- [x] Nâng cấp UI: `rounded-xl`, `shadow-lg`, hover effect 3D nhẹ
- [x] Tích hợp chi tiết Views và Rating khi hover trên desktop
- [x] Scale typography mượt mà cho tiêu đề và chương mới

### 7.3 Performance & Loading
- [x] Tích hợp loading skeletons đồng bộ với grid mới
- [x] Tối ưu hóa kích thước ảnh với `sizes` attribute

---

## ✅ PHASE 8: Footer Component (Priority: LOW) - HOÀN THÀNH

### File: `src/components/FooterComponent.tsx`

### 8.1 Layout Responsive
- [x] Đã thay thế `ml-[120px]` bằng `max-w-8xl mx-auto` và responsive padding
- [x] Căn giữa toàn bộ nội dung trên mobile, căn trái trên desktop
- [x] Khoảng cách `mt-12 md:mt-20` đồng bộ với thiết kế

### 8.2 Link Layout
- [x] Mobile: Link xếp dọc (flex-col) để dễ đọc và click
- [x] Desktop: Link xếp ngang (flex-row) với gap hợp lý

### 8.3 Social Icons & Copyright
- [x] Social icons căn giữa trên mobile, có hiệu ứng hover scale và active state
- [x] Thêm thông tin bản quyền và căn chỉnh linh hoạt theo breakpoint
- [x] Các touch target đã được tối ưu cho thiết bị di động

---

## ✅ PHASE 9: Story Detail & Reader Pages (Priority: MEDIUM) - HOÀN THÀNH

### 9.1 Story Detail Page (`/truyen/[slug]`)
- [x] Đã cập nhật responsive và Design System cho:
  - Story info layout (flex-col lg:flex-row)
  - Chapter list grid (responsive grid-cols)
  - Comment section integration

### 9.2 Chapter Reader Page
- [x] `ReaderControls.tsx` - Tối ưu hóa mobile drawer và desktop controls
- [x] `WebtoonReader.tsx` - Cập nhật lime-400 theme và responsive overlays
- [x] `WebtoonImage.tsx` - Cải thiện loading skeleton và error UI

---

## ✅ PHASE 10: Search & Other Pages (Priority: LOW)
[DONE]
### 10.1 Search Page (`/tim-kiem`)
- [x] `SearchFiltersPanel.tsx` responsive
- [x] `SearchAutocomplete.tsx` responsive
- [x] `SearchSortBar.tsx` responsive

### 10.2 Genre Page (`/the-loai/[slug]`)
- [x] Review layout responsive

### 10.3 Ranking Page (`/xep-hang`)
- [x] Review layout responsive

---

## 🎯 PHASE 11: Global UI Polish (Priority: MEDIUM)

### 11.1 Touch Targets
- [x] Standardized Navbar mobile buttons (44px)
- [x] Standardized ReaderControls mobile buttons (44px)
- [x] Audit all story cards and pagination buttons for 44px touch targets

### 11.2 Loading States
- [x] Verified Skeletons in Genre/Ranking pages
- [x] Implement responsive skeleton height for HeroBanner

### 11.3 Error States
- [x] Standardize Error UI with brand colors and responsive layout across all pages

### 11.4 Scroll Behavior
- [x] Added `snap-x` utilities in `globals.css`
- [x] Apply `snap-x` to `RecentUpdates.tsx` and horizontal carousels
- [x] Fixed `scrollbar-hide` standardization

---

## 🧪 PHASE 12: Testing & Validation (Priority: HIGH)

### 12.1 Device Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPhone 12/13 Pro Max (428px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px, 1440px, 1920px)

### 12.2 Orientation Testing
- [ ] Portrait mode all devices
- [ ] Landscape mode all devices

### 12.3 Browser Testing
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Chrome Desktop
- [ ] Safari Desktop
- [ ] Firefox Desktop
- [ ] Edge

---

## 📏 COLOR & TYPOGRAPHY REFERENCE

### Brand Colors (Từ globals.css)
```css
--background: #000000
--foreground: #FFFFFF
--main-color-gradient: linear-gradient(to bottom, #A8E300 0%, #EAF6C6 100%)
--ranking-banner-color: linear-gradient(to bottom, #B7F700 0%, #FCFF00 100%)
--color-background-navbar: rgba(0, 0, 0, 1)
--color-background-search: #212121
```

### Font Sizes Reference (Cần chuẩn hóa)
| Class Name | Desktop | Tablet | Mobile |
|------------|---------|--------|--------|
| `.title-main` | 40px | 32px | 24px |
| `.black-ops-one-text` | 39px | 32px | 24px |
| `.top-ranking-title` | 35px | 28px | 20px |
| `.navbar-text-gradient` | 30px | 24px | 20px |
| `.herobanner-description-text` | 20px | 16px | 14px |
| `.genres-text` | 20px | 16px | 14px |
| `.navbar-text` | 15px | 15px | 14px |
| `.story-list-name` | 15px | 14px | 13px |
| `.recent-update-title` | 15px | 14px | 13px |
| `.footer-text` | 15px | 14px | 12px |

### Typography System
```css
--font-black-ops-one: 'Black Ops One' (Tiêu đề lớn)
--font-lexend-exa: 'Lexend Exa', 'Lexend Exa Fallback' (Body, Navigation)
```

---

## 🚀 SPRINT PLAN

### Sprint 1 (Tuần 1) - Foundation & Critical Components
- [x] PHASE 1: Design System Foundation ✅
- [x] PHASE 2: Navbar Component ✅
- [x] PHASE 3: HeroBanner Component ✅
- [x] PHASE 4: TopRankings Component ✅

### Sprint 2 (Tuần 2) - Content Components
- [x] PHASE 5: RecentUpdates Component ✅
- [x] PHASE 6: PopularGenres Component ✅
- [x] PHASE 7: StoryGrid Component ✅
- [x] PHASE 8: Footer Component ✅

### Sprint 3 (Tuần 3) - Pages & Polish
- [x] PHASE 9: Story Detail & Reader Pages ✅
- [x] PHASE 10: Search & Other Pages ✅
- [ ] PHASE 11: Global UI Polish

### Sprint 4 (Tuần 4) - Testing & Finalize
- [ ] PHASE 12: Testing & Validation
- [ ] Bug fixes và polish cuối cùng

---

## ✅ CHECKLIST TRƯỚC KHI HOÀN THÀNH

- [ ] Tất cả components responsive từ 320px → 1920px+
- [ ] Typography scale smooth và consistent
- [ ] Colors đồng bộ với design system
- [ ] Touch targets ≥ 44px trên mobile
- [ ] No horizontal scroll trên mobile (trừ intentional carousels)
- [ ] Images optimized cho các breakpoints
- [ ] Loading/error states responsive
- [ ] Tested trên tất cả major devices và browsers

---

**Last updated:** 30/01/2026 22:55
