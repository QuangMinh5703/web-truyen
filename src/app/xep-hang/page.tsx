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

  const hotStories = useMemo(() => getHotStories('month', 100), [getHotStories]);

  useEffect(() => {
    const fetchRankedStories = async () => {
      setLoading(true);
      try {
        const stories = await Promise.all(
          hotStories.map(async (story) => {
            if ('storySlug' in story && !('cover' in story)) {
              const storyDetails = await otruyenApi.getStoryBySlug(story.storySlug);
              return { ...story, ...storyDetails };
            }
            return story;
          })
        );
        setRankedStories(stories);
      } catch (error) {
        console.error('Error fetching ranked stories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hotStories.length > 0) {
      fetchRankedStories();
    } else {
      setLoading(false);
    }
  }, [hotStories]);

  const currentStories = useMemo(() => {
    const indexOfLastStory = currentPage * storiesPerPage;
    const indexOfFirstStory = indexOfLastStory - storiesPerPage;
    return rankedStories.slice(indexOfFirstStory, indexOfLastStory);
  }, [rankedStories, currentPage, storiesPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col min-h-screen --background text-gray-800">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Bảng Xếp Hạng Tháng</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 aspect-[3/4] rounded-lg"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mt-1"></div>
              </div>
            ))}
          </div>
        ) : rankedStories.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            Không có dữ liệu xếp hạng để hiển thị.
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentStories.map((story, index) => {
                const storyName = 'name' in story ? story.name : story.storyTitle || 'Truyện tranh';
                const storySlug = 'slug' in story ? story.slug : story.storySlug || '';
                const imageUrl = getImageUrl(('cover' in story && story.cover) || ('thumbnail' in story && story.thumbnail) || ('thumb_url' in story && story.thumb_url) || '');
                const indexOfFirstStory = (currentPage - 1) * storiesPerPage;

                return (
                  <Link key={storySlug} href={`/truyen/${storySlug}`}>
                    <div className="group">
                      <div className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg transition-transform transform group-hover:scale-105">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={storyName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600">
                                <span className="text-4xl">📖</span>
                            </div>
                        )}
                         <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            #{indexOfFirstStory + index + 1}
                        </div>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600">{storyName}</h3>
                      <p className="text-sm text-gray-500">Lượt xem: {'totalViews' in story ? story.totalViews : 'N/A'}</p>
                    </div>
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