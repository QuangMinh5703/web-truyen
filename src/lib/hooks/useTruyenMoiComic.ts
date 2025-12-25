import { useState, useEffect } from 'react';
import { otruyenApi, Story } from '../api'; // Adjust path if necessary

interface UseTruyenMoiComicResult {
  data: Story | null;
  loading: boolean;
  error: Error | null;
}

export const useTruyenMoiComic = (storySlug: string): UseTruyenMoiComicResult => {
  const [data, setData] = useState<Story | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!storySlug) {
      setData(null);
      setLoading(false);
      setError(new Error('No story slug provided.'));
      return;
    }

    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const storyData = await otruyenApi.getStoryBySlug(storySlug);
        if (storyData) {
          setData(storyData);
        } else {
          setError(new Error('Không tìm thấy truyện'));
          setData(null);
        }
      } catch (err: any) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storySlug]);

  return { data, loading, error };
};
