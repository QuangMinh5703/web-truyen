'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTopStories, RankedStory } from '@/lib/ranking';
import { getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import Image from 'next/image';
import Link from 'next/link';
import EyeIcon from '@/components/icons/EyeIcon';

type Period = 'day' | 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  day: 'Hôm nay',
  week: 'Tuần này',
  month: 'Tháng này',
  all: 'Tất cả',
};

const RankingPage = () => {
  const [stories, setStories] = useState<RankedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 20;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getTopStories(period, 100);
        if (!cancelled) setStories(data);
      } catch {
        if (!cancelled) setStories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [period]);

  // Reset page khi đổi period
  useEffect(() => { setCurrentPage(1); }, [period]);

  const currentStories = useMemo(() => {
    const start = (currentPage - 1) * storiesPerPage;
    return stories.slice(start, start + storiesPerPage);
  }, [stories, currentPage, storiesPerPage]);

  const totalPages = Math.ceil(stories.length / storiesPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main text-center mb-6">Bảng xếp hạng</h1>

        {/* Period tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                period === p
                  ? 'bg-lime-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 aspect-[2/3] rounded-lg"></div>
                <div className="h-4 bg-gray-800 rounded mt-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 mt-1"></div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Chưa có dữ liệu xếp hạng.</p>
            <p className="text-gray-600 text-sm mt-2">Dữ liệu sẽ xuất hiện khi có lượt xem truyện.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
              {currentStories.map((story, index) => {
                const rank = (currentPage - 1) * storiesPerPage + index + 1;
                const imageUrl = getImageUrl(story.thumb_url);

                return (
                  <Link
                    key={story.story_slug}
                    href={`/truyen/${story.story_slug}`}
                    className="group block flex-shrink-0 snap-start"
                  >
                    <div className="relative mb-4 aspect-[2/3] hover:scale-105 transition-transform shadow-lg group-hover:shadow-lime-400/20 rounded-lg">
                      <Image
                        src={imageUrl || '/placeholder-story.jpg'}
                        alt={story.story_name}
                        fill
                        className="object-cover rounded-lg shadow-md"
                        onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center top-ranking-banner scale-75 md:scale-100 z-10">
                        <span className="top-ranking-banner-text text-xs md:text-sm">{rank}</span>
                      </div>
                    </div>

                    <h3 className="mb-1 recent-update-title line-clamp-2">
                      {story.story_name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <EyeIcon width={14} height={14} className="flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        {story.total_views.toLocaleString('vi-VN')} lượt xem
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
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
