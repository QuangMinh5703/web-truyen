import { v4 as uuidv4 } from 'uuid';

// Define StoryView interface
export interface StoryView {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  timestamp: number;
  sessionId: string;
}

// Define StoryStats interface
export interface StoryStats {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  totalViews: number;
  lastViewed: number;
  score: number;
}

class ViewTrackingService {
  private readonly sessionKey: string = 'manga_session_id';
  private readonly apiUrl = '/api/ranking';

  constructor() {
    // Ensure a session ID exists
    if (!this.getSessionId()) {
      this.setSessionId(uuidv4());
    }
  }

  // Get session ID from localStorage
  private getSessionId(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(this.sessionKey) : null;
  }

  // Set session ID in localStorage
  private setSessionId(id: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.sessionKey, id);
    }
  }

  // Track when a user visits a story detail page
  async trackStoryView(story: { id: string; slug: string; title: string }): Promise<void> {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      console.warn('No session ID found, cannot track view.');
      return;
    }

    try {
      await fetch(`${this.apiUrl}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          storySlug: story.slug,
          storyTitle: story.title,
          sessionId: sessionId
        }),
      });
    } catch (error) {
      console.error('Error tracking view via API:', error);
    }
  }

  // Get ranking for a given period
  async getRanking(
    period: 'day' | 'week' | 'month' | 'all',
    limit: number = 10
  ): Promise<StoryStats[]> {
    try {
      const res = await fetch(`${this.apiUrl}/top?period=${period}&limit=${limit}`, {
        method: 'GET',
        cache: 'no-store' // Always fetch fresh data
      });

      if (!res.ok) {
        throw new Error('Failed to fetch ranking');
      }

      const data: StoryStats[] = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching ranking via API:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const viewTrackingService = new ViewTrackingService();
