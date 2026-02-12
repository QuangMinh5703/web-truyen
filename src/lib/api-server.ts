/**
 * Server-side API helpers for use in generateMetadata and Server Components.
 * These functions use native fetch without client-side caching.
 */
import { API_CONFIG } from './api-config';

const { BASE_URL, ENDPOINTS, CDN_URL } = API_CONFIG;

interface StoryMetadata {
    name?: string;
    slug?: string;
    description?: string;
    thumb_url?: string;
    cover?: string;
    thumbnail?: string;
    status?: string;
    author?: string[];
    category?: Array<{ name: string; slug?: string }>;
    chapters?: Array<{
        server_name?: string;
        server_data?: Array<{
            chapter_name?: string;
            chapter_title?: string;
            chapter_api_data?: string;
        }>;
    }>;
}

/**
 * Fetches story metadata on the server (for generateMetadata).
 * Uses Next.js fetch with revalidation for automatic ISR caching.
 */
export async function fetchStoryMetadata(slug: string): Promise<StoryMetadata | null> {
    try {
        const res = await fetch(`${BASE_URL}${ENDPOINTS.DETAIL}/${slug}`, {
            next: { revalidate: 3600 },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; M-Truyen/1.0)',
            },
        });

        if (!res.ok) return null;

        const json = await res.json();
        const story = json?.data?.item;
        return story ?? null;
    } catch {
        return null;
    }
}

/**
 * Constructs the full image URL from a thumbnail path.
 */
export function getServerImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return `${CDN_URL}${path}`;
    return `${CDN_URL}/uploads/comics/${path}`;
}

/**
 * Strips HTML tags and truncates text for meta descriptions.
 */
export function truncateDescription(html?: string, maxLength = 160): string {
    if (!html) return 'Đọc truyện online miễn phí tại M-Truyện';
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}
