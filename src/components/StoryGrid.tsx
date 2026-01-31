'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Eye } from 'lucide-react';
import { otruyenApi, Story, Genre as ApiGenre } from '@/lib/api';
import { getImageUrl } from '@/lib/api';
import ErrorDisplay from './ui/ErrorDisplay';

/**
 * @interface StoryGridProps
 * @description Props for the StoryGrid component.
 */
interface StoryGridProps {
  /**
   * @property {Story[]} [stories] - An optional array of stories to display. If provided, the component will not fetch its own data.
   */
  stories?: Story[];
  /**
   * @property {number} [limit=20] - The maximum number of stories to fetch and display (only used if `stories` prop is not provided).
   */
  limit?: number;
  /**
   * @property {'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh'} [type='truyen-moi']
   * - The type of stories to fetch (only used if `stories` prop is not provided).
   */
  type?: 'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh';
}

function StoryCard({ story }: { story: Story }) {
  if (!story.slug) return null;

  const storyTitle = story.name || 'Truyện tranh';
  const storyImage = getImageUrl(story.thumb_url || story.thumbnail || '');
  const latestChapter = story.chaptersLatest?.[0]?.chapter_name || 'Chương mới';

  // Helper to extract category names safely
  const getCategories = (s: Story): string => {
    const cats = s.category || s.genres;
    if (Array.isArray(cats) && cats.length > 0) {
      // Handle both string[] and Object[] structure if needed,
      // though typically API returns objects with { name }
      return cats.map((c: any) => c.name || c).slice(0, 3).join(' | ');
    }
    return 'Truyện tranh';
  };

  const categoriesText = getCategories(story);

  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-[2/3] shadow-lg group-hover:shadow-lime-400/20 transition-all duration-300">
        <Image
          src={storyImage}
          alt={`Bìa truyện ${storyTitle}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw"
          onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
        />
        {/* Simple overlay for generic status if needed, or keeping it clean like hoan-thanh */}
      </div>

      <h3 className="mb-2 recent-update-title line-clamp-2">
        {storyTitle}
      </h3>
      <h2 className="mb-2 recent-update-sup-title line-clamp-1">
        {categoriesText}
      </h2>
    </Link>
  );
}

export default function StoryGrid(props: StoryGridProps) {
  if (props.stories) {
    if (props.stories.length === 0) return null;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
        {props.stories.map((story) => (
          <StoryCard key={story._id || story.slug} story={story} />
        ))}
      </div>
    );
  }

  return <SelfFetchingStoryGrid limit={props.limit} type={props.type} />;
}

function SelfFetchingStoryGrid({ limit = 20, type = 'truyen-moi' }: StoryGridProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await otruyenApi.getStoriesByType(type, { page: 1, limit });
        setStories(response?.items?.slice(0, limit) || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Không thể tải danh sách truyện. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [limit, type]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
        {Array.from({ length: limit || 10 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-800 rounded-lg aspect-[2/3] mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Không có truyện nào để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
      {stories.map((story) => (
        <StoryCard key={story._id || story.slug} story={story} />
      ))}
    </div>
  );
}
