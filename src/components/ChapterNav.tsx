'use client';

import { UiChapter } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * @interface ChapterNavProps
 * @description Props for the ChapterNav component.
 */
interface ChapterNavProps {
  /**
   * @property {UiChapter[]} chapters - The list of all chapters for the story.
   */
  chapters: UiChapter[];
  /**
   * @property {string} currentChapterId - The ID of the currently active chapter.
   */
  currentChapterId: string;
  /**
   * @property {string} storySlug - The slug of the story, used to build chapter URLs.
   */
  storySlug: string;
  /**
   * @property {boolean} isOpen - Controls the visibility of the navigation modal.
   */
  isOpen: boolean;
  /**
   * @property {() => void} onClose - Callback function to close the modal.
   */
  onClose: () => void;
}

/**
 * A modal component that displays a list of chapters for easy navigation.
 *
 * @param {ChapterNavProps} props - The component props.
 * @returns {JSX.Element | null} The rendered chapter navigation modal, or null if not open.
 */
const ChapterNav = ({ chapters, currentChapterId, storySlug, isOpen, onClose }: ChapterNavProps) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const currentChapterRef = useRef<HTMLLIElement>(null);

  /**
   * @effect Scrolls the current chapter into view when the modal is opened.
   */
  useEffect(() => {
    if (isOpen && currentChapterRef.current) {
      currentChapterRef.current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [isOpen]);

  /**
   * @effect Handles keyboard navigation (e.g., closing with Escape key).
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }

  const handleChapterClick = (chapterId: string) => {
    router.push(`/truyen/${storySlug}/chuong/${chapterId}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-nav-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-md max-h-[80vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h3 id="chapter-nav-title" className="text-lg font-bold">Danh sách chương</h3>
        </div>
        <ul className="divide-y dark:divide-gray-700 overflow-y-auto">
          {chapters.map((chapter) => (
            <li 
              key={chapter.id}
              ref={chapter.id === currentChapterId ? currentChapterRef : null}
            >
              <button
                onClick={() => handleChapterClick(chapter.id!)}
                className={`w-full text-left px-4 py-3 transition-colors text-gray-700 dark:text-gray-300 ${
                  chapter.id === currentChapterId
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {chapter.title || `Chương ${chapter.name}`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChapterNav;
