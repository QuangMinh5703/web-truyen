/**
 * Mock API for Reading Progress Synchronization
 * This is a temporary solution until a real backend is implemented.
 * It uses localStorage to simulate a remote database.
 */

import { ReadingProgress } from './types'; // Assuming types are defined here

// --- Mock Database via localStorage ---

const PROGRESS_DB_KEY = 'progress_db';

const getDb = (): Record<string, ReadingProgress> => {
  try {
    const db = localStorage.getItem(PROGRESS_DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch (e) {
    return {};
  }
};

const saveDb = (db: Record<string, ReadingProgress>) => {
  try {
    localStorage.setItem(PROGRESS_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save progress DB to localStorage", e);
  }
};

// --- Mock API Functions ---

/**
 * Saves the reading progress for a specific chapter.
 * @param chapterId The ID of the chapter.
 * @param progress The reading progress data.
 * @returns A promise that resolves when the save is complete.
 */
export const saveReadingProgress = async (
  chapterId: string,
  progress: ReadingProgress
): Promise<void> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const db = getDb();
  db[chapterId] = { ...progress, lastSynced: new Date().toISOString() };
  saveDb(db);

  // In a real scenario, you might have error handling
  // For now, we assume it always succeeds.
};

/**
 * Retrieves the reading progress for a specific chapter.
 * @param chapterId The ID of the chapter.
 * @returns A promise that resolves with the reading progress or null if not found.
 */
export const getReadingProgress = async (
  chapterId: string
): Promise<ReadingProgress | null> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const db = getDb();
  const progress = db[chapterId];
  
  return progress ? progress : null;
};

/**
 * Retrieves all reading progress data for the user.
 * @returns A promise that resolves with all progress data.
 */
export const getAllReadingProgress = async (): Promise<Record<string, ReadingProgress>> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    return getDb();
};

// --- Add a type definition to `./types.ts` ---
/*
export interface ReadingProgress {
  chapterId: string;
  currentPage: number;
  totalPages: number;
  progress: number; // Percentage
  lastRead: number; // Timestamp
  lastSynced?: string; // ISO 8601 Date string
}
*/
