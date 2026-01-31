/**
 * Analytics and Reading Behavior Tracking
 * Track user reading patterns, preferences, and engagement metrics
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { viewTrackingService } from './view-tracking'; // Import viewTrackingService

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

// Reading session data
export interface ReadingSession {
  sessionId: string;
  userId?: string;
  storyId: string;
  storyTitle: string;
  chapterId: string;
  chapterTitle: string;
  startTime: number;
  endTime?: number;
  totalTimeSpent: number; // in seconds
  pagesViewed: number;
  totalPages: number;
  completionRate: number; // percentage
  readingSpeed: number; // pages per minute
  deviceType: 'mobile' | 'tablet' | 'desktop';
  readerMode: 'single' | 'continuous';
  interruptions: number;
  averagePageTime: number; // seconds per page
}

// Popular content metrics
export interface ContentMetrics {
  storyId: string;
  storyTitle: string;
  totalViews: number;
  uniqueReaders: number;
  averageReadingTime: number;
  completionRate: number;
  averageRating: number;
  popularityScore: number; // calculated metric
  lastUpdated: number;
}

// User preferences
export interface UserPreferences {
  userId: string;
  preferredGenres: string[];
  averageReadingSpeed: number; // pages per minute
  preferredReaderMode: 'single' | 'continuous';
  preferredLanguage: string;
  readingTimes: {
    weekday: number[]; // hours of day
    weekend: number[];
  };
  devicePreferences: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

// Analytics service class
class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private storage = typeof window !== 'undefined' ? window.localStorage : null;
  private periodicExportIntervalId: NodeJS.Timeout | null = null;
  private ANALYTICS_EXPORT_BUNDLE_KEY = 'analytics_export_bundle';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    if (!this.storage) return;

    try {
      const stored = this.storage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
    }
  }

  private saveEvents(): void {
    if (!this.storage) return;

    try {
      this.storage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  // Track events
  public trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(fullEvent);
    this.saveEvents();

    // Also send to external analytics service if configured
    this.sendToExternalService(fullEvent);
  }

  // Reading session tracking
  public startReadingSession(data: Omit<ReadingSession, 'sessionId' | 'startTime'>): string {
    const sessionId = `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: ReadingSession = {
      ...data,
      sessionId,
      startTime: Date.now(),
      totalTimeSpent: 0,
      pagesViewed: 0,
      completionRate: 0,
      readingSpeed: 0,
      interruptions: 0,
      averagePageTime: 0,
    };

    this.trackEvent({
      event: 'reading_session_start',
      category: 'reading',
      action: 'start',
      label: data.storyTitle,
      metadata: session,
    });

    // Store active session
    this.setActiveSession(sessionId, session);
    return sessionId;
  }

  public updateReadingSession(sessionId: string, updates: Partial<ReadingSession>): void {
    const session = this.getActiveSession(sessionId);
    if (!session) return;

    const updatedSession = { ...session, ...updates };

    // Calculate derived metrics
    if (updatedSession.pagesViewed > 0) {
      updatedSession.averagePageTime = updatedSession.totalTimeSpent / updatedSession.pagesViewed;
    }

    if (updatedSession.totalPages > 0) {
      updatedSession.completionRate = (updatedSession.pagesViewed / updatedSession.totalPages) * 100;
    }

    if (updatedSession.totalTimeSpent > 0) {
      const minutes = updatedSession.totalTimeSpent / 60;
      updatedSession.readingSpeed = minutes > 0 ? updatedSession.pagesViewed / minutes : 0;
    }

    this.setActiveSession(sessionId, updatedSession);
  }

  public endReadingSession(sessionId: string): ReadingSession | null {
    const session = this.getActiveSession(sessionId);
    if (!session) return null;

    session.endTime = Date.now();
    session.totalTimeSpent = (session.endTime - session.startTime) / 1000; // convert to seconds

    this.updateReadingSession(sessionId, session);

    // Track completion event
    this.trackEvent({
      event: 'reading_session_end',
      category: 'reading',
      action: 'end',
      label: session.storyTitle,
      value: session.completionRate,
      metadata: session,
    });

    // Store completed session for analysis
    this.storeCompletedSession(session);

    // Clear active session
    this.clearActiveSession(sessionId);
    return session;
  }

  // Content metrics tracking
  public trackPageView(storyId: string, chapterId: string, pageNumber: number): void {
    this.trackEvent({
      event: 'page_view',
      category: 'reading',
      action: 'view',
      label: `page_${pageNumber}`,
      metadata: {
        storyId,
        chapterId,
        pageNumber,
        timestamp: Date.now(),
      },
    });
  }

  public trackStoryView(storyId: string, storyTitle: string, storySlug: string): void {
    this.trackEvent({
      event: 'story_view',
      category: 'content',
      action: 'view',
      label: storyTitle,
      metadata: {
        storyId,
        storyTitle,
      },
    });

    // Sync with ViewTrackingService
    viewTrackingService.trackStoryView({ id: storyId, slug: storySlug, title: storyTitle });
  }

  public getHotStoriesByAnalytics(limit: number = 10): ContentMetrics[] {
    const popularContent = this.getPopularContent();
    // Simple scoring: completionRate is weighted higher than totalViews
    return popularContent
      .map(story => ({
        ...story,
        popularityScore: (story.totalViews * 0.4) + (story.completionRate * 0.6),
      }))
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  public getStoryEngagement(storyId: string): ContentMetrics | undefined {
    const popularContent = this.getPopularContent();
    return popularContent.find(story => story.storyId === storyId);
  }

  public getTrendingStories(limit: number = 5, timePeriod: 'day' | 'week' = 'week'): ContentMetrics[] {
    if (!this.storage) return [];

    const now = Date.now();
    const timeThreshold = timePeriod === 'day' ? now - 24 * 60 * 60 * 1000 : now - 7 * 24 * 60 * 60 * 1000;

    const completed = this.storage.getItem('completed_reading_sessions');
    const sessions: ReadingSession[] = completed ? JSON.parse(completed) : [];

    const recentSessions = sessions.filter(session => session.startTime >= timeThreshold);

    const storyMetrics: Record<string, ContentMetrics> = {};

    recentSessions.forEach(session => {
      if (!storyMetrics[session.storyId]) {
        storyMetrics[session.storyId] = {
          storyId: session.storyId,
          storyTitle: session.storyTitle,
          totalViews: 0,
          uniqueReaders: 0,
          averageReadingTime: 0,
          completionRate: 0,
          averageRating: 0,
          popularityScore: 0,
          lastUpdated: Date.now(),
        };
      }

      const metric = storyMetrics[session.storyId];
      metric.totalViews += 1;
    });

    return Object.values(storyMetrics).sort((a, b) => b.totalViews - a.totalViews).slice(0, limit);
  }


  public trackChapterCompletion(storyId: string, chapterId: string, completionTime: number): void {
    this.trackEvent({
      event: 'chapter_completion',
      category: 'reading',
      action: 'complete',
      label: chapterId,
      value: completionTime,
      metadata: {
        storyId,
        chapterId,
        completionTime,
      },
    });
  }

  public trackSearch(query: string, resultsCount: number): void {
    this.trackEvent({
      event: 'search',
      category: 'navigation',
      action: 'search',
      label: query,
      value: resultsCount,
      metadata: {
        query,
        resultsCount,
      },
    });
  }

  public trackGenrePreference(genre: string, action: 'view' | 'prefer' | 'avoid'): void {
    this.trackEvent({
      event: 'genre_preference',
      category: 'preferences',
      action,
      label: genre,
      metadata: {
        genre,
        action,
      },
    });
  }

  // Session management
  private setActiveSession(sessionId: string, session: ReadingSession): void {
    if (!this.storage) return;
    this.storage.setItem(`active_session_${sessionId}`, JSON.stringify(session));
  }

  private getActiveSession(sessionId: string): ReadingSession | null {
    if (!this.storage) return null;

    try {
      const stored = this.storage.getItem(`active_session_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearActiveSession(sessionId: string): void {
    if (!this.storage) return;
    this.storage.removeItem(`active_session_${sessionId}`);
  }

  private storeCompletedSession(session: ReadingSession): void {
    if (!this.storage) return;

    try {
      const completed = this.storage.getItem('completed_reading_sessions');
      const sessions = completed ? JSON.parse(completed) : [];
      sessions.push(session);

      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100);
      }

      this.storage.setItem('completed_reading_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to store completed session:', error);
    }
  }

  // Analytics calculations
  public getReadingStats(userId?: string): {
    totalReadingTime: number;
    totalStoriesRead: number;
    totalChaptersCompleted: number;
    averageReadingSpeed: number;
    favoriteGenres: string[];
    readingStreak: number;
  } {
    if (!this.storage) {
      return {
        totalReadingTime: 0,
        totalStoriesRead: 0,
        totalChaptersCompleted: 0,
        averageReadingSpeed: 0,
        favoriteGenres: [],
        readingStreak: 0,
      };
    }

    try {
      const completed = this.storage.getItem('completed_reading_sessions');
      const sessions: ReadingSession[] = completed ? JSON.parse(completed) : [];

      const totalReadingTime = sessions.reduce((sum, s) => sum + s.totalTimeSpent, 0);
      const uniqueStories = new Set(sessions.map(s => s.storyId));
      const totalChaptersCompleted = sessions.filter(s => s.completionRate >= 90).length;
      const averageReadingSpeed = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.readingSpeed, 0) / sessions.length
        : 0;

      // Calculate favorite genres (simplified)
      const genreCounts: Record<string, number> = {};
      sessions.forEach(session => {
        // This would need to be enhanced with actual genre data
        genreCounts['Unknown'] = (genreCounts['Unknown'] || 0) + 1;
      });

      const favoriteGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([genre]) => genre);

      return {
        totalReadingTime,
        totalStoriesRead: uniqueStories.size,
        totalChaptersCompleted,
        averageReadingSpeed,
        favoriteGenres,
        readingStreak: 0, // Would need daily tracking
      };
    } catch {
      return {
        totalReadingTime: 0,
        totalStoriesRead: 0,
        totalChaptersCompleted: 0,
        averageReadingSpeed: 0,
        favoriteGenres: [],
        readingStreak: 0,
      };
    }
  }

  public getPopularContent(): ContentMetrics[] {
    if (!this.storage) return [];

    try {
      const completed = this.storage.getItem('completed_reading_sessions');
      const sessions: ReadingSession[] = completed ? JSON.parse(completed) : [];

      const storyMetrics: Record<string, ContentMetrics> = {};

      sessions.forEach(session => {
        if (!storyMetrics[session.storyId]) {
          storyMetrics[session.storyId] = {
            storyId: session.storyId,
            storyTitle: session.storyTitle,
            totalViews: 0,
            uniqueReaders: 0,
            averageReadingTime: 0,
            completionRate: 0,
            averageRating: 0,
            popularityScore: 0,
            lastUpdated: Date.now(),
          };
        }

        const metric = storyMetrics[session.storyId];
        metric.totalViews += 1;
        metric.averageReadingTime = (metric.averageReadingTime + session.totalTimeSpent) / 2;
        metric.completionRate = (metric.completionRate + session.completionRate) / 2;
      });

      return Object.values(storyMetrics)
        .sort((a, b) => b.popularityScore - a.popularityScore);
    } catch {
      return [];
    }
  }

  // External service integration
  private sendToExternalService(event: AnalyticsEvent): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }

    // Custom analytics endpoint
    // This would send to your analytics backend
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
  }

  /**
   * Gathers all analytics data and stores it in a single localStorage entry.
   */
  public consolidateAndStoreData(): void {
    if (!this.storage) return;

    const dataToExport = {
      events: this.events,
      completedSessions: JSON.parse(this.storage.getItem('completed_reading_sessions') || '[]'),
      exportDate: new Date().toISOString(),
    };

    this.storage.setItem(this.ANALYTICS_EXPORT_BUNDLE_KEY, JSON.stringify(dataToExport));
  }

  /**
   * Starts a periodic job to consolidate analytics data.
   * @param {number} intervalInHours - The interval in hours to run the consolidation.
   */
  public startPeriodicExport(intervalInHours: number): void {
    if (this.periodicExportIntervalId) {
      clearInterval(this.periodicExportIntervalId);
    }

    const intervalInMillis = intervalInHours * 60 * 60 * 1000;
    this.periodicExportIntervalId = setInterval(() => {
      this.consolidateAndStoreData();
    }, intervalInMillis);

    // Also run once on startup
    this.consolidateAndStoreData();
  }

  // Export data for analysis
  public exportData(): string {
    if (this.storage) {
      const bundledData = this.storage.getItem(this.ANALYTICS_EXPORT_BUNDLE_KEY);
      if (bundledData) {
        return bundledData;
      }
    }

    // Fallback to generate on the fly if bundle not found
    return JSON.stringify({
      events: this.events,
      completedSessions: JSON.parse(this.storage?.getItem('completed_reading_sessions') || '[]'),
      exportDate: new Date().toISOString(),
    });
  }

  // Clear all data (for privacy)
  public clearAllData(): void {
    this.events = [];
    this.saveEvents();

    if (this.storage) {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith('analytics_') || key.startsWith('active_session_') || key === 'completed_reading_sessions' || key === this.ANALYTICS_EXPORT_BUNDLE_KEY) {
          this.storage?.removeItem(key);
        }
      });
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hooks for analytics
export function useReadingAnalytics() {
  const router = useRouter();
  const sessionRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const pageViewTimesRef = useRef<number[]>([]);

  const startReading = useCallback((storyData: {
    storyId: string;
    storyTitle: string;
    chapterId: string;
    chapterTitle: string;
    totalPages: number;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    readerMode: 'single' | 'continuous';
  }) => {
    sessionRef.current = analytics.startReadingSession({
      ...storyData,
      userId: undefined, // Would get from auth context
      totalTimeSpent: 0,
      pagesViewed: 0,
      completionRate: 0,
      readingSpeed: 0,
      interruptions: 0,
      averagePageTime: 0,
    });
    startTimeRef.current = Date.now();
    pageViewTimesRef.current = [];
  }, []);

  const trackPageView = useCallback((pageNumber: number) => {
    if (!sessionRef.current) return;

    const now = Date.now();
    if (pageViewTimesRef.current.length > 0) {
      const timeOnPage = now - pageViewTimesRef.current[pageViewTimesRef.current.length - 1];
      // Could track time per page here
    }

    pageViewTimesRef.current.push(now);

    analytics.trackPageView(
      'current_story_id', // Would get from context
      'current_chapter_id', // Would get from context
      pageNumber
    );

    analytics.updateReadingSession(sessionRef.current, {
      pagesViewed: pageNumber + 1,
    });
  }, []);

  const endReading = useCallback(() => {
    if (!sessionRef.current) return;

    const endTime = Date.now();
    const totalTime = (endTime - startTimeRef.current) / 1000;

    analytics.updateReadingSession(sessionRef.current, {
      totalTimeSpent: totalTime,
    });

    const session = analytics.endReadingSession(sessionRef.current);
    sessionRef.current = null;

    return session;
  }, []);

  // Track navigation
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analytics.trackEvent({
        event: 'page_view',
        category: 'navigation',
        action: 'navigate',
        label: url,
      });

      // End reading session if navigating away from reader
      if (url.includes('/chuong/') && sessionRef.current) {
        endReading();
      }
    };

    // This would integrate with Next.js router events
    // router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      // router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, endReading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        endReading();
      }
    };
  }, [endReading]);

  return {
    startReading,
    trackPageView,
    endReading,
    getReadingStats: () => analytics.getReadingStats(),
    getPopularContent: () => analytics.getPopularContent(),
  };
}

export default analytics;