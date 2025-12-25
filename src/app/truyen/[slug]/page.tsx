'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { otruyenApi, Story, ApiChapter, getImageUrl, UiChapter } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';

// Helper to extract chapter ID from a full API URL
const getChapterId = (url: string | undefined): string => {
  if (!url) return '';
  return url.substring(url.lastIndexOf('/') + 1);
};

const StoryDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReadChapter, setLastReadChapter] = useState<{chapterId: string, page: number} | null>(null);

  // Fetch story data
  useEffect(() => {
    const fetchStory = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const storyData = await otruyenApi.getStoryBySlug(slug);
        
        if (storyData) {
          setStory(storyData);
        } else {
          setError('Không tìm thấy truyện');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [slug]);

  const allChapters: UiChapter[] = useMemo(() => {
    if (!story?.chapters) return [];
    
    return story.chapters
      .flatMap(server => server.server_data || [])
      .map(apiChapter => ({
        id: getChapterId(apiChapter.chapter_api_data),
        name: apiChapter.chapter_name || '',
        title: apiChapter.chapter_title || '',
      }))
      .filter(chapter => chapter.id);
  }, [story]);

  useEffect(() => {
    if (!story || allChapters.length === 0) return;

    let lastRead: { chapterId: string; page: number } | null = null;
    // Iterate backwards for efficiency, assuming user is more likely to have read recent chapters
    for (let i = allChapters.length - 1; i >= 0; i--) {
      const chapter = allChapters[i];
      const savedPage = localStorage.getItem(`reading-progress-${chapter.id}`);
      if (savedPage) {
        lastRead = { chapterId: chapter.id, page: parseInt(savedPage, 10) };
        break; // Found the last read chapter
      }
    }
    setLastReadChapter(lastRead);
  }, [story, allChapters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'dang-phat-hanh':
        return 'Đang phát hành';
      case 'hoan-thanh':
        return 'Hoàn thành';
      case 'sap-ra-mat':
        return 'Sắp ra mắt';
      default:
        return 'Đang cập nhật';
    }
  };

  const handleReadClick = () => {
    if (lastReadChapter) {
        router.push(`/truyen/${slug}/chuong/${lastReadChapter.chapterId}`);
    } else if (allChapters.length > 0) {
        const firstChapterId = allChapters[0].id;
        router.push(`/truyen/${slug}/chuong/${firstChapterId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gray-300 aspect-[3/4] rounded-lg"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy truyện'}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Quay lại trang chủ
            </Link>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  const imageUrl = getImageUrl(story.cover || story.thumbnail || story.thumb_url || '');

  return (
    <div className="min-h-screen --background text-gray-800">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:--ranking-banner-color ">Trang chủ</Link>
            </li>
            <li>/</li>
            <li className="text-gray-800 font-medium">{story.name || 'Untitled'}</li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg mb-4">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={story.name || 'Comic story'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-story.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600">
                    <span className="text-6xl">📖</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  story.status === 'dang-phat-hanh'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {getStatusText(story.status || '')}
                </span>
              </div>
              
              <div className="flex justify-center">
                  <button
                      onClick={handleReadClick}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-transform transform hover:scale-105"
                  >
                      {lastReadChapter ? 'Đọc tiếp' : 'Đọc từ đầu'}
                  </button>
              </div>

            </div>
          </div>

          {/* Right Column - Story Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              {story.name || 'Untitled Story'}
            </h1>

            {story.origin_name && story.origin_name.length > 0 && (
              <p className="text-gray-500 mb-4">
                <strong>Tên khác:</strong> {story.origin_name.join(', ')}
              </p>
            )}

            <div className="mb-4">
              <strong className="text-gray-700">Tác giả:</strong>
              <span className="ml-2 text-gray-600">
                {story.author && Array.isArray(story.author) ? story.author.join(', ') : 'Đang cập nhật'}
              </span>
            </div>

            <div className="mb-6">
              <strong className="text-gray-700">Thể loại:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {story.genres && story.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {typeof genre === 'string' ? genre : genre.name || 'Unknown'}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 text-sm text-gray-500">
              <p>Cập nhật lần cuối: {story.updatedAt ? formatDate(story.updatedAt) : 'N/A'}</p>
              {allChapters.length > 0 && (
                <p>Tổng số chương: {allChapters.length}</p>
              )}
            </div>

            <div className="mb-8 p-4 bg-white rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Nội dung</h3>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: story.description || '' }}
              />
            </div>

            {allChapters.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danh sách chương ({allChapters.length} chương)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allChapters.map((chapter) => {
                    return (
                      <Link
                        key={chapter.id}
                        href={`/truyen/${slug}/chuong/${chapter.id}`}
                        className="block p-3 bg-white rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center border-gray-200"
                      >
                        <div className="font-medium text-gray-800">
                          Chương {chapter.name}
                        </div>
                        {chapter.title && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {chapter.title}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
};

export default StoryDetailPage;
