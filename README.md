# M-Truyện

Ứng dụng đọc truyện tranh trực tuyến dành cho thị trường Việt Nam. Hỗ trợ manga, manhwa, manhua với hai chế độ đọc: lật trang đơn (zoom/pan/swipe) và cuộn dọc liên tục (webtoon).

> **Trạng thái:** Beta — Core features hoàn chỉnh, đang trong giai đoạn testing & polish.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 (strict) |
| State | Zustand 5 |
| Reader | @tanstack/react-virtual, react-zoom-pan-pinch, @use-gesture/react |
| PWA | Custom Service Worker, Web App Manifest |
| Testing | Vitest 4, React Testing Library |
| Package Manager | pnpm |

## Bắt đầu

```bash
# Cài dependencies
pnpm install

# Chạy development server
pnpm dev

# Build production
pnpm build

# Chạy production
pnpm start

# Chạy tests
pnpm test

# Lint
pnpm lint
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Cấu trúc dự án

```
m-truyen/
├── Docs/
│   └── TODO.md                     # Task tracker chính
├── public/
│   ├── Black_Ops_One/              # Font tiêu đề
│   ├── Lexend_Exa/                 # Font body/navigation
│   ├── sw.js                       # Service Worker (PWA)
│   └── manifest.json               # PWA manifest
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Trang chủ
│   │   ├── tim-kiem/               # Trang tìm kiếm
│   │   ├── the-loai/[slug]/        # Trang thể loại
│   │   ├── truyen/[slug]/          # Chi tiết truyện
│   │   │   └── chuong/[chapterId]/ # Đọc chương
│   │   ├── xep-hang/               # Bảng xếp hạng
│   │   ├── dang-phat-hanh/         # Truyện đang phát hành
│   │   ├── hoan-thanh/             # Truyện hoàn thành
│   │   ├── bookmarks/              # Danh sách đánh dấu
│   │   ├── history/                # Lịch sử đọc
│   │   └── cache-management/       # Quản lý cache
│   ├── components/                 # React components
│   │   ├── WebtoonReader.tsx       # Reader cuộn dọc (virtualized)
│   │   ├── WebtoonImage.tsx        # Ảnh tối ưu với retry
│   │   ├── ReaderControls.tsx      # Cài đặt reader (desktop + mobile)
│   │   ├── ChapterNav.tsx          # Danh sách chương
│   │   ├── HeroBanner.tsx          # Banner trang chủ
│   │   ├── TopRankings.tsx         # Bảng xếp hạng
│   │   ├── RecentUpdates.tsx       # Truyện cập nhật gần đây
│   │   ├── Navbar.tsx              # Thanh điều hướng
│   │   └── ...                     # Các component khác
│   └── lib/                        # Logic & utilities
│       ├── api.ts                  # API client (OtruyenApi class)
│       ├── cache.ts                # Cache TTL-based
│       ├── types.ts                # TypeScript definitions
│       ├── store.ts                # Zustand store
│       ├── search-engine.ts        # Client-side search engine
│       ├── genres.ts               # Danh sách thể loại dùng chung
│       └── hooks/                  # Custom React hooks
│           ├── useChapterData.ts   # Fetch dữ liệu chương + prefetch
│           ├── useReadingProgress.ts
│           ├── useReaderSettings.ts
│           ├── useBookmarks.ts
│           ├── useReadingHistory.ts
│           └── useMediaQuery.ts    # Responsive hooks
└── tests/
    └── setup.ts                    # Vitest config
```

## Tính năng chính

**Đọc truyện:**
- Chế độ lật trang đơn với zoom, pan, swipe gestures
- Chế độ cuộn dọc liên tục với virtual scrolling (tối ưu cho webtoon)
- Điều hướng bằng bàn phím, cử chỉ chạm, nút bấm
- Tự động prefetch chương tiếp theo
- Tuỳ chỉnh: nền đen/trắng/sepia, chiều rộng trang, ngưỡng swipe

**Khám phá:**
- Trang chủ: Banner, xếp hạng, cập nhật mới, thể loại phổ biến
- Tìm kiếm nâng cao với bộ lọc (thể loại, trạng thái, tác giả)
- Duyệt theo thể loại, trạng thái (đang phát hành / hoàn thành)
- Bảng xếp hạng

**Cá nhân hoá:**
- Đánh dấu chương (bookmarks)
- Theo dõi tiến độ đọc
- Lịch sử đọc & Đọc tiếp
- Lịch sử tìm kiếm

**PWA & Offline:**
- Service Worker với nhiều chiến lược cache (Cache First, Network First)
- Hỗ trợ offline reading
- Quản lý cache (xem dung lượng, xoá cache)

## API

Dữ liệu được lấy từ [otruyenapi.com](https://otruyenapi.com):

| Endpoint | Mô tả |
|---|---|
| `GET /v1/api/home` | Trang chủ |
| `GET /v1/api/danh-sach/{type}` | Danh sách theo phân loại |
| `GET /v1/api/the-loai` | Danh sách thể loại |
| `GET /v1/api/the-loai/{slug}` | Truyện theo thể loại |
| `GET /v1/api/truyen-tranh/{slug}` | Chi tiết truyện |
| `GET /v1/api/tim-kiem?keyword={keyword}` | Tìm kiếm |

CDN ảnh: `https://img.otruyenapi.com`

## Design System

- **Nền:** `#000000` (dark-first)
- **Chữ:** `#FFFFFF`
- **Accent:** Gradient `#A8E300 → #EAF6C6` (lime-green)
- **Font tiêu đề:** Black Ops One
- **Font body:** Lexend Exa (300–700)
- **Responsive:** Mobile-first → 768px (tablet) → 1024px (desktop)
- **Touch target tối thiểu:** 44×44px

Design tokens được định nghĩa dưới dạng CSS variables trong `src/app/globals.css`.

## Known Issues

- Memory leak trong `WebtoonReader` — `imageHeights` state tăng không giới hạn
- Race condition trong `useReadingProgress` — thiếu cleanup khi chuyển chương nhanh
- Tất cả dữ liệu người dùng lưu localStorage (chưa có backend sync)

Chi tiết các bug và task còn lại xem tại [`Docs/TODO.md`](./Docs/TODO.md).

## License

Private project.
