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
   * @property {Story[]} [stories] - An optional array of stories to display. If provided, the component will not fetch its own data.
   */
  stories?: Story[];
  /**
   * @property {number} [limit=24] - The maximum number of stories to fetch and display (only used if `stories` prop is not provided).
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

  const getStoryStatus = (s: Story): 'Hoàn thành' | 'Đang phát hành' => {
    return s.status === 'hoan-thanh' || s.status === 'completed' ? 'Hoàn thành' : 'Đang phát hành';
  };

  const getStoryGenres = (s: Story): string[] => {
    const genres = s.genres || s.category;
    if (Array.isArray(genres)) {
      if (typeof genres[0] === 'string') return genres as string[];
      return (genres as ApiGenre[]).map(g => g.name).filter(Boolean);
    }
    return [];
  };

  const storyStatus = getStoryStatus(story);
  const storyGenres = getStoryGenres(story);

  return (
    <Link
      key={story._id || story.slug}
      href={`/truyen/${story.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900 shadow-lg group-hover:shadow-lime-400/20 transition-all duration-300">
        <Image
          src={storyImage}
          alt={`Bìa truyện ${storyTitle}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw"
          onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
        />

        <div className="absolute right-2 top-2 z-10">
          <span
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm opacity-90 ${storyStatus === 'Hoàn thành'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
              }`}
          >
            {storyStatus}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 pt-8 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center justify-between text-[10px] md:text-xs text-white">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span>{story.views?.toLocaleString() ?? '0'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{story.rating ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="mb-1 line-clamp-2 recent-update-title group-hover:text-lime-400 transition-colors" title={storyTitle}>
          {storyTitle}
        </h3>
        <p className="recent-update-sup-title line-clamp-1 opacity-70">
          Chương {latestChapter}
        </p>
      </div>
    </Link>
  );
}

export default function StoryGrid(props: StoryGridProps) {
  if (props.stories) {
    if (props.stories.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
        {props.stories.map((story) => (
          <StoryCard key={story._id || story.slug} story={story} />
        ))}
      </div>
    );
  }

  return <SelfFetchingStoryGrid limit={props.limit} type={props.type} />;
}

function SelfFetchingStoryGrid({ limit = 24, type = 'truyen-moi' }: StoryGridProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
        {Array.from({ length: limit || 24 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-800 rounded-xl mb-3"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-lime-500 text-black font-bold rounded-full hover:bg-lime-400 transition-colors"
        >
          Thử lại
        </button>
      </div>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
      {stories.map((story) => (
        <StoryCard key={story._id || story.slug} story={story} />
      ))}
    </div>
  );
}
