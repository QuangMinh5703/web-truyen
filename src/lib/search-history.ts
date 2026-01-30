// src/lib/search-history.ts

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export class SearchHistory {
  private static readonly KEY = 'mtruyen_search_history';
  private static readonly MAX_ITEMS = 20;

  /**
   * Add a search query to history.
   * If the query already exists, it is moved to the top.
   */
  static add(query: string): void {
    if (typeof window === 'undefined') return; // Guard for SSR
    try {
      const normalized = query.trim();
      if (!normalized) return;

      const history = this.get();
      
      // Remove if already exists to move it to the front
      const filtered = history.filter(item => 
        item.query.toLowerCase() !== normalized.toLowerCase()
      );

      // Add the new query to the front
      filtered.unshift({
        query: normalized,
        timestamp: Date.now(),
      });

      // Limit the number of items
      const limited = filtered.slice(0, this.MAX_ITEMS);

      // Save to localStorage
      localStorage.setItem(this.KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('[SearchHistory] Failed to save search history:', error);
    }
  }

  /**
   * Get all search history items, most recent first.
   */
  static get(): SearchHistoryItem[] {
    if (typeof window === 'undefined') return []; // Guard for SSR
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      // Basic validation to ensure we have an array of objects with query and timestamp
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && 'query' in item && 'timestamp' in item)) {
        return parsed;
      }
      return [];
    } catch (error) {
      console.error('[SearchHistory] Failed to load search history:', error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem(this.KEY);
      return [];
    }
  }

  /**
   * Remove a specific query from history.
   */
  static remove(query: string): void {
    if (typeof window === 'undefined') return; // Guard for SSR
    try {
      const history = this.get();
      const filtered = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      localStorage.setItem(this.KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[SearchHistory] Failed to remove item from history:', error);
    }
  }

  /**
   * Clear all search history.
   */
  static clear(): void {
    if (typeof window === 'undefined') return; // Guard for SSR
    try {
      localStorage.removeItem(this.KEY);
    } catch (error) {
      console.error('[SearchHistory] Failed to clear search history:', error);
    }
  }

  /**
   * Get recent search queries as an array of strings.
   */
  static getRecent(limit: number = 5): string[] {
    return this.get()
      .slice(0, limit)
      .map(item => item.query);
  }
}
