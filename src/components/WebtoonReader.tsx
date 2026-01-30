'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { WebtoonImage } from './WebtoonImage';
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
   * @effect Initializes the pages state from the images prop.
   */
  useEffect(() => {
    const initialPages: WebtoonPage[] = images.map((image, index) => ({
      id: `page-${index}`,
      imageUrl: getImageUrl(image),
      height: 800, // Default height, will be updated after image loads
    }));

    setPages(initialPages);
  }, [images]);

  const handleHeightMeasured = useCallback((index: number, height: number) => {
    if (height > 0) {
      setPages(prev => {
        const newPages = [...prev];
        if (newPages[index] && newPages[index].height !== height) {
          newPages[index] = { ...newPages[index], height };
          return newPages;
        }
        return prev;
      });
    }
  }, []);

  /**
   * Virtualizer instance from @tanstack/react-virtual for performance.
   */
  const rowVirtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: useCallback((index) => pages[index]?.height || 800, [pages]),
    overscan: 3, // Reduce overscan to be more aggressive with memory
  });

  /**
   * Intersection observer to trigger loading more images as the user scrolls.
   */
  const { ref: loadMoreRef } = useInView({
    root: containerRef.current,
    rootMargin: '500px 0px', // Trigger when 500px away from the viewport
  });

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
    if (virtualItems.length === 0) return;

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
    rowVirtualizer.scrollToIndex(pageIndex, { align: 'start', behavior: 'smooth' });
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

      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div
          className="h-full bg-lime-400 shadow-[0_0_10px_rgba(168,227,0,0.5)] transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <button
          onClick={isAutoScroll ? stopAutoScroll : startAutoScroll}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl border ${isAutoScroll
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-lime-500 text-black border-lime-400'
            }`}
        >
          {isAutoScroll ? 'DỪNG' : 'TỰ ĐỘNG'}
        </button>

        {isAutoScroll && (
          <div className="bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[140px]">
            <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-gray-400">Tốc độ cuộn</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-full accent-lime-400 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-6 z-40 bg-black/80 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-1.5 min-w-[120px]">
        <div className="text-xs font-black uppercase tracking-wider">
          Trang {currentPageIndex + 1} / {pages.length}
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime-400 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
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
              <WebtoonImage
                src={page.imageUrl}
                alt={`${storyTitle} - ${chapterName} - Trang ${virtualItem.index + 1}`}
                index={virtualItem.index}
                priority={virtualItem.index < 3}
                onHeightMeasured={(height) => handleHeightMeasured(virtualItem.index, height)}
              />
            </div>
          );
        })}
      </div>

      {/* Trigger to load more content */}
      <div ref={loadMoreRef} className="h-1" />

      {currentPageIndex >= pages.length - 1 && onChapterComplete && (
        <div className="text-center py-20 px-6">
          <div className="text-xl md:text-2xl font-black uppercase tracking-widest mb-6 title-main">
            HẾT CHƯƠNG RỒI!
          </div>
          <button
            onClick={onChapterComplete}
            className="bg-lime-500 hover:bg-lime-400 text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-lime-500/20"
          >
            CHƯƠNG TIẾP THEO
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