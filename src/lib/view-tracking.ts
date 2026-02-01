import { v4 as uuidv4 } from 'uuid'; // For generating unique session IDs
import { db, isFirebaseConfigured } from './firebase-config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Define StoryView interface
export interface StoryView {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  timestamp: number | object; // supports serverTimestamp
  sessionId: string;
}

// Define StoryStats interface
export interface StoryStats {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  totalViews: number;
  // uniqueUsers: Set<string>; // Complex to maintain in Firestore real-time cheaply, skipping for now
  lastViewed: number | object;
  score: number; // Score for ranking (views based)
}

// Define the ViewTrackingService class
class ViewTrackingService {
  private readonly viewsCollection = 'story_views';
  private readonly statsCollection = 'story_stats';
  private readonly sessionKey: string = 'manga_session_id';

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

  // Track when a user visits a story detail page (Async now)
  async trackStoryView(story: { id: string; slug: string; title: string }): Promise<void> {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      console.warn('No session ID found, cannot track view.');
      return;
    }

    if (!isFirebaseConfigured || !db) {
      // Silent fail or log if dev
      if (process.env.NODE_ENV === 'development') console.warn('Firebase not configured, skipping view track.');
      return;
    }

    try {
      // 1. Record the raw view
      const viewRef = doc(collection(db, this.viewsCollection)); // Auto-gen ID
      await setDoc(viewRef, {
        storyId: story.id,
        storySlug: story.slug,
        storyTitle: story.title,
        sessionId: sessionId,
        timestamp: serverTimestamp(),
      });

      // 2. Aggregate stats
      // Note: This is a simple counter. For unique views implementation, we would need 
      // a subcollection 'views' under stats doc or a transaction check, which is more reads/writes ($).
      // Sticking to simple view count for efficiency.
      const statsRef = doc(db, this.statsCollection, story.id);

      await setDoc(statsRef, {
        storyId: story.id,
        storySlug: story.slug,
        storyTitle: story.title,
        totalViews: increment(1),
        lastViewed: serverTimestamp(),
        score: increment(1) // Simple score = views count
      }, { merge: true });

    } catch (error) {
      console.error('Error tracking view to Firestore:', error);
    }
  }

  // Get ranking for a given period (Async now)
  // Note: 'period' filtering with Firestore requires composite indexes if sorting by views.
  // For simplicity and to modify minimal security rules, we stick to 'all' time (Global Popularity).
  async getRanking(
    period: 'day' | 'week' | 'month' | 'all',
    limit: number = 10
  ): Promise<StoryStats[]> {
    if (!isFirebaseConfigured || !db) {
      return [];
    }

    try {
      const statsRef = collection(db, this.statsCollection);
      // Ordering by score/totalViews descending
      const q = query(statsRef, orderBy('totalViews', 'desc'), firestoreLimit(limit));

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to number if needed, or keep for display
        // Ensuring compatibility with UI expecting number
        let lastViewed = 0;
        if (data.lastViewed instanceof Timestamp) {
          lastViewed = data.lastViewed.toMillis();
        } else if (typeof data.lastViewed === 'number') {
          lastViewed = data.lastViewed;
        }

        return {
          storyId: doc.id,
          storySlug: data.storySlug,
          storyTitle: data.storyTitle,
          totalViews: data.totalViews || 0,
          score: data.totalViews || 0,
          lastViewed: lastViewed
        } as StoryStats;
      });

    } catch (error) {
      console.error('Error fetching ranking from Firestore:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const viewTrackingService = new ViewTrackingService();

