import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCache, getCache, setCache, removeCache, clearCache } from './cache';

describe('cache layer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        clearCache();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('createCache', () => {
        it('should store and retrieve values', () => {
            const ttl = 1000;
            const cache = createCache<string>(ttl);

            cache.set('key1', 'value1');
            expect(cache.get('key1')).toBe('value1');
        });

        it('should return undefined for non-existent keys', () => {
            const cache = createCache<string>(1000);
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should expire entries after TTL', () => {
            const ttl = 1000;
            const cache = createCache<string>(ttl);

            cache.set('key1', 'value1');

            // Fast-forward time
            vi.advanceTimersByTime(ttl + 1);

            expect(cache.get('key1')).toBeUndefined();
        });

        it('should remove entries manually', () => {
            const cache = createCache<string>(1000);
            cache.set('key1', 'value1');
            cache.remove('key1');
            expect(cache.get('key1')).toBeUndefined();
        });

        it('should clear all entries', () => {
            const cache = createCache<string>(1000);
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.clear();
            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBeUndefined();
        });
    });

    describe('default storyCache exports', () => {
        it('should work using exported functions', () => {
            setCache('test-key', { data: 'test-data' });
            expect(getCache('test-key')).toEqual({ data: 'test-data' });

            removeCache('test-key');
            expect(getCache('test-key')).toBeUndefined();
        });

        it('should respect default TTL (30 mins)', () => {
            setCache('test-key', 'data');

            // 29 mins pass
            vi.advanceTimersByTime(29 * 60 * 1000);
            expect(getCache('test-key')).toBe('data');

            // 31 mins pass
            vi.advanceTimersByTime(2 * 60 * 1000);
            expect(getCache('test-key')).toBeUndefined();
        });
    });
});
