'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { otruyenApi, Story, Chapter } from '@/lib/api';

interface RecentUpdate {
  story: Story;
  latestChapter?: Chapter;
}

const RecentUpdates = () => {
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentUpdates = async () => {
      try {
        setLoading(true);
        console.log('[RecentUpdates] Fetching latest stories...');
        const response = await otruyenApi.getLatestStories({
          page: 1,
          limit: 6,
        });
        
        console.log('[RecentUpdates] Response received:', response);
        
        // Xử lý response có thể là array hoặc object với data field
        let storiesData: Story[] = [];
        
        if (Array.isArray(response)) {
          storiesData = response;
        } else if (response && typeof response === 'object') {
          // Xử lý cấu trúc: {status, message, data: {items: [...]}}
          const responseObj = response as any;
          if (responseObj.data && typeof responseObj.data === 'object' && !Array.isArray(responseObj.data)) {
            storiesData = responseObj.data.items || responseObj.data.data || responseObj.data.list || [];
          } else {
            storiesData = responseObj.data || responseObj.items || responseObj.results || responseObj.list || responseObj.stories || [];
          }
        }
        
        console.log('[RecentUpdates] Extracted stories:', storiesData);
        console.log('[RecentUpdates] Stories count:', storiesData.length);
        
        if (Array.isArray(storiesData) && storiesData.length > 0) {
          // Sử dụng chaptersLatest từ story
          const updatesWithChapters = storiesData.map((story: Story) => {
            const latestChapterData = story.chaptersLatest?.[0];
            return {
              story,
              latestChapter: latestChapterData ? {
                id: latestChapterData.chapter_api_data?.split('/').pop() || '',
                title: latestChapterData.chapter_title || latestChapterData.filename || '',
                chapterNumber: parseInt(latestChapterData.chapter_name || '0'),
                slug: latestChapterData.chapter_api_data?.split('/').pop() || '',
              } as Chapter : undefined,
            };
          });
          setUpdates(updatesWithChapters);
        } else {
          console.warn('[RecentUpdates] No stories found in response');
        }
      } catch (error) {
        console.error('[RecentUpdates] Error fetching recent updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUpdates();
  }, []);

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Vừa xong';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
  };

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <span className="text-3xl">🆕</span>
            <span>Cập nhật mới nhất</span>
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <span className="text-3xl">🆕</span>
          <span>Cập nhật mới nhất</span>
        </h2>
        <Link href="/cap-nhat" className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1">
          <span>Xem tất cả</span>
          <span>→</span>
        </Link>
      </div>
      
      {updates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Không có cập nhật mới
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {updates.map((update) => {
              const storyId = update.story._id || update.story.id || '';
              const storySlug = update.story.slug || storyId;
              const storyTitle = update.story.name || update.story.title || 'Truyện tranh';
              const chapterSlug = update.latestChapter?.slug || update.latestChapter?.id || '';
              return (
              <Link
                key={storyId}
                href={`/truyen/${storySlug}${chapterSlug ? `/chuong/${chapterSlug}` : ''}`}
                className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 hover:text-purple-600 mb-1">
                      {storyTitle}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {update.latestChapter && (
                        <>
                          <span>Chương {update.latestChapter.chapterNumber || update.latestChapter.title}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatTimeAgo(update.story.updatedAt)}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span>👁️</span>
                        <span>{formatViews(update.story.views)}</span>
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                    Mới
                  </span>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecentUpdates;

