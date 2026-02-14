'use client';

import { useState, useEffect, useMemo } from 'react';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import Image from 'next/image';
import Link from 'next/link';

const RankingPage = () => {
  const [rankedStories, setRankedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [storiesPerPage] = useState(20);

  useEffect(() => {
    const fetchRankedStories = async () => {
      setLoading(true);
      try {
        const response = await otruyenApi.getHomeStories({ page: 1 });
        setRankedStories(response?.items ?? []);
      } catch {
        // Empty state shown on failure
      } finally {
        setLoading(false);
      }
    };

    fetchRankedStories();
  }, []);

  const currentStories = useMemo(() => {
    const indexOfLastStory = currentPage * storiesPerPage;
    const indexOfFirstStory = indexOfLastStory - storiesPerPage;
    return rankedStories.slice(indexOfFirstStory, indexOfLastStory);
  }, [rankedStories, currentPage, storiesPerPage]);

  const totalPages = Math.ceil(rankedStories.length / storiesPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main text-center mb-8">Bảng xếp hạng</h1>

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
                const storyName = story.name || 'Truyện tranh';
                const storySlug = story.slug || '';
                const imageUrl = getImageUrl(story.thumb_url || story.cover || story.thumbnail || '');
                const indexOfFirstStory = (currentPage - 1) * storiesPerPage;
                const categories = story.category ?? [];
                const categoryText = categories.length > 0
                  ? categories.map(c => c.name).slice(0, 3).join(' | ')
                  : 'Xếp hạng';

                return (
                  <Link key={storySlug || index} href={`/truyen/${storySlug}`} className="group block flex-shrink-0 snap-start">
                    <div className="relative mb-4 aspect-[2/3] hover:scale-105 transition-transform shadow-lg group-hover:shadow-lime-400/20 rounded-lg">
                      <Image
                        src={imageUrl || '/placeholder-story.jpg'}
                        alt={storyName}
                        fill
                        className="object-cover rounded-lg shadow-md"
                        onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
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

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-lime-400 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <FooterComponent />
    </div>
  );
};

export default RankingPage;
