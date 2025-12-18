# TO DO LIST - Cải thiện giao diện đọc truyện tranh

## 📱 1. UX/UI Cơ bản (Priority: HIGH)

### 1.1 Reader Mode Options
- [x] Thêm chế độ đọc: **Single Page** (từng trang) và **Continuous Scroll** (cuộn liên tục)
- [x] Tạo toggle button để chuyển đổi giữa 2 chế độ
- [x] Lưu preference người dùng vào localStorage

### 1.2 Navigation Improvements
- [x] Thêm navigation arrows fixed ở 2 bên màn hình (trái/phải) để chuyển trang nhanh
- [x] Thêm keyboard shortcuts: Arrow Left/Right, A/D để chuyển trang
- [x] Thêm swipe gesture trên mobile (touch events)
- [x] Hiển thị mini thumbnail preview khi hover vào page dots

### 1.3 Chapter Navigation
- [x] Thêm dropdown/sidebar để chuyển chương nhanh mà không cần quay lại trang detail
- [x] Thêm nút "Chương trước" và "Chương sau" (phải fetch danh sách chương của truyện)
- [x] Auto load chương tiếp theo khi đọc đến trang cuối

## 🖼️ 2. Image Optimization (Priority: HIGH)

### 2.1 Loading & Performance
- [x] Implement **progressive image loading** (blur placeholder)
- [x] Preload 2-3 trang tiếp theo để giảm loading time
- [x] Lazy load cho các trang xa (chỉ load khi cần)
- [x] Thêm loading skeleton/spinner khi đang tải ảnh
- [x] Handle image load error với fallback image

### 2.2 Image Quality
- [x] Sử dụng Next.js Image component với proper sizes
- [x] Implement WebP/AVIF format với fallback
- [ ] Tối ưu image quality dựa trên network speed (optional)
- [x] Responsive images cho mobile/tablet/desktop

### 2.3 Zoom & Pan Features
- [x] Thêm zoom in/out functionality (click để zoom)
- [x] Pan/drag khi ảnh được zoom
- [x] Pinch to zoom trên mobile
- [x] Reset zoom khi chuyển trang

## 🎨 3. Reader Experience (Priority: MEDIUM)

### 3.1 Display Options
- [x] **Dark Mode** cho reading experience tốt hơn
- [x] Adjust background color (trắng, đen, sepia)
- [x] Full screen mode (hide navbar, footer)
- [x] Adjust page width (fit width, fit height, original size)

### 3.2 Reading Progress
- [x] Progress bar hiển thị đã đọc bao nhiêu % chapter
- [x] Save reading position (localStorage hoặc API)
- [x] "Continue reading" feature từ trang detail
- [x] Reading history

### 3.3 Comments & Interactions
- [ ] Comment section cho từng chapter
- [ ] Like/bookmark chapter
- [ ] Report lỗi ảnh
- [ ] Share chapter link

## 🔧 4. Technical Improvements (Priority: MEDIUM)

### 4.1 State Management
- [x] Refactor state với useReducer hoặc Zustand cho complex states
- [x] Tách logic thành custom hooks (useChapterReader, useImagePreload)
- [x] Memoization cho expensive calculations

### 4.2 API Integration
- [x] Chuyển đổi các fetch trong `api.ts` từ `baseURL` tĩnh sang sử dụng biến môi trường.
- [x] Cập nhật các hàm `getMangaDetail` và `getChapter` trong `api.ts` để lấy dữ liệu từ `truyenmoicomic` thay vì `nettruyen` và điều chỉnh các kiểu dữ liệu trả về cho phù hợp.
- [x] Tạo một hook (`useTruyenMoiComic.ts`) trong `src/lib/hooks` để quản lý việc gọi API và trạng thái tải dữ liệu (loading, error, success) từ `truyenmoicomic`.
- [x] Fetch danh sách tất cả chapters để navigate
- [x] Cache API responses
- [x] Handle API errors gracefully
- [x] Retry mechanism khi API fail

### 4.3 Performance
- [x] Code splitting cho reader page
- [ ] Virtual scrolling nếu dùng continuous mode với nhiều ảnh
- [x] Debounce scroll events
- [x] Optimize re-renders

## 📊 5. Analytics & Tracking (Priority: LOW)

- [ ] Track reading time
- [ ] Track which pages user viewed
- [ ] Popular chapters analytics
- [ ] Reading completion rate

## 🎯 6. Advanced Features (Priority: LOW)

### 6.1 Webtoon Mode
- [ ] Vertical scrolling mode cho webtoon
- [ ] Auto-detect nếu là webtoon format
- [ ] Smooth infinite scroll

### 6.2 Offline Reading
- [ ] Download chapters để đọc offline
- [ ] Service Worker cho PWA
- [ ] IndexedDB để lưu chapters

### 6.3 AI Features
- [ ] Auto translate (optional)
- [ ] Text extraction từ ảnh (OCR)
- [ ] Smart recommendations

## 🐛 7. Bug Fixes & Edge Cases

- [x] Handle khi chapter không có ảnh
- [x] Handle khi API trả về ảnh broken
- [x] Handle slow network
- [x] Handle khi user spam click navigation
- [ ] Mobile responsive issues
- [ ] Cross-browser testing

## 📝 8. Code Quality

- [ ] Add TypeScript strict types
- [ ] Write unit tests
- [x] Add error boundaries
- [ ] Improve accessibility (a11y)
- [x] Add loading states cho mọi async operations
- [ ] Code documentation

---

## 🚀 Recommended Implementation Order:

1. **Phase 1** (Week 1): UX basics + Image optimization
   - Reader modes
   - Navigation improvements  
   - Image preloading
   - Loading states

2. **Phase 2** (Week 2): Reader experience
   - Dark mode
   - Zoom/pan
   - Full screen
   - Reading progress

3. **Phase 3** (Week 3): Technical improvements
   - State management refactor
   - API caching
   - Performance optimization

4. **Phase 4** (Week 4+): Advanced features
   - Comments
   - Offline mode
   - Advanced analytics

---

## 💡 Key Technologies to Use:

- **next/image**: Image optimization
- **framer-motion**: Smooth animations
- **react-intersection-observer**: Lazy loading
- **zustand** hoặc **jotai**: State management (lightweight)
- **react-zoom-pan-pinch**: Zoom functionality
- **localforage**: Better localStorage alternative
- **react-hot-toast**: User notifications
