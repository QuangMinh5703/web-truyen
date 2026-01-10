import { renderHook, waitFor, act } from '@testing-library/react';
import { expect, vi, it, describe, beforeEach, afterEach } from 'vitest';
import { useBookmarks } from './useBookmarks';
import * as apiBookmarks from '@/lib/api-bookmarks';
import { Bookmark } from '@/lib/types';

// Mock the api-bookmarks module
vi.mock('@/lib/api-bookmarks', () => ({
  getBookmarks: vi.fn(),
  addBookmark: vi.fn(),
  removeBookmark: vi.fn(),
}));

const MOCK_BOOKMARK_1: Bookmark = {
  id: 'bookmark-1',
  chapterId: 'chap-1',
  storySlug: 'test-story',
  createdAt: Date.now(),
};

const MOCK_BOOKMARK_2: Bookmark = {
  id: 'bookmark-2',
  chapterId: 'chap-2',
  storySlug: 'test-story',
  createdAt: Date.now() - 1000,
  folder: 'My Favorites',
};

const mockedGetBookmarks = apiBookmarks.getBookmarks as vi.Mock;
const mockedAddBookmark = apiBookmarks.addBookmark as vi.Mock;
const mockedRemoveBookmark = apiBookmarks.removeBookmark as vi.Mock;

describe('useBookmarks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch bookmarks on initial load', async () => {
    mockedGetBookmarks.mockResolvedValue([MOCK_BOOKMARK_1]);

    const { result } = renderHook(() => useBookmarks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bookmarks).toEqual([MOCK_BOOKMARK_1]);
    expect(mockedGetBookmarks).toHaveBeenCalledTimes(1);
  });

  it('should allow adding a new bookmark', async () => {
    mockedGetBookmarks.mockResolvedValue([]);
    mockedAddBookmark.mockResolvedValue(MOCK_BOOKMARK_1);

    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleBookmark({ chapterId: 'chap-1', storySlug: 'test-story' });
    });

    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].chapterId).toBe('chap-1');
    expect(mockedAddBookmark).toHaveBeenCalledWith({ chapterId: 'chap-1', storySlug: 'test-story' });
  });

  it('should allow removing an existing bookmark', async () => {
    mockedGetBookmarks.mockResolvedValue([MOCK_BOOKMARK_1]);

    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bookmarks).toHaveLength(1);

    await act(async () => {
      await result.current.toggleBookmark({ chapterId: 'chap-1', storySlug: 'test-story' });
    });

    expect(result.current.bookmarks).toHaveLength(0);
    expect(mockedRemoveBookmark).toHaveBeenCalledWith('bookmark-1');
  });

  it('should correctly identify if a chapter is bookmarked', async () => {
    mockedGetBookmarks.mockResolvedValue([MOCK_BOOKMARK_1]);

    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const found = result.current.getBookmarkByChapterId('chap-1');
    const notFound = result.current.getBookmarkByChapterId('chap-nonexistent');

    expect(found).toBeDefined();
    expect(found?.id).toBe('bookmark-1');
    expect(notFound).toBeUndefined();
  });
  
  it('should return a list of unique folders', async () => {
    mockedGetBookmarks.mockResolvedValue([MOCK_BOOKMARK_1, MOCK_BOOKMARK_2]);
    
    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    const folders = result.current.getFolders();
    expect(folders).toEqual(['All', 'My Favorites']);
  });
});
