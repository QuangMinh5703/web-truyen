'use client';

import { useEffect, useRef, useMemo, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import ProgressBar from '@/components/ProgressBar';
import { useInView } from 'react-intersection-observer';
import { WebtoonImage } from '@/components/WebtoonImage';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

import { ReaderControls } from '@/components/ReaderControls';

import screenfull from 'screenfull';
import { useDrag } from '@use-gesture/react';
import { useReaderSettings, PageWidth } from '@/lib/hooks/useReaderSettings';
import { useChapterData } from '@/lib/hooks/useChapterData';
import { Cloudy, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import { getImageUrl } from '@/lib/api';

const SyncStatusIndicator = ({ status }: { status: 'idle' | 'syncing' | 'synced' | 'error' }) => {
  switch (status) {
    case 'syncing':
      return <div className="text-[10px] md:text-xs text-yellow-400 flex items-center gap-1 font-bold uppercase tracking-wider">
        <Cloudy size={14} className="animate-spin" />
        <span>Đang đồng bộ</span>
      </div>;
    case 'synced':
      return <div className="text-[10px] md:text-xs text-lime-400 flex items-center gap-1 font-bold uppercase tracking-wider">
        <CheckCircle size={14} />
        <span>Đã lưu</span>
      </div>;
    case 'error':
      return <div className="text-[10px] md:text-xs text-red-500 flex items-center gap-1 font-bold uppercase tracking-wider">
        <XCircle size={14} />
        <span>Lỗi đồng bộ</span>
      </div>;
    default:
      return null;
  }
};

const DynamicWebtoonReader = dynamic(() => import('@/components/WebtoonReader'), {
  loading: () => <div className="text-center py-12">Đang tải trình đọc...</div>,
  ssr: false,
});


const DynamicChapterNav = dynamic(() => import('@/components/ChapterNav'), {
  loading: () => null,
});

const DynamicTransformWrapper = dynamic(() => import('react-zoom-pan-pinch').then(mod => mod.TransformWrapper), {
  loading: () => null,
  ssr: false,
});

const DynamicTransformComponent = dynamic(() => import('react-zoom-pan-pinch').then(mod => mod.TransformComponent), {
  loading: () => null,
  ssr: false,
});

const ChapterPageClient = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const chapterId = params?.chapterId as string;
  const chapterPageRef = useRef<HTMLDivElement>(null);

  const { readerMode, backgroundColor, pageWidth, isFullscreen, swipeThreshold, setReaderMode, setBackgroundColor, setPageWidth, toggleFullscreen } = useReaderSettings();
  const { chapter, allChapters, story, loading, error } = useChapterData(slug, chapterId);
  const { currentPage, progress, syncStatus, nextPage, prevPage, goToPage, setCurrentPage } = useReadingProgress(slug, chapterId, chapter);

  const [isNavigating, setIsNavigating] = useState(false);
  const [isChapterNavOpen, setIsChapterNavOpen] = useState(false);
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showPageIndicator, setShowPageIndicator] = useState(true);
  const isLoadingNextChapter = isNavigating;

  // Auto-hide page indicator after 2.5s of inactivity
  useEffect(() => {
    setShowPageIndicator(true);
    const timer = setTimeout(() => setShowPageIndicator(false), 2500);
    return () => clearTimeout(timer);
  }, [currentPage, syncStatus]);

  // isMounted useEffect removed

  const { ref: infiniteScrollRef, inView: infiniteScrollInView } = useInView({
    triggerOnce: false,
    rootMargin: '200px 0px',
  });

  // Handle measured image heights for continuous mode
  const handleImageHeightMeasured = useCallback((index: number, height: number) => {
    setImageHeights(prev => ({
      ...prev,
      [index]: height
    }));
  }, []);

  // Navigation functions
  const navigateToChapter = useCallback((targetChapterId: string) => {
    setIsNavigating(true);
    router.push(`/truyen/${slug}/chuong/${targetChapterId}`);
  }, [router, slug]);

  const handleChapterNavigation = useCallback((direction: 'prev' | 'next') => {
    if (!chapter || allChapters.length === 0) return;

    const currentChapterIndex = allChapters.findIndex(ch => ch.id === chapterId);
    if (currentChapterIndex === -1) return;

    const targetChapterIndex = direction === 'next'
      ? currentChapterIndex + 1
      : currentChapterIndex - 1;

    if (targetChapterIndex >= 0 && targetChapterIndex < allChapters.length) {
      const targetChapter = allChapters[targetChapterIndex];
      if (targetChapter.id) {
        navigateToChapter(targetChapter.id);
      }
    }
  }, [chapter, allChapters, chapterId, navigateToChapter]);

  const handleNextPage = useCallback(() => {
    if (!nextPage()) {
      handleChapterNavigation('next');
    }
  }, [nextPage, handleChapterNavigation]);

  // Debounced navigation
  const debouncedPrevPage = useDebouncedCallback(prevPage, 200);
  const debouncedHandleNextPage = useDebouncedCallback(handleNextPage, 200);
  const debouncedHandleChapterNavigation = useDebouncedCallback(handleChapterNavigation, 300);

  const bind = useDrag(({ down, movement: [mx, my], direction: [dx], last }) => {
    if (readerMode !== 'single') return;

    // Only respond to horizontal swipes
    if (Math.abs(mx) < Math.abs(my)) {
      if (down) setSwipeOffset(0); // If scrolling vertically, don't allow horizontal movement
      return;
    }

    if (down) {
      setSwipeOffset(mx);
    } else if (last) {
      if (mx > swipeThreshold) {
        debouncedPrevPage();
      } else if (mx < -swipeThreshold) {
        debouncedHandleNextPage();
      }
      // Reset position with animation
      setSwipeOffset(0);
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (readerMode === 'single') {
        switch (event.key.toLowerCase()) {
          case 'arrowleft':
          case 'a':
            debouncedPrevPage();
            break;
          case 'arrowright':
          case 'd':
            debouncedHandleNextPage();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [readerMode, debouncedPrevPage, debouncedHandleNextPage]);

  const handleReportError = (imageUrl: string) => {
    const storyName = story?.name || slug;
    const chapterName = chapter?.name ?? chapterId;
    const subject = `Báo lỗi ảnh truyện: ${storyName} - Chương ${chapterName}`;
    const body = `
      Link truyện: ${window.location.href}
      Link ảnh lỗi: ${imageUrl}
      
      Mô tả lỗi:
    `;
    window.location.href = `mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const currentImageUrl = useMemo(() => {
    return chapter?.images?.[currentPage] ? getImageUrl(chapter.images[currentPage]) : '';
  }, [chapter, currentPage]);

  // Preload next 5 images for smoother reading on slow connections
  const preloadImages = useMemo(() => {
    if (!chapter?.images) return [];
    return chapter.images.slice(currentPage + 1, currentPage + 6).map(image => getImageUrl(image));
  }, [chapter, currentPage]);

  // Preload images via DOM link elements (replaces broken next/head usage)
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    preloadImages.forEach((imgUrl) => {
      if (!imgUrl) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imgUrl;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => {
      links.forEach((link) => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [preloadImages]);

  if (loading || isNavigating) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-4"></div>
            <div className="bg-gray-800 aspect-[3/4] rounded-lg"></div>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen --background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <ErrorDisplay
            message={error || 'Không tìm thấy chương'}
            onRetry={() => window.location.reload()}
          />
        </main>
        <FooterComponent />
      </div>
    );
  }

  const bgClassMap = {
    white: 'bg-white text-black',
    black: 'bg-black text-white',
    sepia: 'bg-[#fbf0d9] text-[#5b4636]',
  };

  return (
    <>
      {/* Navbar nằm NGOÀI container bị ảnh hưởng */}
      <Navbar className={isFullscreen ? 'hidden' : ''} />

      <div className={`min-h-screen ${bgClassMap[backgroundColor]}`} ref={chapterPageRef}>
        {/* Image preloading via useEffect — next/head does not work in App Router */}
        <Suspense fallback={null}>
          <DynamicChapterNav
            isOpen={isChapterNavOpen}
            onClose={() => setIsChapterNavOpen(false)}
            chapters={allChapters}
            currentChapterId={chapterId}
            storySlug={slug}
          />
        </Suspense>

        {/* Fixed Navigation Arrows */}
        {readerMode === 'single' && !isFullscreen && (
          <>
            <button
              onClick={debouncedPrevPage}
              disabled={currentPage === 0 || isNavigating}
              className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                }`}
              aria-label="Trang trước"
            >
              ←
            </button>
            <button
              onClick={debouncedHandleNextPage}
              disabled={(currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
              className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all ${(currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                }`}
              aria-label="Trang sau"
            >
              →
            </button>
          </>
        )}

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className={`mb-6 ${isFullscreen ? 'hidden' : ''}`}>
            <ol className="flex flex-wrap items-center space-x-2 text-xs md:text-sm text-gray-500 font-medium uppercase tracking-widest">
              <li>
                <Link href="/" className="hover:text-lime-400 transition-colors">TRANG CHỦ</Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/truyen/${slug}`} className="hover:text-lime-400 transition-colors truncate max-w-[120px] md:max-w-none">
                  {story?.name || 'Truyện'}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-300 font-bold">
                CHƯƠNG {chapter.name}
              </li>
            </ol>
          </nav>

          {/* Chapter Header */}
          <div className={`text-center mb-8 ${isFullscreen ? 'hidden' : ''}`}>
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase mb-2 leading-tight title-main">
              {story?.name}
            </h1>
            <h2 className="text-lg md:text-xl text-lime-400 font-bold uppercase tracking-widest">
              Chương {chapter.name} {chapter.title && `- ${chapter.title}`}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">
              Cập nhật: {new Date(chapter.updatedAt ?? '').toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className={`mb-6 ${isFullscreen ? 'hidden' : ''}`}>
            <ProgressBar progress={progress} />
          </div>

          {/* Navigation Controls */}
          <ReaderControls
            storySlug={slug}
            chapterId={chapterId}
            onPrevChapter={() => debouncedHandleChapterNavigation('prev')}
            onNextChapter={() => debouncedHandleChapterNavigation('next')}
            onChapterNavOpen={() => setIsChapterNavOpen(true)}
            isFirstChapter={allChapters.findIndex(ch => ch.id === chapterId) === 0}
            isLastChapter={allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1}
            isNavigating={isNavigating}
          />

          {/* Page/Sync Status Display — auto-hides after 2.5s, repositioned to avoid mobile bottom controls */}
          <div
            className={`fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 bg-black/80 backdrop-blur-md text-white px-3 py-2.5 md:px-4 md:py-3 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-1.5 min-w-[100px] md:min-w-[120px] transition-all duration-300 ${
              showPageIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <div className="text-[10px] md:text-xs font-black uppercase tracking-wider">
              Trang {currentPage + 1} / {chapter.images?.length || 0}
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <SyncStatusIndicator status={syncStatus} />
          </div>

          {/* Chapter Content */}
          <div
            className={`mb-6 ${pageWidth} overflow-hidden`}
            ref={chapterPageRef}
            style={{ touchAction: 'pan-y' }}
            {...bind()}
          >
            {readerMode === 'single' ? (
              currentImageUrl ? (
                <DynamicTransformWrapper key={currentImageUrl}>
                  <DynamicTransformComponent>
                    <div
                      style={{
                        transform: `translateX(${swipeOffset}px)`,
                        transition: 'transform 0.1s ease-out',
                      }}
                    >
                      <div className="relative mx-auto max-w-full">
                        <div className="relative">
                          {/* Loading skeleton */}
                          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                            <div className="text-gray-500">Đang tải...</div>
                          </div>
                          <Image
                            src={currentImageUrl}
                            alt={`Trang ${currentPage + 1} - ${story?.name} Chương ${chapter.name ?? chapterId}`}
                            width={800}
                            height={1200}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            className="w-full h-auto mx-auto rounded-lg shadow-lg relative z-10"
                            priority
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                            onLoad={(e) => {
                              const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                              if (skeleton) skeleton.style.display = 'none';
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.svg';
                              const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                              if (skeleton) skeleton.style.display = 'none';
                            }}
                          />
                          <button
                            onClick={() => handleReportError(currentImageUrl)}
                            className="absolute bottom-4 right-4 bg-red-600 text-white px-2 py-1 text-xs rounded opacity-50 hover:opacity-100 transition-opacity"
                          >
                            Báo lỗi
                          </button>
                        </div>
                      </div>
                    </div>
                  </DynamicTransformComponent>
                </DynamicTransformWrapper>
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">{loading || isNavigating ? 'Đang tải...' : 'Không có hình ảnh'}</span>
                </div>
              )
            ) : (
              // Continuous scroll mode - Hiển thị ảnh dài liên tục
              <div className="space-y-2">
                {chapter.images?.map((imagePath, index) => {
                  const imageUrl = getImageUrl(imagePath);
                  return (
                    <WebtoonImage
                      key={`${chapterId}-${index}-${imageUrl}`}
                      src={imageUrl}
                      alt={`Trang ${index + 1} - ${story?.name} Chương ${chapter.name ?? chapterId}`}
                      index={index}
                      priority={index < 3}
                      onHeightMeasured={(height) => handleImageHeightMeasured(index, height)}
                    />
                  );
                })}

                {/* Trigger for infinite scroll */}
                <div ref={infiniteScrollRef} />
                {isLoadingNextChapter && (
                  <div className="text-center py-8">
                    <p>Đang tải chương tiếp theo...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compact Page Navigator — replaces per-page dots that overflow on 80+ page chapters */}
          {readerMode === 'single' && (chapter.images?.length || 0) > 1 && (
            <div className={`mb-10 ${isFullscreen ? 'hidden' : ''}`}>
              <div className="flex flex-col items-center gap-4">
                {/* Page indicator tap target */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => goToPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center
                               hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    aria-label="Trang trước"
                  >
                    ←
                  </button>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <input
                      type="number"
                      min={1}
                      max={chapter.images?.length || 1}
                      value={currentPage + 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= (chapter.images?.length || 1)) {
                          goToPage(val - 1);
                        }
                      }}
                      className="w-12 text-center bg-transparent text-lime-400 font-black text-base
                                 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Nhập số trang"
                    />
                    <span className="text-gray-500 font-bold text-sm">/</span>
                    <span className="text-gray-400 font-bold text-sm">{chapter.images?.length || 0}</span>
                  </div>

                  <button
                    onClick={() => goToPage(Math.min((chapter.images?.length || 1) - 1, currentPage + 1))}
                    disabled={currentPage === (chapter.images?.length || 1) - 1}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center
                               hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    aria-label="Trang sau"
                  >
                    →
                  </button>
                </div>

                {/* Page slider for quick jump */}
                <div className="w-full max-w-md px-4">
                  <input
                    type="range"
                    min={0}
                    max={(chapter.images?.length || 1) - 1}
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-400
                               [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,227,0,0.4)]
                               [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                               [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-lime-400 [&::-moz-range-thumb]:border-0"
                    aria-label="Thanh chuyển trang"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation - Only show for single page mode */}
          {readerMode === 'single' && (
            <div className={`flex items-center justify-between p-2 md:p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl ${isFullscreen ? 'hidden' : ''}`}>
              <button
                onClick={debouncedPrevPage}
                disabled={currentPage === 0 || isNavigating}
                className={`px-4 md:px-6 py-3.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${currentPage === 0
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                ← TRƯỚC
              </button>

              <Link
                href={`/truyen/${slug}`}
                className="px-4 md:px-6 py-3.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 text-xs md:text-sm font-bold uppercase tracking-widest transition-all"
              >
                MỤC LỤC
              </Link>

              <button
                onClick={debouncedHandleNextPage}
                disabled={(currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
                className={`px-4 md:px-6 py-3.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${(currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1)
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-lime-500 text-black hover:bg-lime-400'
                  }`}
              >
                SAU →
              </button>
            </div>
          )}

          {/* Link to story comments */}
          <div className="mt-12 p-8 bg-white/5 rounded-[2rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 blur-3xl -mr-16 -mt-16 group-hover:bg-lime-400/10 transition-colors"></div>
            <div className="text-center relative z-10">
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-4">
                Cộng đồng bàn luận
              </p>
              <p className="text-white font-black text-lg md:text-xl mb-6">
                Và nhiều người khác đang chia sẻ suy nghĩ...
              </p>
              <Link
                href={`/truyen/${slug}#comments`}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-lime-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lime-500/20"
              >
                XEM BÌNH LUẬN <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </main>

        <FooterComponent className={isFullscreen ? 'hidden' : ''} />
      </div>
    </>
  );
};

export default ChapterPageClient;
