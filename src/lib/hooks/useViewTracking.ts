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
  const trackView = useCallback((story: Story) => {
    viewTrackingService.trackStoryView(story);
  }, []);

  /**
   * Retrieves a list of hot stories based on a specified period and limit.
   *
   * @param period - The time period for ranking ('day', 'week', 'month', 'all').
   * @param limit - The maximum number of stories to return.
   * @returns An array of StoryStats representing the ranked hot stories.
   */
  const getHotStories = useCallback(
    (period: 'day' | 'week' | 'month' | 'all' = 'week', limit: number = 10): StoryStats[] => {
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
    // This is a direct access to the internal stats map, which is fine for display purposes.
    // For a more robust solution, especially with frequent updates, you might consider
    // a mechanism to subscribe to changes in viewTrackingService.
    // For now, it reflects the current state of the service.
    return Array.from(viewTrackingService['stats'].values()).find(s => s.storyId === storyId);
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
