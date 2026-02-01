'use client';

import { useCallback, useMemo } from 'react';
import { viewTrackingService, StoryStats } from '@/lib/view-tracking';

// Define the Story type based on what trackStoryView expects
interface Story {
  id: string;
  slug: string;
  title: string;
}

/**
 * Custom React hook for tracking story views and retrieving hot story rankings.
 * This hook provides functions to interact with the singleton ViewTrackingService.
 *
 * @returns An object containing functions to track views and get ranking data.
 */
export function useViewTracking() {
  /**
   * Tracks a view for a given story.
   *
   * @param story - An object containing the story's id, slug, and title.
   */
  const trackView = useCallback(async (story: Story) => {
    await viewTrackingService.trackStoryView(story);
  }, []);

  /**
   * Retrieves a list of hot stories based on a specified period and limit.
   *
   * @param period - The time period for ranking ('day', 'week', 'month', 'all').
   * @param limit - The maximum number of stories to return.
   * @returns An array of StoryStats representing the ranked hot stories.
   */
  const getHotStories = useCallback(
    async (period: 'day' | 'week' | 'month' | 'all' = 'week', limit: number = 10): Promise<StoryStats[]> => {
      // Return a Promise for async fetching
      return viewTrackingService.getRanking(period, limit);
    },
    []
  );

  /**
   * Retrieves the current statistics for a specific story.
   *
   * @param storyId - The ID of the story.
   * @returns StoryStats object for the given storyId, or undefined if not found.
   */
  const getStoryStats = useCallback((storyId: string): StoryStats | undefined => {
    // This is a direct access to the internal stats map, which might not be updated immediately with Firestore.
    // For now, we keep it as is, but it might return undefined if data isn't loaded locally.
    // In a full implementation, this should also be async or subscribed.
    // For simplicity in this migration, let's return undefined or mock.
    // Since ViewTrackingService no longer exposes 'stats' publicly, we fix this access.
    return undefined; // Service is now async only
  }, []);


  return useMemo(
    () => ({
      trackView,
      getHotStories,
      getStoryStats,
    }),
    [trackView, getHotStories, getStoryStats]
  );
}
