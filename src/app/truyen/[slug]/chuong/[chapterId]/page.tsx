'use client';

import { useEffect, useRef, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
// import ChapterNav from '@/components/ChapterNav'; // Removed static import
import ProgressBar from '@/components/ProgressBar';
import { useInView } from 'react-intersection-observer';

import screenfull from 'screenfull';
import { useDrag } from '@use-gesture/react';
import { useReaderSettings } from '@/lib/hooks/useReaderSettings';
import { useChapterData } from '@/lib/hooks/useChapterData';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { useDebounce } from '@/lib/hooks/useDebounce';

const DynamicChapterNav = dynamic(() => import('@/components/ChapterNav'), {
  loading: () => null, // Or a small spinner if desired
});

const DynamicTransformWrapper = dynamic(() => import('react-zoom-pan-pinch').then(mod => mod.TransformWrapper), {
  loading: () => null,
  ssr: false, // react-zoom-pan-pinch might have issues with SSR
});

const DynamicTransformComponent = dynamic(() => import('react-zoom-pan-pinch').then(mod => mod.TransformComponent), {
  loading: () => null,
  ssr: false, // react-zoom-pan-pinch might have issues with SSR
});

const ChapterPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const chapterId = params?.chapterId as string;
  const chapterPageRef = useRef<HTMLDivElement>(null);

  const { readerMode, backgroundColor, pageWidth, isFullscreen, setReaderMode, setBackgroundColor, setPageWidth, toggleFullscreen } = useReaderSettings();
  const { chapter, allChapters, story, loading, error } = useChapterData(slug, chapterId);
  const { currentPage, progress, nextPage, prevPage, goToPage, setCurrentPage } = useReadingProgress(chapterId, chapter);

  const [isNavigating, setIsNavigating] = useState(false); // New state for navigation loading

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Navigation functions wrapped in useCallback for stable references
  const navigateToChapter = useCallback((targetChapterId: string) => {
    setIsNavigating(true); // Set navigating to true when starting navigation
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

  // Debounced navigation functions
  const debouncedPrevPage = useDebounce(prevPage, 300);
  const debouncedHandleNextPage = useDebounce(handleNextPage, 300);
  const debouncedHandleChapterNavigation = useDebounce(handleChapterNavigation, 300);

  const bind = useDrag(({ movement: [mx], last }) => {
    if (readerMode === 'single' && last) {
        if (mx > 50) {
            debouncedPrevPage();
        } else if (mx < -50) {
            debouncedHandleNextPage();
        }
    }
  });

  // Effect for infinite scroll
  useEffect(() => {
    if (inView && readerMode === 'continuous' && !loading) {
      handleChapterNavigation('next'); // Not debouncing here as InView already handles debouncing
    }
  }, [inView, readerMode, loading, handleChapterNavigation]); // Added handleChapterNavigation to dependencies

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readerMode === 'single') {
        if (event.key === 'ArrowLeft' || event.key === 'a') {
          debouncedPrevPage();
        } else if (event.key === 'ArrowRight' || event.key === 'd') {
            debouncedHandleNextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [debouncedPrevPage, debouncedHandleNextPage, readerMode]);

  const handleFullscreen = useCallback(() => {
    if (screenfull.isEnabled && chapterPageRef.current) {
        screenfull.toggle(chapterPageRef.current);
        toggleFullscreen();
    }
  }, [toggleFullscreen]);

  // Effect to reset isNavigating when chapter data loads
  useEffect(() => {
    if (!loading && !error && chapter) {
      setIsNavigating(false);
    }
  }, [chapterId, loading, error, chapter]); // Added chapterId to dependencies

  if (loading || isNavigating) { // Show loading state if either data is loading or navigating
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

  const cdnDomain = 'https://img.otruyenapi.com';
  const currentImageUrl = chapter.content[currentPage] ? `${cdnDomain}${chapter.content[currentPage]}` : '';

  // Preload next 2 images
  const preloadImages = useMemo(() => {
    return chapter.content.slice(currentPage + 1, currentPage + 3).map(image => `${cdnDomain}${image}`);
  }, [chapter.content, currentPage, cdnDomain]);

  return (
    <div className={`min-h-screen --background`} ref={chapterPageRef}>
        <Head>
            {preloadImages.map((imgUrl) => (
              <link key={imgUrl} rel="preload" as="image" href={imgUrl} />
            ))}
        </Head>
      <Navbar className={isFullscreen ? 'hidden' : ''}/>
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
            disabled={(currentPage === chapter.content.length - 1 && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
            className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all ${
              (currentPage === chapter.content.length - 1 && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
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
              Chương {chapter.chapter_name} {chapter.chapter_title && `- ${chapter.chapter_title}`}
            </li>
          </ol>
        </nav>

        {/* Chapter Header */}
        <div className={`text-center mb-6 ${isFullscreen ? 'hidden' : ''}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {story?.name}
          </h1>
          <h2 className="text-xl text-gray-700 mb-2">
            Chương {chapter.chapter_name} {chapter.chapter_title && `- ${chapter.chapter_title}`}
          </h2>
          <p className="text-sm text-gray-600">
            Cập nhật: {new Date(chapter.updatedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className={`mb-6 ${isFullscreen ? 'hidden' : ''}`}>
            <ProgressBar progress={progress} />
        </div>


        {/* Navigation Controls */}
        <div className={`flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm ${isFullscreen ? 'hidden' : ''}`}>
          <button
            onClick={() => debouncedHandleChapterNavigation('prev')}
            disabled={(!allChapters.length || allChapters.findIndex(ch => ch.id === chapterId) === 0) || isNavigating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            ← Chương trước
          </button>

          <div className="flex items-center space-x-4">
            <button
                onClick={() => setIsChapterNavOpen(true)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                Mục lục
              </button>

            {/* Reader Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Chế độ:</span>
              <button
                onClick={() => setReaderMode(readerMode === 'single' ? 'continuous' : 'single')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                {readerMode === 'single' ? 'Từng trang' : 'Cuộn liên tục'}
              </button>
            </div>
            
            {/* Background Color Toggle */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Màu nền:</span>
                <button onClick={() => setBackgroundColor('white')} className={`w-6 h-6 rounded-full bg-white border ${backgroundColor === 'white' ? 'ring-2 ring-blue-500' : ''}`}></button>
                <button onClick={() => setBackgroundColor('black')} className={`w-6 h-6 rounded-full bg-black border ${backgroundColor === 'black' ? 'ring-2 ring-blue-500' : ''}`}></button>
                <button onClick={() => setBackgroundColor('sepia')} className={`w-6 h-6 rounded-full bg-yellow-100 border ${backgroundColor === 'sepia' ? 'ring-2 ring-blue-500' : ''}`}></button>
            </div>
            
            {/* Page Width Toggle */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Chiều rộng:</span>
                <select onChange={(e) => setPageWidth(e.target.value as PageWidth)} value={pageWidth} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors">
                    <option value="fit-width">Vừa chiều rộng</option>
                    <option value="fit-height">Vừa chiều cao</option>
                    <option value="original">Kích thước gốc</option>
                </select>
            </div>

            {/* Fullscreen Toggle */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleFullscreen}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                >
                    {isFullscreen ? 'Thoát' : 'Toàn màn hình'}
                </button>
            </div>
          </div>

          <button
            onClick={() => debouncedHandleChapterNavigation('next')}
            disabled={(!allChapters.length || allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            Chương sau →
          </button>
        </div>

        {/* Chapter Content */}
        <div className={`mb-6 ${pageWidth}`} ref={scrollRef} {...bind()}>
          {readerMode === 'single' ? (
             <Suspense fallback={<div className="text-center py-8">Đang tải công cụ zoom...</div>}>
                <DynamicTransformWrapper>
                    <DynamicTransformComponent>
                        <div className="relative mx-auto max-w-full">
                        {currentImageUrl ? (
                            <div className="relative">
                            {/* Loading skeleton */}
                            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                                <div className="text-gray-500">Đang tải...</div>
                            </div>
                            <Image
                                src={currentImageUrl}
                                alt={`Trang ${currentPage + 1} - ${story?.name} Chương ${chapter.chapter_name}`}
                                width={800}
                                height={1200}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                className="w-full h-auto mx-auto rounded-lg shadow-lg relative z-10"
                                priority
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                                onLoad={(e) => {
                                    // Hide loading skeleton when image loads
                                    const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                                    if (skeleton) skeleton.style.display = 'none';
                                }}
                                onError={(e) => {
                                    console.error('Image load error:', currentImageUrl);
                                    e.currentTarget.src = '/placeholder-image.svg';
                                    // Hide loading skeleton on error too
                                    const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                                    if (skeleton) skeleton.style.display = 'none';
                                }}
                            />
                            </div>
                        ) : (
                            <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Không có hình ảnh</span>
                            </div>
                        )}
                        </div>
                    </DynamicTransformComponent>
                </DynamicTransformWrapper>
             </Suspense>
          ) : (
            <div className="space-y-4">
              {chapter.content.map((imagePath, index) => {
                const imageUrl = `${cdnDomain}${imagePath}`;
                return (
                    <Suspense key={index} fallback={<div className="text-center py-8">Đang tải ảnh...</div>}>
                        <DynamicTransformWrapper>
                            <DynamicTransformComponent>
                                <div className="relative mx-auto max-w-full">
                                    <div className="relative">
                                    {/* Loading skeleton */}
                                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                                        <div className="text-gray-500">Đang tải...</div>
                                    </div>
                                    <Image
                                        src={imageUrl}
                                        alt={`Trang ${index + 1} - ${story?.name} Chương ${chapter.chapter_name}`}
                                        width={800}
                                        height={1200}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                                        className="w-full h-auto mx-auto rounded-lg shadow-lg relative z-10"
                                        loading={index < 3 ? 'eager' : 'lazy'}
                                        onLoad={(e) => {
                                        // Hide loading skeleton when image loads
                                        const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                                        if (skeleton) skeleton.style.display = 'none';
                                        }}
                                        onError={(e) => {
                                        console.error('Image load error:', imageUrl);
                                        e.currentTarget.src = '/placeholder-image.svg';
                                        // Hide loading skeleton on error too
                                        const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                                        if (skeleton) skeleton.style.display = 'none';
                                        }}
                                    />
                                    </div>
                                </div>
                            </DynamicTransformComponent>
                        </DynamicTransformWrapper>
                    </Suspense>
                );
              })}
              {/* Trigger for infinite scroll */}
              <div ref={ref} />
              {isLoadingNextChapter && (
                <div className="text-center py-8">
                  <p>Đang tải chương tiếp theo...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Navigation Dots - Only show for single page mode */}
        {readerMode === 'single' && chapter.content.length > 1 && (
          <div className={`flex justify-center mb-6 ${isFullscreen ? 'hidden' : ''}`}>
            <div className="flex space-x-2 overflow-x-auto max-w-full px-4">
              {chapter.content.map((_, index) => (
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
                        src={`${cdnDomain}${chapter.content[index]}`}
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
              disabled={(currentPage === chapter.content.length - 1 && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1) || isNavigating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (currentPage === chapter.content.length - 1 && allChapters.findIndex(ch => ch.id === chapterId) === allChapters.length - 1)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Trang sau →
            </button>
          </div>
        )}
      </main>

      <FooterComponent className={isFullscreen ? 'hidden' : ''}/>
    </div>
  );
};

export default ChapterPage;