'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { otruyenApi, Story } from '@/lib/api';

const TopRankings = () => {
  const [rankings, setRankings] = useState<{
    day: Story[];
    week: Story[];
    month: Story[];
  }>({
    day: [],
    week: [],
    month: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        
        // Tạm thời dùng cùng endpoint /home cho tất cả
        // Có thể API có endpoint riêng cho từng period
        const [dayResponse, weekResponse, monthResponse] = await Promise.all([
          otruyenApi.getTopViewedStories({ page: 1, limit: 5 }),
          otruyenApi.getTopViewedStories({ page: 1, limit: 5 }),
          otruyenApi.getTopViewedStories({ page: 1, limit: 5 }),
        ]);

        const extractData = (response: any): Story[] => {
          // Nếu response là array trực tiếp
          if (Array.isArray(response)) {
            return response;
          }
          
          // Nếu response là object, tìm data trong các field phổ biến
          if (response && typeof response === 'object') {
            // Xử lý cấu trúc: {status, message, data: {items: [...]}}
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
              const items = response.data.items || response.data.data || response.data.list;
              if (Array.isArray(items)) {
                return items;
              }
            }
            const data = response.data || response.items || response.results;
            if (Array.isArray(data)) {
              return data;
            }
          }
          
          // Trả về mảng rỗng nếu không tìm thấy
          return [];
        };

        const dayData = extractData(dayResponse);
        const weekData = extractData(weekResponse);
        const monthData = extractData(monthResponse);

        setRankings({
          day: Array.isArray(dayData) ? dayData.slice(0, 5) : [],
          week: Array.isArray(weekData) ? weekData.slice(0, 5) : [],
          month: Array.isArray(monthData) ? monthData.slice(0, 5) : [],
        });
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const RankingList = ({ 
    title, 
    stories, 
    period 
  }: { 
    title: string; 
    stories: Story[];
    period: 'day' | 'week' | 'month';
  }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
            <h3 className="text-white font-bold text-lg">Top {title}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
          <h3 className="text-white font-bold text-lg">Top {title}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stories.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không có dữ liệu
            </div>
          ) : (
            stories.map((story, index) => {
              const rank = index + 1;
              const storyId = story._id || story.id || '';
              const storySlug = story.slug || storyId;
              return (
                <Link
                  key={storyId}
                  href={`/truyen/${storySlug}`}
                  className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank === 1
                          ? 'bg-yellow-400 text-yellow-900'
                          : rank === 2
                          ? 'bg-gray-300 text-gray-700'
                          : rank === 3
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-800 hover:text-purple-600">
                        {story.name || story.title || 'Truyện tranh'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatViews(story.views)} lượt xem
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <span className="text-3xl">🏆</span>
          <span>Bảng xếp hạng</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankingList title="Ngày" stories={rankings.day} period="day" />
        <RankingList title="Tuần" stories={rankings.week} period="week" />
        <RankingList title="Tháng" stories={rankings.month} period="month" />
      </div>
    </section>
  );
};

export default TopRankings;

