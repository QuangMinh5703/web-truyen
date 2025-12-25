'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useReaderSettings } from '@/lib/hooks/useReaderSettings';
import { getImageUrl } from '@/lib/api';
import { analytics } from '@/lib/analytics';

/**
 * @interface WebtoonReaderProps
 * @description Props for the WebtoonReader component.
 */
interface WebtoonReaderProps {
  /**
   * @property {string[]} images - Array of image URLs for the chapter.
   */
  images: string[];
  /**
   * @property {string} storyTitle - The title of the story.
   */
  storyTitle: string;
  /**
   * @property {string} chapterName - The name of the current chapter.
   */
  chapterName: string;
  /**
   * @property {string} chapterId - The unique identifier for the current chapter.
   */
  chapterId: string;
  /**
   * @property {(pageNumber: number) => void} [onPageView] - Callback fired when the current page changes.
   */
  onPageView?: (pageNumber: number) => void;
  /**
   * @property {() => void} [onChapterComplete] - Callback fired when the reader reaches the end of the chapter.
   */
  onChapterComplete?: () => void;
}

/**
 * @interface WebtoonPage
 * @description Represents a single page within the webtoon reader.
 */
interface WebtoonPage {
  id: string;
  imageUrl: string;
  height: number;
  width: number;
  isLoaded: boolean;
}

/**
 * A high-performance, virtualized webtoon reader component.
 * It supports vertical scrolling, lazy loading, pre-loading, automatic webtoon format detection,
 * auto-scrolling, and keyboard navigation.
 *
 * @param {WebtoonReaderProps} props - The component props.
 * @returns {JSX.Element} The rendered WebtoonReader component.
 */
export default function WebtoonReader({
  images,
  storyTitle,
  chapterName,
  chapterId,
  onPageView,
  onChapterComplete
}: WebtoonReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * @state {WebtoonPage[]} pages - Holds the state for all pages in the chapter.
   */
  const [pages, setPages] = useState<WebtoonPage[]>([]);
  /**
   * @state {number} currentPageIndex - The index of the page currently in view.
   */
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  /**
   * @state {boolean} isAutoScroll - Flag to enable or disable auto-scrolling.
   */
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  /**
   * @state {number} scrollSpeed - The speed of auto-scrolling (1-5).
   */
  const [scrollSpeed, setScrollSpeed] = useState(1);
    /**
   * @state {number} readingProgress - The user's reading progress as a percentage.
   */
  const [readingProgress, setReadingProgress] = useState(0);

  const { backgroundColor } = useReaderSettings();

  /**
   * @state {boolean} isWebtoon - True if the content is detected as a vertical webtoon.
   */
  const [isWebtoon, setIsWebtoon] = useState(false);
  
  /**
   * @effect Initializes the pages state from the images prop and preloads the first few images.
   */
  useEffect(() => {
    const initialPages: WebtoonPage[] = images.map((image, index) => ({
      id: `page-${index}`,
      imageUrl: getImageUrl(image),
      height: 800, // Default height, will be updated after image loads
      width: 600,  // Default width
      isLoaded: false,
    }));
    
    setPages(initialPages);
    
    // Preload first few images for a smooth start
    initialPages.slice(0, 3).forEach((page, index) => {
      preloadImage(page.imageUrl, index);
    });
  }, [images]);

  /**
   * Preloads an image to get its dimensions and update the page state.
   * @param {string} imageUrl - The URL of the image to preload.
   * @param {number} index - The index of the page to update.
   */
  const preloadImage = (imageUrl: string, index: number) => {
    const img = document.createElement('img');
    img.onload = () => {
      setPages(prev => prev.map((page, i) =>
        i === index
          ? {
              ...page,
              isLoaded: true,
              height: img.naturalHeight,
              width: img.naturalWidth,
            }
          : page
      ));
    };
    img.onerror = () => {
      // Mark as loaded even if there's an error to prevent infinite loading state
      setPages(prev => prev.map((page, i) =>
        i === index ? { ...page, isLoaded: true } : page
      ));
    };
    img.src = imageUrl;
  };

  /**
   * @effect Automatically detects if the comic is a vertical webtoon based on aspect ratio.
   */
  useEffect(() => {
    const loadedPages = pages.filter(p => p.isLoaded && p.height > 100);
    if (loadedPages.length > 0) {
      const totalHeight = loadedPages.reduce((sum, p) => sum + p.height, 0);
      const totalWidth = loadedPages.reduce((sum, p) => sum + p.width, 0);
      const avgAspectRatio = (totalHeight / loadedPages.length) / (totalWidth / loadedPages.length);
      // Webtoons are typically much taller than they are wide.
      if (avgAspectRatio > 1.5) {
        setIsWebtoon(true);
      }
    }
  }, [pages]);

  /**
   * Virtualizer instance from @tanstack/react-virtual for performance.
   */
  const rowVirtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: useCallback((index) => pages[index]?.height || 800, [pages]),
    overscan: 5, // Render more items to make scrolling smoother
  });

  /**
   * Intersection observer to trigger loading more images as the user scrolls.
   */
  const { ref: loadMoreRef, inView } = useInView({
    root: containerRef.current,
    rootMargin: '500px 0px', // Trigger when 500px away from the viewport
  });

  /**
   * @effect Preloads the next batch of images when the `loadMoreRef` comes into view.
   */
  useEffect(() => {
    if (inView) {
      const virtualItems = rowVirtualizer.getVirtualItems();
      if (virtualItems.length === 0) return;

      const lastVisibleIndex = virtualItems[virtualItems.length - 1].index;
      const nextBatchStart = lastVisibleIndex + 1;
      const nextBatchEnd = Math.min(nextBatchStart + 5, pages.length);

      for (let i = nextBatchStart; i < nextBatchEnd; i++) {
        if (!pages[i].isLoaded) {
          preloadImage(pages[i].imageUrl, i);
        }
      }
    }
  }, [inView, pages, rowVirtualizer.getVirtualItems()]);
  
  /**
   * @effect Tracks reading progress and sends analytics events.
   */
  useEffect(() => {
    if (pages.length > 0) {
      const progress = ((currentPageIndex + 1) / pages.length) * 100;
      setReadingProgress(progress);
      onPageView?.(currentPageIndex);
      analytics.trackPageView(storyTitle, chapterId, currentPageIndex);
    }
  }, [currentPageIndex, pages.length, onPageView, chapterId, storyTitle]);

  /**
   * @callback handleScroll
   * @description Updates the current page index based on scroll position.
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const virtualItems = rowVirtualizer.getVirtualItems();
    if(virtualItems.length === 0) return;

    // Find the topmost visible item
    const topVisibleIndex = virtualItems.reduce((prev, curr) => {
        return curr.start < prev.start ? curr : prev;
    }).index;

    if (topVisibleIndex !== currentPageIndex) {
      setCurrentPageIndex(topVisibleIndex);
    }
  }, [rowVirtualizer, currentPageIndex]);
  
  /**
   * @callback startAutoScroll
   * @description Initiates auto-scrolling.
   */
  const startAutoScroll = useCallback(() => {
    setIsAutoScroll(true);
  }, []);

  /**
   * @callback stopAutoScroll
   * @description Stops auto-scrolling.
   */
  const stopAutoScroll = useCallback(() => {
    setIsAutoScroll(false);
  }, []);

  /**
   * @effect Handles the auto-scroll behavior using requestAnimationFrame for smooth scrolling.
   */
  useEffect(() => {
    let animationFrameId: number;
    if (isAutoScroll && containerRef.current) {
      const scroll = () => {
        if (containerRef.current) {
          containerRef.current.scrollBy(0, scrollSpeed);
          animationFrameId = requestAnimationFrame(scroll);
        }
      };
      animationFrameId = requestAnimationFrame(scroll);
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAutoScroll, scrollSpeed]);

  /**
   * @callback scrollToPage
   * @description Smoothly scrolls to a specific page index.
   */
  const scrollToPage = useCallback((pageIndex: number) => {
    rowVirtualizer.scrollToIndex(pageIndex, { align: 'start', smooth: true });
  }, [rowVirtualizer]);

  /**
   * @effect Sets up keyboard shortcuts for navigation.
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case ' ':
          isAutoScroll ? stopAutoScroll() : startAutoScroll();
          break;
        case 'ArrowUp':
          scrollToPage(Math.max(0, currentPageIndex - 1));
          break;
        case 'ArrowDown':
          scrollToPage(Math.min(pages.length - 1, currentPageIndex + 1));
          break;
        case 'Home':
          scrollToPage(0);
          break;
        case 'End':
          scrollToPage(pages.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAutoScroll, startAutoScroll, stopAutoScroll, currentPageIndex, pages.length, scrollToPage]);

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải truyện...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-auto scrollbar-hide"
      style={{ backgroundColor }}
      onScroll={handleScroll}
    >
      {isWebtoon && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          Chế độ Webtoon
        </div>
      )}
      
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={isAutoScroll ? stopAutoScroll : startAutoScroll}
          className={`px-4 py-2 rounded-full font-medium transition-colors shadow-lg ${
            isAutoScroll
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isAutoScroll ? 'Dừng' : 'Tự động'}
        </button>
        
        {isAutoScroll && (
          <div className="bg-black bg-opacity-75 text-white p-2 rounded-lg shadow-lg">
            <label className="block text-xs mb-1">Tốc độ:</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-24"
            />
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="text-sm font-bold">
          Trang {currentPageIndex + 1} / {pages.length}
        </div>
        <div className="text-xs opacity-80">
          {Math.round(readingProgress)}% đã đọc
        </div>
      </div>

      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const page = pages[virtualItem.index];
          if (!page) return null;

          return (
            <div
              key={virtualItem.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                padding: '10px 0',
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {page.isLoaded && page.height > 100 ? (
                  <Image
                    src={page.imageUrl}
                    alt={`${storyTitle} - ${chapterName} - Trang ${virtualItem.index + 1}`}
                    width={page.width}
                    height={page.height}
                    className="max-w-full object-contain rounded-md shadow-md"
                    priority={virtualItem.index < 3} // Prioritize loading the first 3 images
                    sizes="(max-width: 768px) 100vw, 800px"
                    onError={() => {
                      console.error(`Failed to load image: ${page.imageUrl}`);
                    }}
                  />
                ) : (
                  <div className="w-full flex items-center justify-center bg-gray-200 animate-pulse rounded-md" style={{height: virtualItem.size}}>
                    <div className="text-gray-500">Đang tải trang {virtualItem.index + 1}...</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trigger to load more content */}
      <div ref={loadMoreRef} className="h-1" />
      
      {currentPageIndex >= pages.length - 1 && onChapterComplete && (
        <div className="text-center py-16">
          <div className="text-xl font-bold mb-4">
            Đã hoàn thành chương!
          </div>
          <button
              onClick={onChapterComplete}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-transform transform hover:scale-105"
            >
              Chương tiếp theo
            </button>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}