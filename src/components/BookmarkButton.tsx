// src/components/BookmarkButton.tsx
'use client';

import React from 'react';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { Bookmark } from 'lucide-react';

/**
 * @interface BookmarkButtonProps
 * @description Props for the BookmarkButton component.
 */
interface BookmarkButtonProps {
  /**
   * @property {string} chapterId - The unique identifier of the chapter to be bookmarked.
   */
  chapterId: string;
  /**
   * @property {string} [className] - Optional CSS classes to apply to the button.
   */
  className?: string;
}

/**
 * A button component that allows users to bookmark or un-bookmark a chapter.
 * It uses the `useBookmarks` hook to manage the bookmarked state.
 *
 * @param {BookmarkButtonProps} props - The component props.
 * @returns {JSX.Element} The rendered bookmark button.
 */
const BookmarkButton = ({ chapterId, className }: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(chapterId);

  /**
   * Handles the click event, toggling the bookmark state and stopping event propagation.
   * @param {React.MouseEvent} e - The mouse event.
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent onClick events, e.g., if inside a clickable card.
    toggleBookmark(chapterId);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex items-center justify-center p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        bookmarked ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-500 hover:text-yellow-400 dark:text-gray-400 dark:hover:text-yellow-300'
      } ${className}`}
      aria-label={bookmarked ? 'Bỏ đánh dấu chương' : 'Đánh dấu chương này'}
      title={bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
    >
      <Bookmark
        className="w-6 h-6"
        fill={bookmarked ? 'currentColor' : 'none'}
      />
      {/* Tooltip for desktop users */}
      <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
        {bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu chương'}
      </span>
    </button>
  );
};

export default BookmarkButton;
