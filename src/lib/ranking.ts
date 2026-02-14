import { RANKING_API_URL } from './api-config';

export interface RankedStory {
  story_slug: string;
  story_name: string;
  thumb_url: string;
  total_views: number;
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
  }).catch(() => {
    // Silent fail — ranking tracking is non-critical
  });
}

/**
 * Lấy danh sách truyện xếp hạng.
 */
export async function getTopStories(
  period: 'day' | 'week' | 'month' | 'all' = 'month',
  limit = 10,
): Promise<RankedStory[]> {
  try {
    const res = await fetch(
      `${RANKING_API_URL}/top?period=${period}&limit=${limit}`,
      { next: { revalidate: 300 } }, // cache 5 phút
    );

    if (!res.ok) return [];

    const data: RankedStory[] = await res.json();
    return data;
  } catch {
    return [];
  }
}
