'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Eye } from 'lucide-react';
import { otruyenApi, Story, Genre as ApiGenre } from '@/lib/api';
import { getImageUrl } from '@/lib/api';

/**
 * @interface StoryGridProps
 * @description Props for the StoryGrid component.
 */
interface StoryGridProps {
  /**
   * @property {number} [limit=24] - The maximum number of stories to fetch and display.
   */
  limit?: number;
  /**
   * @property {'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh'} [type='truyen-moi']
   * - The type of stories to fetch (e.g., new, upcoming, ongoing, completed).
   */
  type?: 'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh';
}

/**
 * StoryGrid is a client component that fetches and displays a grid of stories.
 * It handles its own loading, error, and empty states.
 * @note This component fetches its own data. For better state management, consider
 * fetching data in a parent server component and passing it down as props.
 *
 * @param {StoryGridProps} props - The component props.
 * @returns {JSX.Element} A grid of story cards.
 */
export default function StoryGrid({ limit = 24, type = 'truyen-moi' }: StoryGridProps) {
  /**
   * @state {Story[]} stories - The list of stories fetched from the API.
   */
  const [stories, setStories] = useState<Story[]>([]);
  /**
   * @state {boolean} loading - True while stories are being fetched.
   */
  const [loading, setLoading] = useState(true);
  /**
   * @state {string | null} error - Stores any error message during data fetching.
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * @effect Fetches stories from the API when the component mounts or props change.
   */
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await otruyenApi.getStoriesByType(type, { page: 1, limit });
        setStories(response?.items || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Không thể tải danh sách truyện. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [limit, type]);

  /**
   * Normalizes the story status to a display-friendly format.
   * @param {Story} story - The story object from the API.
   * @returns {'Hoàn thành' | 'Đang phát hành'} The display status.
   */
  const getStoryStatus = (story: Story): 'Hoàn thành' | 'Đang phát hành' => {
    return story.status === 'hoan-thanh' || story.status === 'completed' ? 'Hoàn thành' : 'Đang phát hành';
  };
  
  /**
   * Extracts and returns a list of genre names from the story object.
   * @param {Story} story - The story object.
   * @returns {string[]} An array of genre names.
   */
  const getStoryGenres = (story: Story): string[] => {
    const genres = story.genres || story.category;
    if (Array.isArray(genres)) {
      // The API might return an array of strings or an array of Genre objects.
      if (typeof genres[0] === 'string') {
        return genres as string[];
      }
      return (genres as ApiGenre[]).map(g => g.name).filter(Boolean);
    }
    return [];
  };

  if (loading) {
    // Skeleton loader for better UX
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: limit }, (_, i) => (
          <div key={i} className="rounded-lg bg-white shadow-md dark:bg-gray-800 animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <div className="p-3 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="flex gap-2 pt-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Không có truyện nào để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {stories.map((story) => {
        if (!story.slug) return null; // Don't render stories without a slug

        const storyTitle = story.name || 'Truyện tranh';
        const storyImage = getImageUrl(story.thumb_url || story.thumbnail || '');
        const latestChapter = story.chaptersLatest?.[0]?.chapter_name || 'Chương mới';
        const storyStatus = getStoryStatus(story);
        const storyGenres = getStoryGenres(story);

        return (
          <Link
            key={story._id || story.slug}
            href={`/truyen/${story.slug}`}
            className="group block overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md transition-shadow hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-700">
              <Image
                src={storyImage}
                alt={`Bìa truyện ${storyTitle}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
              />
              
              <div className="absolute right-2 top-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium shadow-sm ${
                    storyStatus === 'Hoàn thành'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {storyStatus}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{story.views?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{story.rating ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3">
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white" title={storyTitle}>
                {storyTitle}
              </h3>
              <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                {latestChapter}
              </p>
              <div className="flex flex-wrap gap-1">
                {storyGenres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
