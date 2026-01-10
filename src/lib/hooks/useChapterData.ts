import { useState, useEffect, useMemo, useCallback } from 'react';
import { otruyenApi, Story, Chapter, ApiChapter, UiChapter } from '@/lib/api';
import { createCache } from '@/lib/cache';

const storyCache = createCache<Story>(30 * 60 * 1000); // 30 minutes TTL

const getChapterId = (url: string): string => url.substring(url.lastIndexOf('/') + 1);

async function fetchWithRetry<T>(
  fn: () => Promise<T | undefined>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result !== undefined) {
        return result;
      }
      throw new Error('API returned undefined result');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

const findChapterApiUrl = (story: Story, chapterId: string): string | undefined => {
  return story.chapters
    ?.flatMap(s => s.server_data)
    .find(c => c?.chapter_api_data && getChapterId(c.chapter_api_data) === chapterId)
    ?.chapter_api_data;
};

export const useChapterData = (slug: string, chapterId: string) => {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [story, setStory] = useState<Story | null>(storyCache.get(slug) || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const allChapters: UiChapter[] = useMemo(() => {
        if (!story?.chapters) return [];
        const allApiChapters = story.chapters.flatMap(server => server.server_data || []).filter(Boolean);
        const uniqueChapters = Array.from(new Map(allApiChapters.map(c => [getChapterId(c.chapter_api_data), c])).values());
        return uniqueChapters.map((apiChapter: ApiChapter) => ({
            id: getChapterId(apiChapter.chapter_api_data!),
            name: apiChapter.chapter_name || 'N/A',
            title: apiChapter.chapter_title || '',
        }));
    }, [story]);

    const prefetchChapter = useCallback(async (chapterIdToPrefetch: string) => {
        if (!story) return;
        const chapterApiUrl = findChapterApiUrl(story, chapterIdToPrefetch);
        if (chapterApiUrl) {
            try {
                // We don't need the result, just the fetch to warm the cache
                await otruyenApi.getChapterByUrl(chapterApiUrl);
                 console.log(`[useChapterData] Prefetched chapter ${chapterIdToPrefetch}`);
            } catch (err) {
                // Prefetch failing is not critical, so we don't set an error state
                console.warn(`[useChapterData] Prefetch failed for chapter ${chapterIdToPrefetch}:`, err);
            }
        }
    }, [story]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchAllData = async () => {
          if (!slug || !chapterId) {
            setLoading(false);
            return;
          }

          setLoading(true);
          setError(null);

          try {
            let storyData = storyCache.get(slug);
            if (!storyData) {
                storyData = await fetchWithRetry(() => otruyenApi.getStoryBySlug(slug, { signal }));
                if (storyData) {
                    storyCache.set(slug, storyData);
                }
            }
            if (signal.aborted) return;
            setStory(storyData);

            const chapterApiUrl = findChapterApiUrl(storyData!, chapterId);
            if (!chapterApiUrl) {
              throw new Error(`Chapter ID "${chapterId}" not found in story "${slug}".`);
            }

            const chapterData = await fetchWithRetry(() => otruyenApi.getChapterByUrl(chapterApiUrl, { signal }));
            if (signal.aborted) return;
            setChapter(chapterData);

          } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError') {
                    console.error('[useChapterData] Error fetching data:', err);
                    setError(err.message);
                }
            } else {
                console.error('[useChapterData] Unknown error:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu chương.');
            }
          } finally {
            if (!signal.aborted) {
              setLoading(false);
            }
          }
        };

        fetchAllData();

        return () => {
            controller.abort();
        };
      }, [slug, chapterId]);


      useEffect(() => {
        const handleScroll = () => {
            const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercentage > 80) {
                const currentIndex = allChapters.findIndex(c => c.id === chapterId);
                if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
                    const nextChapterId = allChapters[currentIndex + 1].id;
                    prefetchChapter(nextChapterId);
                }
                // Remove the listener after prefetching to avoid multiple calls
                window.removeEventListener('scroll', handleScroll);
            }
        };

        if (allChapters.length > 0) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [chapterId, allChapters, prefetchChapter]);


    return { chapter, allChapters, story, loading, error };
}