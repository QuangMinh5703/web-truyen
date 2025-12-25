import { useState, useEffect, useMemo } from 'react';
import { otruyenApi, Story, Chapter, ApiChapter, UiChapter } from '@/lib/api';

/**
 * Extracts the chapter ID from a full chapter API URL.
 * @param {string} url - The full API URL for a chapter.
 * @returns {string} The extracted chapter ID.
 */
const getChapterId = (url: string): string => url.substring(url.lastIndexOf('/') + 1);

/**
 * A higher-order function that attempts to execute an async function multiple times upon failure.
 * Uses exponential backoff for delays between retries.
 *
 * @template T
 * @param {() => Promise<T | undefined>} fn - The async function to execute.
 * @param {number} [retries=3] - The number of retry attempts.
 * @param {number} [delay=1000] - The initial delay in milliseconds.
 * @returns {Promise<T>} The result of the function if successful.
 * @throws Will throw an error if all retry attempts fail.
 */
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
      // Throw a specific error if the API returns undefined, which we treat as a failure
      throw new Error('API returned undefined result');
    } catch (err: unknown) {
      // Don't retry on abort
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err; // Rethrow the error on the final attempt
      }
    }
  }
  // This should theoretically be unreachable, but it satisfies TypeScript's need for a return path.
  throw new Error('Max retries exceeded');
}

/**
 * @typedef {object} UseChapterDataReturn
 * @property {Chapter | null} chapter - The detailed data for the current chapter, including images.
 * @property {UiChapter[]} allChapters - A memoized, UI-friendly list of all chapters in the story.
 * @property {Story | null} story - The data for the parent story.
 * @property {boolean} loading - True if any data is currently being fetched.
 * @property {string | null} error - An error message if any fetch fails.
 */

/**
 * A hook to fetch all necessary data for rendering a chapter reading page.
 * It orchestrates fetching the parent story's details to find the chapter's
 * specific API endpoint, and then fetches the chapter's content.
 *
 * @param {string} slug - The slug of the story.
 * @param {string} chapterId - The ID of the specific chapter to load.
 * @returns {UseChapterDataReturn} The state object containing chapter data, story data, loading, and error states.
 */
export const useChapterData = (slug: string, chapterId: string): UseChapterDataReturn => {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * @effect Fetches story and chapter data when slug or chapterId changes.
     * The fetching process is a two-step sequence:
     * 1. Fetch the story details to get the list of all chapters.
     * 2. Find the correct chapter's API URL from the list.
     * 3. Fetch the chapter's content (list of images) using that URL.
     */
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
            // Step 1: Fetch story data with retry logic
            const storyData = await fetchWithRetry(() => otruyenApi.getStoryBySlug(slug, { signal }));
            if (signal.aborted) return;
            setStory(storyData);

            // Step 2: Find the chapter's full API URL from the fetched story data
            const chapterApiUrl = storyData?.chapters
              ?.flatMap(s => s.server_data)
              .find(c => c?.chapter_api_data && getChapterId(c.chapter_api_data) === chapterId)
              ?.chapter_api_data;

            if (!chapterApiUrl) {
              throw new Error(`Chapter ID "${chapterId}" not found in story "${slug}".`);
            }

            // Step 3: Fetch the specific chapter content with retry logic
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

    /**
     * @memo A memoized list of all chapters in a UI-friendly format.
     * This is derived from the main story data and only recalculates when the story data changes.
     */
    const allChapters: UiChapter[] = useMemo(() => {
        if (!story?.chapters) return [];

        const allApiChapters = story.chapters
            .flatMap(server => server.server_data || [])
            .filter((apiChapter): apiChapter is ApiChapter => !!apiChapter?.chapter_api_data);

        // Deduplicate chapters based on their ID, as different servers can provide the same chapter.
        const uniqueChapters = Array.from(
            new Map(allApiChapters.map(c => [getChapterId(c.chapter_api_data), c])).values()
        );

        return uniqueChapters.map((apiChapter: ApiChapter) => ({
            id: getChapterId(apiChapter.chapter_api_data!),
            name: apiChapter.chapter_name || 'N/A',
            title: apiChapter.chapter_title || '',
        }));
    }, [story]);

    return { chapter, allChapters, story, loading, error };
}
