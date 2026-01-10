// src/lib/api-bookmarks.ts
/**
 * Mock API for Bookmarks
 * Simulates a real backend API for managing user bookmarks, folders, and shares using localStorage.
 */

import type { Bookmark } from './types';

const BOOKMARKS_DB_KEY = 'bookmarks_db_v2';
const DEFAULT_FOLDER = 'Uncategorized';

// --- New Data Structure ---
interface BookmarkStore {
  bookmarks: Record<string, Bookmark>;
  folders: string[];
  shares: Record<string, { folderName: string; bookmarks: Bookmark[] }>;
}

// --- Mock Database via localStorage ---

const migrateDb = (oldDb: Record<string, any>): BookmarkStore => {
  console.log("Migrating bookmarks database to new schema...");
  const bookmarks: Record<string, Bookmark> = {};
  const folderSet = new Set<string>([DEFAULT_FOLDER]);

  // Check if it's the intermediate schema (with folders but no shares)
  if (oldDb.bookmarks && oldDb.folders) {
    return {
      bookmarks: oldDb.bookmarks,
      folders: oldDb.folders,
      shares: {}, // Add the new shares property
    };
  }

  // Handle the oldest schema
  for (const key in oldDb) {
    if (typeof oldDb[key] === 'object' && oldDb[key] !== null && 'chapterId' in oldDb[key]) {
      const bookmark: Bookmark = oldDb[key];
      bookmarks[key] = bookmark;
      if (bookmark.folder) {
        folderSet.add(bookmark.folder);
      }
    }
  }

  return {
    bookmarks,
    folders: Array.from(folderSet),
    shares: {},
  };
};

const getDb = (): BookmarkStore => {
  try {
    if (typeof window === 'undefined') return { bookmarks: {}, folders: [], shares: {} };
    const dbString = localStorage.getItem(BOOKMARKS_DB_KEY);
    const db = dbString ? JSON.parse(dbString) : {};

    if (!db.shares) { // Check for the new `shares` property to detect old schemas
      const newStore = migrateDb(db);
      saveDb(newStore);
      return newStore;
    }

    return db;
  } catch (e) {
    console.error("Failed to read bookmarks DB from localStorage", e);
    return { bookmarks: {}, folders: [DEFAULT_FOLDER], shares: {} };
  }
};

const saveDb = (db: BookmarkStore) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BOOKMARKS_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save bookmarks DB to localStorage", e);
  }
};

// --- Bookmark CRUD Functions ---

export const getBookmarks = async (): Promise<Bookmark[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const db = getDb();
  return Object.values(db.bookmarks).sort((a, b) => b.createdAt - a.createdAt);
};

export const addBookmark = async (
  bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>
): Promise<Bookmark> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const db = getDb();

  const id = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newBookmark: Bookmark = {
    ...bookmarkData,
    id,
    createdAt: Date.now(),
    folder: bookmarkData.folder || DEFAULT_FOLDER,
  };

  db.bookmarks[id] = newBookmark;
  if (!db.folders.includes(newBookmark.folder)) {
      db.folders.push(newBookmark.folder);
  }
  saveDb(db);

  return newBookmark;
};

export const removeBookmark = async (bookmarkId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const db = getDb();

  if (db.bookmarks[bookmarkId]) {
    delete db.bookmarks[bookmarkId];
    saveDb(db);
  } else {
    console.warn(`Bookmark with id ${bookmarkId} not found.`);
  }
};

export const updateBookmark = async (
    bookmarkId: string,
    updates: Partial<Omit<Bookmark, 'id'|'createdAt'>>
): Promise<Bookmark> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDb();

    if (!db.bookmarks[bookmarkId]) {
        throw new Error(`Bookmark with id ${bookmarkId} not found.`);
    }

    const updatedBookmark = { ...db.bookmarks[bookmarkId], ...updates };
    db.bookmarks[bookmarkId] = updatedBookmark;
    saveDb(db);

    return updatedBookmark;
};

// --- Folder Management Functions ---

export const getFolders = async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const db = getDb();
    return db.folders.sort();
}

export const addFolder = async (folderName: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDb();
    if (!db.folders.includes(folderName)) {
        db.folders.push(folderName);
        saveDb(db);
    }
    return db.folders.sort();
}

export const renameFolder = async (oldName: string, newName: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDb();

    if (!db.folders.includes(oldName) || db.folders.includes(newName)) {
        throw new Error(`Invalid folder rename operation: from "${oldName}" to "${newName}"`);
    }

    db.folders = db.folders.map(f => f === oldName ? newName : f);

    for (const id in db.bookmarks) {
        if (db.bookmarks[id].folder === oldName) {
            db.bookmarks[id].folder = newName;
        }
    }
    
    saveDb(db);
}

export const deleteFolder = async (folderName: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDb();

    if (folderName === DEFAULT_FOLDER || !db.folders.includes(folderName)) {
        throw new Error(`Cannot delete folder: "${folderName}"`);
    }

    db.folders = db.folders.filter(f => f !== folderName);

    for (const id in db.bookmarks) {
        if (db.bookmarks[id].folder === folderName) {
            db.bookmarks[id].folder = DEFAULT_FOLDER;
        }
    }

    saveDb(db);
}

// --- Sharing Functions ---

/**
 * Creates a shareable link for a given folder.
 * @param {string} folderName - The name of the folder to share.
 * @returns {Promise<{token: string}>} A promise that resolves with a unique share token.
 */
export const createShare = async (folderName: string): Promise<{token: string}> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDb();
    const bookmarksToShare = Object.values(db.bookmarks).filter(bm => bm.folder === folderName);

    if (bookmarksToShare.length === 0) {
        throw new Error("Cannot share an empty folder.");
    }

    const token = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.shares[token] = {
        folderName,
        bookmarks: bookmarksToShare,
    };

    saveDb(db);
    return { token };
}

/**
 * Retrieves shared bookmark data using a token.
 * @param {string} token - The share token.
 * @returns {Promise<{folderName: string, bookmarks: Bookmark[]} | null>} The shared data or null if not found.
 */
export const getSharedData = async (token: string): Promise<{folderName: string, bookmarks: Bookmark[]} | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDb();
    return db.shares[token] || null;
}
