// src/lib/hooks/useBookmarks.ts
import { useState, useEffect, useCallback } from 'react';
import { Bookmark, ApiError } from '@/lib/types';
import * as api from '@/lib/api-bookmarks';

const DEFAULT_FOLDER = 'Uncategorized';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [remoteBookmarks, remoteFolders] = await Promise.all([
            api.getBookmarks(),
            api.getFolders(),
        ]);
        setBookmarks(remoteBookmarks);
        setFolders(remoteFolders);
      } catch (err) {
        setError({ message: 'Failed to fetch initial bookmark data' });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const getBookmarkByChapterId = useCallback(
    (chapterId: string): Bookmark | undefined => {
      return bookmarks.find((bm) => bm.chapterId === chapterId);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (chapterData: { chapterId: string; storySlug: string; }, folder?: string) => {
      const { chapterId, storySlug } = chapterData;
      const existingBookmark = getBookmarkByChapterId(chapterId);

      if (existingBookmark) {
        const originalBookmarks = bookmarks;
        setBookmarks((prev) => prev.filter((bm) => bm.id !== existingBookmark.id));
        try {
          await api.removeBookmark(existingBookmark.id);
        } catch (err) {
          setBookmarks(originalBookmarks);
          setError({ message: 'Failed to remove bookmark' });
        }
      } else {
        const optimisticBookmark: Bookmark = {
          id: `temp-${Date.now()}`,
          chapterId,
          storySlug,
          folder: folder || DEFAULT_FOLDER,
          createdAt: Date.now(),
        };
        setBookmarks((prev) => [optimisticBookmark, ...prev]);
        try {
          const newBookmark = await api.addBookmark({ chapterId, storySlug, folder });
          setBookmarks((prev) => prev.map(bm => bm.id === optimisticBookmark.id ? newBookmark : bm));
        } catch (err) {
          setBookmarks((prev) => prev.filter(bm => bm.id !== optimisticBookmark.id));
          setError({ message: 'Failed to add bookmark' });
        }
      }
    },
    [bookmarks, getBookmarkByChapterId]
  );

  const moveBookmarkToFolder = useCallback(
    async (bookmarkId: string, folder: string) => {
      const originalBookmarks = bookmarks;
      const bookmark = originalBookmarks.find(bm => bm.id === bookmarkId);
      if (!bookmark) return;

      setBookmarks(prev => prev.map(bm => bm.id === bookmarkId ? { ...bm, folder } : bm));

      try {
        await api.updateBookmark(bookmarkId, { folder });
      } catch (err) {
        setBookmarks(originalBookmarks);
        setError({ message: 'Failed to move bookmark' });
      }
    },
    [bookmarks]
  );
  
  // --- Folder Management ---

  const addFolder = useCallback(async (folderName: string) => {
    if (folders.includes(folderName)) {
      setError({ message: `Folder "${folderName}" already exists.`});
      return;
    }
    const originalFolders = folders;
    setFolders(prev => [...prev, folderName].sort());
    try {
      const updatedFolders = await api.addFolder(folderName);
      setFolders(updatedFolders); // Sync with authoritative source
    } catch (err) {
      setFolders(originalFolders);
      setError({ message: 'Failed to add folder' });
    }
  }, [folders]);

  const renameFolder = useCallback(async (oldName: string, newName: string) => {
    if (folders.includes(newName)) {
      setError({ message: `Folder "${newName}" already exists.` });
      return;
    }
    const originalFolders = folders;
    const originalBookmarks = bookmarks;
    
    setFolders(prev => prev.map(f => f === oldName ? newName : f).sort());
    setBookmarks(prev => prev.map(bm => bm.folder === oldName ? { ...bm, folder: newName } : bm));
    
    try {
      await api.renameFolder(oldName, newName);
    } catch (err) {
      setFolders(originalFolders);
      setBookmarks(originalBookmarks);
      setError({ message: 'Failed to rename folder' });
    }
  }, [folders, bookmarks]);

  const deleteFolder = useCallback(async (folderName: string) => {
    if (folderName === DEFAULT_FOLDER) {
      setError({ message: 'Cannot delete the default folder.' });
      return;
    }
    const originalFolders = folders;
    const originalBookmarks = bookmarks;

    setFolders(prev => prev.filter(f => f !== folderName));
    setBookmarks(prev => prev.map(bm => bm.folder === folderName ? { ...bm, folder: DEFAULT_FOLDER } : bm));

    try {
      await api.deleteFolder(folderName);
    } catch (err) {
      setFolders(originalFolders);
      setBookmarks(originalBookmarks);
      setError({ message: 'Failed to delete folder' });
    }
  }, [folders, bookmarks]);

  // --- Sharing ---
  const shareFolder = useCallback(async (folderName: string): Promise<string | null> => {
    try {
      setError(null);
      const { token } = await api.createShare(folderName);
      if (typeof window !== 'undefined') {
        return `${window.location.origin}/bookmarks/share/${token}`;
      }
      return null;
    } catch (err: any) {
      setError({ message: err.message || 'Failed to share folder.' });
      return null;
    }
  }, []);


  return {
    bookmarks,
    folders,
    loading,
    error,
    getBookmarkByChapterId,
    toggleBookmark,
    moveBookmarkToFolder,
    addFolder,
    renameFolder,
    deleteFolder,
    shareFolder,
  };
};

