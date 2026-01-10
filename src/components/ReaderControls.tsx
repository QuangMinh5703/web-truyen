'use client';

import React, { useState } from 'react';
import { PageWidth, useReaderSettings } from '@/lib/hooks/useReaderSettings';
import BookmarkButton from './BookmarkButton';
import { Settings, X } from 'lucide-react';

interface DesktopControlsProps {
    onPrevChapter: () => void;
    isFirstChapter: boolean;
    isNavigating: boolean;
    onChapterNavOpen: () => void;
    readerMode: 'single' | 'continuous';
    setReaderMode: (mode: 'single' | 'continuous') => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    pageWidth: PageWidth;
    setPageWidth: (width: PageWidth) => void;
    chapterId: string;
    storySlug: string;
    onNextChapter: () => void;
    isLastChapter: boolean;
}

const DesktopControls = ({
    onPrevChapter,
    isFirstChapter,
    isNavigating,
    onChapterNavOpen,
    readerMode,
    setReaderMode,
    backgroundColor,
    setBackgroundColor,
    pageWidth,
    setPageWidth,
    chapterId,
    storySlug,
    onNextChapter,
    isLastChapter,
}: DesktopControlsProps) => (
    <div className="hidden lg:flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <button
            onClick={onPrevChapter}
            disabled={isFirstChapter || isNavigating}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            ← Chương trước
        </button>

        <div className="flex items-center space-x-4">
            <button
                onClick={onChapterNavOpen}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
            >
                Mục lục
            </button>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Chế độ:</span>
                <button
                    onClick={() => setReaderMode(readerMode === 'single' ? 'continuous' : 'single')}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                >
                    {readerMode === 'single' ? 'Từng trang' : 'Cuộn liên tục'}
                </button>
            </div>
            <div className="flex items-center space-x-1">
                <button title="Nền trắng" onClick={() => setBackgroundColor('white')} className={`w-6 h-6 rounded-full bg-white border ${backgroundColor === 'white' ? 'ring-2 ring-blue-500' : ''}`}></button>
                <button title="Nền đen" onClick={() => setBackgroundColor('black')} className={`w-6 h-6 rounded-full bg-black border border-gray-600 ${backgroundColor === 'black' ? 'ring-2 ring-blue-500' : ''}`}></button>
                <button title="Nền sepia" onClick={() => setBackgroundColor('sepia')} className={`w-6 h-6 rounded-full bg-yellow-100 border ${backgroundColor === 'sepia' ? 'ring-2 ring-blue-500' : ''}`}></button>
            </div>
            <select onChange={(e) => setPageWidth(e.target.value as PageWidth)} value={pageWidth} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors">
                <option value="fit-width">Vừa chiều rộng</option>
                <option value="fit-height">Vừa chiều cao</option>
                <option value="original">Kích thước gốc</option>
            </select>
            <BookmarkButton chapterId={chapterId} storySlug={storySlug} />
        </div>

        <button
            onClick={onNextChapter}
            disabled={isLastChapter || isNavigating}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            Chương sau →
        </button>
    </div>
);

interface MobileControlsProps {
    onPrevChapter: () => void;
    isFirstChapter: boolean;
    isNavigating: boolean;
    onNextChapter: () => void;
    isLastChapter: boolean;
    onChapterNavOpen: () => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    readerMode: 'single' | 'continuous';
    setReaderMode: (mode: 'single' | 'continuous') => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    pageWidth: PageWidth;
    setPageWidth: (width: PageWidth) => void;
    chapterId: string;
    storySlug: string;
}

const MobileControls = ({
    onPrevChapter,
    isFirstChapter,
    isNavigating,
    onNextChapter,
    isLastChapter,
    onChapterNavOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    readerMode,
    setReaderMode,
    backgroundColor,
    setBackgroundColor,
    pageWidth,
    setPageWidth,
    chapterId,
    storySlug,
}: MobileControlsProps) => (
    <>
        <div className="lg:hidden flex items-center justify-between mb-6 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <button
                onClick={onPrevChapter}
                disabled={isFirstChapter || isNavigating}
                className="px-3 py-2 text-sm rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
                ← Trước
            </button>
            <button
                aria-label="Mở cài đặt"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <Settings className="w-5 h-5" />
            </button>
            <button
                onClick={onNextChapter}
                disabled={isLastChapter || isNavigating}
                className="px-3 py-2 text-sm rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
                Sau →
            </button>
        </div>
        {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
                <div
                    className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-lg z-50 animate-slide-up"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-settings-title"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h4 id="mobile-settings-title" className="font-bold">Cài đặt</h4>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-1" aria-label="Đóng cài đặt">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Chế độ đọc</span>
                            <button
                                onClick={() => setReaderMode(readerMode === 'single' ? 'continuous' : 'single')}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm"
                            >
                                {readerMode === 'single' ? 'Từng trang' : 'Cuộn liên tục'}
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Màu nền</span>
                            <div className="flex items-center space-x-2">
                                <button title="Nền trắng" onClick={() => setBackgroundColor('white')} className={`w-7 h-7 rounded-full bg-white border ${backgroundColor === 'white' ? 'ring-2 ring-blue-500' : ''}`}></button>
                                <button title="Nền đen" onClick={() => setBackgroundColor('black')} className={`w-7 h-7 rounded-full bg-black border border-gray-600 ${backgroundColor === 'black' ? 'ring-2 ring-blue-500' : ''}`}></button>
                                <button title="Nền sepia" onClick={() => setBackgroundColor('sepia')} className={`w-7 h-7 rounded-full bg-yellow-100 border ${backgroundColor === 'sepia' ? 'ring-2 ring-blue-500' : ''}`}></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Chiều rộng trang</span>
                            <select onChange={(e) => setPageWidth(e.target.value as PageWidth)} value={pageWidth} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                                <option value="fit-width">Vừa chiều rộng</option>
                                <option value="fit-height">Vừa chiều cao</option>
                                <option value="original">Kích thước gốc</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Đánh dấu</span>
                            <BookmarkButton chapterId={chapterId} storySlug={storySlug} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Mục lục</span>
                            <button
                                onClick={() => {
                                    onChapterNavOpen();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm"
                            >
                                Mở mục lục
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
);

/**
 * @interface ReaderControlsProps
 * @description Props for the ReaderControls component.
 */
interface ReaderControlsProps {
    /**
   * @property {string} storySlug - The slug of the story, used for bookmarking.
   */
  storySlug: string;
  /**
   * @property {string} chapterId - The ID of the current chapter, used for bookmarking.
   */
  chapterId: string;
  /**
   * @property {() => void} onPrevChapter - Callback to navigate to the previous chapter.
   */
  onPrevChapter: () => void;
  /**
   * @property {() => void} onNextChapter - Callback to navigate to the next chapter.
   */
  onNextChapter: () => void;
  /**
   * @property {() => void} onChapterNavOpen - Callback to open the chapter navigation modal/drawer.
   */
  onChapterNavOpen: () => void;
  /**
   * @property {boolean} isFirstChapter - Flag to disable the 'previous' button.
   */
  isFirstChapter: boolean;
  /**
   * @property {boolean} isLastChapter - Flag to disable the 'next' button.
   */
  isLastChapter: boolean;
  /**
   * @property {boolean} isNavigating - Flag to indicate a chapter transition is in progress.
   */
  isNavigating: boolean;
}

/**
 * Provides UI controls for the comic reader, including chapter navigation,
 * display settings (mode, color, width), and bookmarking.
 * It renders different layouts for desktop and mobile devices.
 *
 * @param {ReaderControlsProps} props - The component props.
 * @returns {JSX.Element} The rendered reader controls.
 */
export const ReaderControls = ({
  storySlug,
  chapterId,
  onPrevChapter,
  onNextChapter,
  onChapterNavOpen,
  isFirstChapter,
  isLastChapter,
  isNavigating,
}: ReaderControlsProps) => {
  const {
    readerMode,
    backgroundColor,
    pageWidth,
    setReaderMode,
    setBackgroundColor,
    setPageWidth,
  } = useReaderSettings();
  
  /**
   * @state {boolean} isMobileMenuOpen - Controls the visibility of the settings menu on mobile.
   */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <DesktopControls
        onPrevChapter={onPrevChapter}
        isFirstChapter={isFirstChapter}
        isNavigating={isNavigating}
        onChapterNavOpen={onChapterNavOpen}
        readerMode={readerMode}
        setReaderMode={setReaderMode}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        pageWidth={pageWidth}
        setPageWidth={setPageWidth}
        chapterId={chapterId}
        storySlug={storySlug}
        onNextChapter={onNextChapter}
        isLastChapter={isLastChapter}
      />
      <MobileControls
        onPrevChapter={onPrevChapter}
        isFirstChapter={isFirstChapter}
        isNavigating={isNavigating}
        onNextChapter={onNextChapter}
        isLastChapter={isLastChapter}
        onChapterNavOpen={onChapterNavOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        readerMode={readerMode}
        setReaderMode={setReaderMode}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        pageWidth={pageWidth}
        setPageWidth={setPageWidth}
        chapterId={chapterId}
        storySlug={storySlug}
      />
    </>
  );
};