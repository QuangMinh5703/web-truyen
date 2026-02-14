/**
 * Genre data — fetched dynamically from otruyenapi.com with static fallback.
 * Navbar and other components should use `fetchGenres()` for live data.
 */
import { otruyenApi, Genre } from './api';

export interface GenreItem {
    _id?: string;
    name: string;
    slug: string;
}

/** Static fallback when API is unreachable */
export const GENRES_FALLBACK: GenreItem[] = [
    { name: "Action", slug: "action" },
    { name: "Adventure", slug: "adventure" },
    { name: "Chuyển Sinh", slug: "chuyen-sinh" },
    { name: "Comedy", slug: "comedy" },
    { name: "Drama", slug: "drama" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Harem", slug: "harem" },
    { name: "Historical", slug: "historical" },
    { name: "Horror", slug: "horror" },
    { name: "Martial Arts", slug: "martial-arts" },
    { name: "Mature", slug: "mature" },
    { name: "Ngôn Tình", slug: "ngon-tinh" },
    { name: "Psychological", slug: "psychological" },
    { name: "Romance", slug: "romance" },
    { name: "Sci-fi", slug: "sci-fi" },
    { name: "School Life", slug: "school-life" },
    { name: "Slice of Life", slug: "slice-of-life" },
    { name: "Supernatural", slug: "supernatural" },
];

/** Module-level cache for fetched genres */
let cachedGenres: GenreItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (API genres rarely change)

/**
 * Fetch genres from API with in-memory caching + static fallback.
 * Safe to call frequently — returns cached result within TTL.
 */
export async function fetchGenres(): Promise<GenreItem[]> {
    const now = Date.now();
    if (cachedGenres && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedGenres;
    }

    try {
        const genres: Genre[] | undefined = await otruyenApi.getGenres();
        if (genres && genres.length > 0) {
            cachedGenres = genres.map((g) => ({
                _id: g._id,
                name: g.name,
                slug: g.slug || '',
            }));
            cacheTimestamp = now;
            return cachedGenres;
        }
    } catch {
        // Fall through to fallback
    }

    return GENRES_FALLBACK;
}

/** @deprecated Use `fetchGenres()` for dynamic data. Kept for backward compat. */
export const GENRES = GENRES_FALLBACK;
