import { v4 as uuidv4 } from 'uuid'; // For generating unique session IDs

// Define StoryView interface
export interface StoryView {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  timestamp: number;
  userId?: string; // Optional, can use sessionId
  sessionId: string;
}

// Define StoryStats interface
export interface StoryStats {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  totalViews: number;
  uniqueUsers: Set<string>; // Using Set to ensure unique user IDs
  lastViewed: number;
  score: number; // Score for ranking
}

// Define the ViewTrackingService class
class ViewTrackingService {
  private views: StoryView[] = [];
  private stats: Map<string, StoryStats> = new Map(); // Map storyId to StoryStats
  private readonly localStorageKey: string = 'manga_view_tracking_data';
  private readonly sessionKey: string = 'manga_session_id';

  constructor() {
    this.loadFromStorage();
    // Ensure a session ID exists
    if (!this.getSessionId()) {
      this.setSessionId(uuidv4());
    }
    // Set up periodic cleanup (e.g., every hour)
    if (typeof window !== 'undefined') {
        setInterval(() => this.cleanupOldViews(), 60 * 60 * 1000); // Every hour
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

  // Load data from localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const storedData = localStorage.getItem(this.localStorageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Revive Set for uniqueUsers
        this.views = parsedData.views || [];
        this.stats = new Map(
          parsedData.stats
            ? parsedData.stats.map((item: { storyId: string; stats: StoryStats }) => [
                item.storyId,
                { ...item.stats, uniqueUsers: new Set(item.stats.uniqueUsers) },
              ])
            : []
        );
      }
    } catch (error) {
      console.error('Error loading view tracking data from localStorage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // Convert Set to Array for stringification
      const dataToStore = {
        views: this.views,
        stats: Array.from(this.stats.values()).map((stat) => ({
          ...stat,
          uniqueUsers: Array.from(stat.uniqueUsers),
        })),
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving view tracking data to localStorage:', error);
    }
  }

  // Track when a user visits a story detail page
  trackStoryView(story: { id: string; slug: string; title: string }): void {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      console.warn('No session ID found, cannot track view.');
      return;
    }

    const now = Date.now();
    const newView: StoryView = {
      storyId: story.id,
      storySlug: story.slug,
      storyTitle: story.title,
      timestamp: now,
      sessionId: sessionId,
    };
    this.views.push(newView);

    // Update stats
    const currentStats = this.stats.get(story.id) || {
      storyId: story.id,
      storySlug: story.slug,
      storyTitle: story.title,
      totalViews: 0,
      uniqueUsers: new Set<string>(),
      lastViewed: 0,
      score: 0,
    };

    currentStats.totalViews++;
    currentStats.uniqueUsers.add(sessionId); // Assuming sessionId represents a unique user for tracking
    currentStats.lastViewed = now;
    currentStats.score = this.calculateScore(currentStats);

    this.stats.set(story.id, currentStats);
    this.saveToStorage();
  }

  // Calculate ranking score
  calculateScore(stats: StoryStats): number {
    // Formula: totalViews + (uniqueUsers * 2)
    return stats.totalViews + (stats.uniqueUsers.size * 2);
  }

  // Get ranking for a given period
  getRanking(
    period: 'day' | 'week' | 'month' | 'all',
    limit: number = 10
  ): StoryStats[] {
    const now = Date.now();
    let timeThreshold = 0;

    switch (period) {
      case 'day':
        timeThreshold = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        timeThreshold = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        timeThreshold = now - 30 * 24 * 60 * 60 * 1000; // Approximate month
        break;
      case 'all':
      default:
        timeThreshold = 0; // No time threshold
        break;
    }

    // Filter views based on the time threshold
    const relevantViews =
      period === 'all'
        ? this.views
        : this.views.filter((view) => view.timestamp >= timeThreshold);

    // Recalculate stats for the given period
    const periodStats = new Map<string, StoryStats>();
    relevantViews.forEach((view) => {
      const currentStats = periodStats.get(view.storyId) || {
        storyId: view.storyId,
        storySlug: view.storySlug,
        storyTitle: view.storyTitle,
        totalViews: 0,
        uniqueUsers: new Set<string>(),
        lastViewed: 0,
        score: 0,
      };

      currentStats.totalViews++;
      currentStats.uniqueUsers.add(view.sessionId);
      currentStats.lastViewed = Math.max(currentStats.lastViewed, view.timestamp);
      periodStats.set(view.storyId, currentStats);
    });

    // Calculate scores for the period and sort
    const rankedStories = Array.from(periodStats.values())
      .map((stats) => ({
        ...stats,
        score: this.calculateScore(stats),
      }))
      .sort((a, b) => b.score - a.score);

    return rankedStories.slice(0, limit);
  }

  // Clean up old views (e.g., views older than 3 months)
  private cleanupOldViews(): void {
    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days
    this.views = this.views.filter((view) => view.timestamp >= threeMonthsAgo);

    // Re-calculate stats based on cleaned views to ensure consistency
    this.recalculateAllStats();
    this.saveToStorage();
  }

  // Recalculate all stats from the current views array
  private recalculateAllStats(): void {
    this.stats.clear();
    this.views.forEach((view) => {
      const currentStats = this.stats.get(view.storyId) || {
        storyId: view.storyId,
        storySlug: view.storySlug,
        storyTitle: view.storyTitle,
        totalViews: 0,
        uniqueUsers: new Set<string>(),
        lastViewed: 0,
        score: 0,
      };

      currentStats.totalViews++;
      currentStats.uniqueUsers.add(view.sessionId);
      currentStats.lastViewed = Math.max(currentStats.lastViewed, view.timestamp);
      this.stats.set(view.storyId, currentStats);
    });

    // Update scores for all stats
    this.stats.forEach((stat) => {
      stat.score = this.calculateScore(stat);
    });
  }
}

// Export a singleton instance of ViewTrackingService
export const viewTrackingService = new ViewTrackingService();

