import { RANKING_API_URL } from './api-config';
import { otruyenApi, getImageUrl } from './api';

export interface RankedStory {
  story_slug: string;
  story_name: string;
  thumb_url: string;
  total_views: number;
}

/** Enriched ranked story with verified image URL */
export interface EnrichedRankedStory {
  slug: string;
  name: string;
  imageUrl: string;
  views: number;
}

/**
 * Ghi nhận 1 lượt xem cho truyện.
 * Fire-and-forget — không block UI.
 */
export function trackView(slug: string, name: string, thumbUrl?: string): void {
  if (typeof window === 'undefined') return;

  fetch(`${RANKING_API_URL}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, name, thumb_url: thumbUrl ?? '' }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Lấy danh sách truyện xếp hạng (raw from ranking worker).
 */
export async function getTopStories(
  period: 'day' | 'week' | 'month' | 'all' = 'month',
  limit = 10,
): Promise<RankedStory[]> {
  try {
    const res = await fetch(
      `${RANKING_API_URL}/top?period=${period}&limit=${limit}`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) return [];

    const data: RankedStory[] = await res.json();
    return data;
  } catch {
    return [];
  }
}

/**
 * Enrich ranked stories with fresh data from otruyenApi.
 * Ranking worker may store stale thumb_url/name — this re-fetches
 * the actual story detail to get correct thumbnails.
 * API calls are cached (30min) so this is cheap for repeated calls.
 */
export async function enrichRankedStories(
  ranked: RankedStory[],
): Promise<EnrichedRankedStory[]> {
  return Promise.all(
    ranked.map(async (r): Promise<EnrichedRankedStory> => {
      try {
        const story = await otruyenApi.getStoryBySlug(r.story_slug);
        if (story) {
          return {
            name: story.name || r.story_name,
            slug: story.slug || r.story_slug,
            imageUrl: getImageUrl(story.thumb_url || story.thumbnail || story.cover || ''),
            views: r.total_views,
          };
        }
      } catch {
        // Individual lookup failed — fall back to ranking data
      }
      return {
        name: r.story_name,
        slug: r.story_slug,
        imageUrl: getImageUrl(r.thumb_url),
        views: r.total_views,
      };
    })
  );
}
