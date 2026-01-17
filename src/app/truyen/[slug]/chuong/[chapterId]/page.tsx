'use client';

import { useEffect, useRef, useMemo, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import ProgressBar from '@/components/ProgressBar';
import { useInView } from 'react-intersection-observer';
import { WebtoonImage } from '@/components/WebtoonImage';

import { ReaderControls } from '@/components/ReaderControls';

import screenfull from 'screenfull';
import { useDrag } from '@use-gesture/react';
import { useReaderSettings, PageWidth } from '@/lib/hooks/useReaderSettings';
import { useChapterData } from '@/lib/hooks/useChapterData';
import { Cloudy, CheckCircle, XCircle } from 'lucide-react';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import { getImageUrl } from '@/lib/api';

const SyncStatusIndicator = ({ status }: { status: 'idle' | 'syncing' | 'synced' | 'error' }) => {
    switch (status) {
        case 'syncing':
            return <div className="text-xs text-yellow-400 flex items-center gap-1">
                <Cloudy size={14} className="animate-spin" />
                <span>Đang đồng bộ...</span>
            </div>;
        case 'synced':
            return <div className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle size={14} />
                <span>Đã lưu</span>
            </div>;
        case 'error':
            return <div className="text-xs text-red-400 flex items-center gap-1">
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

const ChapterPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const chapterId = params?.chapterId as string;
  const chapterPageRef = useRef<HTMLDivElement>(null);

  const { readerMode, backgroundColor, pageWidth, isFullscreen, swipeThreshold, setReaderMode, setBackgroundColor, setPageWidth, toggleFullscreen } = useReaderSettings();
  const { chapter, allChapters, story, loading, error } = useChapterData(slug, chapterId);
  const { currentPage, progress, syncStatus, nextPage, prevPage, goToPage, setCurrentPage } = useReadingProgress(slug, chapterId, chapter);

  const [isMounted, setIsMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isChapterNavOpen, setIsChapterNavOpen] = useState(false);
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [swipeOffset, setSwipeOffset] = useState(0);
  const isLoadingNextChapter = isNavigating;

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
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
      if(down) setSwipeOffset(0); // If scrolling vertically, don't allow horizontal movement
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

  // Preload next 2 images
  const preloadImages = useMemo(() => {
    if (!chapter?.images) return [];
    return chapter.images.slice(currentPage + 1, currentPage + 3).map(image => getImageUrl(image));
  }, [chapter, currentPage]);

  if (loading || isNavigating) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="bg-gray-300 aspect-[3/4] rounded-lg"></div>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy chương'}</p>
            <Link href={`/truyen/${slug}`} className="text-blue-600 hover:underline">
              ← Quay lại truyện
            </Link>
          </div>
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
      <Navbar className={isFullscreen ? 'hidden' : ''}/>
      
      <div className={`min-h-screen ${bgClassMap[backgroundColor]}`} ref={chapterPageRef}>
        <Head>
            {preloadImages.map((imgUrl) => (
              <link key={imgUrl} rel="preload" as="image" href={imgUrl} />
            ))}
        </Head>
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
      {readerMode === 'single' && !isFullscreen &&(
        <>
          <button
            onClick={debouncedPrevPage}
            disabled={currentPage === 0 || isNavigating}
            className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all ${
              currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            aria-label="Trang trước"
          >
            ←
          </button>
          <button
            onClick={debouncedHandleNextPage}
            disabled={(currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
            className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all ${
              (currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
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
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/truyen" className="hover:text-blue-600">Truyện tranh</Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/truyen/${slug}`} className="hover:text-blue-600">
                {story?.name || 'Truyện'}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              Chương {chapter.name} {chapter.title && `- ${chapter.title}`}
            </li>
          </ol>
        </nav>

        {/* Chapter Header */}
        <div className={`text-center mb-6 ${isFullscreen ? 'hidden' : ''}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {story?.name}
          </h1>
          <h2 className="text-xl text-gray-700 mb-2">
            Chương {chapter.name} {chapter.title && `- ${chapter.title}`}
          </h2>
          <p className="text-sm text-gray-600">
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

        {/* Page/Sync Status Display */}
        <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg shadow-lg flex flex-col gap-1">
            <div className="text-sm font-bold">
                Trang {currentPage + 1} / {chapter.images?.length || 0}
            </div>
            <div className="text-xs opacity-80">
                {Math.round(progress)}% đã đọc
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
            isMounted && currentImageUrl ? (
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
                                      console.error('Image load error:', currentImageUrl);
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
                    key={`${chapterId}-${index}`}
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

        {/* Page Navigation Dots - Only show for single page mode */}
        {readerMode === 'single' && (chapter.images?.length || 0) > 1 && (
          <div className={`flex justify-center mb-6 ${isFullscreen ? 'hidden' : ''}`}>
            <div className="flex space-x-2 overflow-x-auto max-w-full px-4">
              {chapter.images?.map((_, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => goToPage(index)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      index === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                  {/* Mini thumbnail preview on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Trang {index + 1}
                    </div>
                    <div className="w-16 h-20 bg-gray-300 rounded overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={getImageUrl(chapter.images![index])}
                        alt={`Preview trang ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation - Only show for single page mode */}
        {readerMode === 'single' && (
          <div className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm ${isFullscreen ? 'hidden' : ''}`}>
            <button
              onClick={debouncedPrevPage}
              disabled={currentPage === 0 || isNavigating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              ← Trang trước
            </button>

            <Link
              href={`/truyen/${slug}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Danh sách chương
            </Link>

            <button
              onClick={debouncedHandleNextPage}
              disabled={(currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (currentPage === ((chapter.images?.length || 0) - 1) && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Trang sau →
            </button>
          </div>
        )}
        
        {/* Link to story comments */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-3">
              💬 Muốn chia sẻ suy nghĩ về truyện này?
            </p>
            <Link 
              href={`/truyen/${slug}#comments`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-200"
            >
              Đến trang truyện để bình luận →
            </Link>
          </div>
        </div>
      </main>

      <FooterComponent className={isFullscreen ? 'hidden' : ''}/>
    </div>
    </>
  );
};

export default ChapterPage;
