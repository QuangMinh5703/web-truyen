'use client';

import { useState, useEffect, useMemo } from 'react';
import { useViewTracking } from '@/lib/hooks/useViewTracking';
import { StoryStats } from '@/lib/view-tracking';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import Image from 'next/image';
import Link from 'next/link';

const RankingPage = () => {
  const [rankedStories, setRankedStories] = useState<(Story | StoryStats)[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [storiesPerPage] = useState(20);
  const { getHotStories } = useViewTracking();

  useEffect(() => {
    const fetchRankedStories = async () => {
      setLoading(true);
      try {
        const hotStoriesList = await getHotStories('month', 100);

        const stories = await Promise.all(
          hotStoriesList.map(async (story) => {
            if ('storySlug' in story && !('cover' in story)) {
              const storyDetails = await otruyenApi.getStoryBySlug(story.storySlug);
              return { ...story, ...storyDetails };
            }
            return story;
          })
        );
        setRankedStories(stories);
      } catch (error) {
        // Error silently handled — empty state shown
      } finally {
        setLoading(false);
      }
    };

    fetchRankedStories();
  }, [getHotStories]);

  const currentStories = useMemo(() => {
    const indexOfLastStory = currentPage * storiesPerPage;
    const indexOfFirstStory = indexOfLastStory - storiesPerPage;
    return rankedStories.slice(indexOfFirstStory, indexOfLastStory);
  }, [rankedStories, currentPage, storiesPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main text-center mb-8">Bảng xếp hạng tháng</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-800 aspect-[2/3] rounded-lg"></div>
                <div className="h-4 bg-gray-800 rounded mt-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 mt-1"></div>
              </div>
            ))}
          </div>
        ) : rankedStories.length === 0 ? (
          <div className="text-center text-gray-400 text-xl font-lexend-exa">
            Không có dữ liệu xếp hạng để hiển thị.
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
              {currentStories.map((story, index) => {
                const storyName = (('name' in story ? story.name : ('storyTitle' in story ? story.storyTitle : null)) || 'Truyện tranh') as string;
                const storySlug = (('slug' in story ? story.slug : ('storySlug' in story ? story.storySlug : null)) || '') as string;
                const imageUrl = getImageUrl(('cover' in story && typeof story.cover === 'string' ? story.cover : ('thumbnail' in story && typeof story.thumbnail === 'string' ? story.thumbnail : ('thumb_url' in story && typeof story.thumb_url === 'string' ? story.thumb_url : ''))));
                const indexOfFirstStory = (currentPage - 1) * storiesPerPage;
                const categories = ('category' in story) ? (story.category as any[]) : [];
                const categoryText = (Array.isArray(categories) && categories.length > 0) ? categories.map(c => c.name).slice(0, 3).join(' | ') : 'Xếp hạng';

                return (
                  <Link key={storySlug} href={`/truyen/${storySlug}`} className="group block flex-shrink-0 snap-start">
                    <div className="relative mb-4 aspect-[2/3] hover:scale-105 transition-transform shadow-lg group-hover:shadow-lime-400/20 rounded-lg">
                      <Image
                        src={imageUrl || '/placeholder-story.jpg'}
                        alt={storyName || 'Truyện tranh'}
                        fill
                        className="object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center top-ranking-banner scale-75 md:scale-100 z-10">
                        <span className="top-ranking-banner-text text-xs md:text-sm">{indexOfFirstStory + index + 1}</span>
                      </div>
                    </div>

                    <h3 className="mb-2 recent-update-title line-clamp-2">
                      {storyName}
                    </h3>
                    <h2 className="mb-2 recent-update-sup-title line-clamp-1">
                      {categoryText}
                    </h2>
                  </Link>
                );
              })}
            </div>

          </div>
        )}
      </main>
      <FooterComponent />
    </div>
  );
};

export default RankingPage;