// src/lib/hooks/useBookmarks.ts
import { useState, useEffect, useCallback } from 'react';

const BOOKMARKS_STORAGE_KEY = 'comic-reader-bookmarks';

/**
 * Safely retrieves the list of bookmarked chapter IDs from localStorage.
 * @returns {string[]} An array of bookmarked chapter IDs.
 */
const getBookmarkedChapters = (): string[] => {
  try {
    const savedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (savedBookmarks) {
      const parsed = JSON.parse(savedBookmarks);
      // Basic validation to ensure it's an array of strings
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to parse bookmarks from localStorage:', error);
  }
  return [];
};

/**
 * @typedef {object} UseBookmarksReturn
 * @property {string[]} bookmarkedChapters - An array of all bookmarked chapter IDs.
 * @property {(chapterId: string) => boolean} isBookmarked - A function to check if a specific chapter is bookmarked.
 * @property {(chapterId: string) => void} toggleBookmark - A function to add or remove a chapter from bookmarks.
 */

/**
 * A custom hook to manage chapter bookmarks using localStorage.
 * It provides functions to check and toggle bookmarks, and persists the state across sessions.
 *
 * @returns {UseBookmarksReturn} An object containing the bookmark state and management functions.
 */
export const useBookmarks = () => {
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);

  // Load bookmarks from localStorage on initial client-side render.
  useEffect(() => {
    setBookmarkedChapters(getBookmarkedChapters());
  }, []);

  /**
   * Saves the provided list of bookmarks to both state and localStorage.
   * @param {string[]} bookmarks - The array of chapter IDs to save.
   */
  const saveBookmarks = (bookmarks: string[]) => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      setBookmarkedChapters(bookmarks);
    } catch (error) {
      console.error('Failed to save bookmarks to localStorage:', error);
      // Optionally: show a toast notification to the user
    }
  };

  /**
   * Checks if a given chapter ID is already bookmarked.
   * @param {string} chapterId - The ID of the chapter to check.
   * @returns {boolean} True if the chapter is bookmarked, false otherwise.
   */
  const isBookmarked = useCallback(
    (chapterId: string): boolean => {
      return bookmarkedChapters.includes(chapterId);
    },
    [bookmarkedChapters]
  );

  /**
   * Toggles the bookmark status for a given chapter ID.
   * If the chapter is already bookmarked, it will be removed. Otherwise, it will be added.
   * @param {string} chapterId - The ID of the chapter to toggle.
   */
  const toggleBookmark = useCallback(
    (chapterId: string) => {
      const updatedBookmarks = isBookmarked(chapterId)
        ? bookmarkedChapters.filter((id) => id !== chapterId)
        : [...bookmarkedChapters, chapterId];
      
      saveBookmarks(updatedBookmarks);
    },
    [bookmarkedChapters, isBookmarked] // isBookmarked is a dependency of this callback
  );

  return { bookmarkedChapters, isBookmarked, toggleBookmark };
};
