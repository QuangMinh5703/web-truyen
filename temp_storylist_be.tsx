'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';

/**
 * @interface StoryCardProps
 * @description Props for the StoryCard component.
 */
interface StoryCardProps {
  /**
   * @property {Story} story - The story data to display.
   */
  story: Story;
}

/**
 * A reusable card component to display a single story's cover and title.
 * @param {StoryCardProps} props - The component props.
 * @returns {JSX.Element | null} A card linking to the story's detail page.
 */
const StoryCard = ({ story }: StoryCardProps) => {
  if (!story.slug) {
    return null; // Don't render if there's no slug to link to.
  }

  const storyTitle = story.name || 'Truyện tranh';
  const imageUrl = getImageUrl(story.thumb_url || story.thumbnail || '');

  return (
    <Link href={`/truyen/${story.slug}`} className="group block">
      <div className="flex flex-col">
        <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3 shadow-sm">
          <Image
            src={imageUrl || '/placeholder-story.jpg'}
            alt={`Bìa truyện ${storyTitle}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-story.jpg';
            }}
          />
        </div>
        <h3
          className="recent-update-title"
          title={storyTitle}
        >
          {storyTitle}
        </h3>
      </div>
    </Link>
  );
};


/**
 * @interface StoryListProps
 * @description Props for the StoryList component.
 */
interface StoryListProps {
  /**
   * @property {string} title - The title to display for the list section.
   */
  title: string;
  /**
   * @property {'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh'} [type='truyen-moi']
   * - The type of stories to fetch.
   */
  type?: 'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh';
  /**
   * @property {number} [limit=20] - The maximum number of stories to fetch.
   */
  limit?: number;
}

/**
 * A component that fetches and displays a horizontal list of stories.
 * Includes a title, a "View More" link, and a grid of StoryCards.
 * Handles its own loading and empty states.
 *
 * @param {StoryListProps} props - The component props.
 * @returns {JSX.Element} A section containing a list of stories.
 */
const StoryList = ({ title, type = 'truyen-moi', limit = 10 }: StoryListProps) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const listResponse = await otruyenApi.getStoriesByType(type, { page: 1, limit });
        setStories(listResponse?.items || []);
      } catch (error) {
        console.error(`[StoryList] Error fetching stories for type "${type}":`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [type, limit]);

  const SkeletonLoader = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: limit }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="title-main">
          Truyện mới
        </h2>
        <Link href={`/the-loai`} passHref>
            <Image
                src="/view_more.svg"
                alt=""
                onClick={() => {}}
                width={116}
                height={52}
                className="text-lime-400 cursor-pointer"
            />
        </Link>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : stories.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          Không tìm thấy truyện nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {stories.map((story) => (
            <StoryCard key={story._id || story.slug} story={story} />
          ))}
        </div>
      )}
    </section>
  );
};

export default StoryList;