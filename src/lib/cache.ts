interface CacheItem<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const setCache = <T>(key: string, data: T) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const getCache = <T>(key: string): T | null => {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
        return item.data;
    }
    return null;
};
