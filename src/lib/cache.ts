/**
 * A simple in-memory cache with a Time-to-Live (TTL) for entries.
 *
 * @template T - The type of data to be stored in the cache.
 */
interface Cache<T> {
  /**
   * Retrieves a value from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {T | undefined} The cached value, or undefined if it doesn't exist or has expired.
   */
  get: (key: string) => T | undefined;

  /**
   * Stores a value in the cache.
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store.
   */
  set: (key: string, value: T) => void;

  /**
   * Deletes a value from the cache.
   * @param {string} key - The key of the item to delete.
   */
  remove: (key: string) => void;

  /**
   * Clears the entire cache.
   */
  clear: () => void;
}

/**
 * @template T
 * @typedef {object} CacheEntry
 * @property {T} value - The cached data.
 * @property {number} expiry - The timestamp when the entry expires.
 */
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

/**
 * Creates a new in-memory cache instance.
 *
 * @template T - The type of data the cache will hold.
 * @param {number} ttl - The default Time-to-Live for cache entries in milliseconds.
 * @returns {Cache<T>} A new cache instance.
 */
export const createCache = <T>(ttl: number): Cache<T> => {
  const cache = new Map<string, CacheEntry<T>>();

  return {
    get: (key: string): T | undefined => {
      const entry = cache.get(key);
      if (!entry) {
        return undefined;
      }
      if (Date.now() > entry.expiry) {
        cache.delete(key);
        return undefined;
      }
      return entry.value;
    },

    set: (key: string, value: T): void => {
      const expiry = Date.now() + ttl;
      cache.set(key, { value, expiry });
    },

    remove: (key: string): void => {
      cache.delete(key);
    },

    clear: (): void => {
      cache.clear();
    },
  };
};

const STORY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const storyCache = createCache<any>(STORY_CACHE_TTL);

export const getCache = storyCache.get;
export const setCache = storyCache.set;
export const removeCache = storyCache.remove;
export const clearCache = storyCache.clear;