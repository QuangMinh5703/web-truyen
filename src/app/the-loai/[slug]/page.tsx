'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';

const StoryCard = ({ story }: { story: Story }) => {
  const storyId = story._id || story.id || '';
  const storySlug = story.slug || storyId;
  const storyTitle = story.name || story.title || 'Truyện tranh';

  const imageUrl = getImageUrl(story.thumb_url || story.cover || story.thumbnail || '');

  const getStatusText = (status?: string) => {
    if (status === 'ongoing' || status === 'dang-phat-hanh') return 'Đang ra';
    if (status === 'completed' || status === 'hoan-thanh') return 'Hoàn thành';
    if (status === 'sap-ra-mat') return 'Sắp ra mắt';
    return 'Đang ra';
  };

  return (
    <Link href={`/truyen/${storySlug}`} className="group block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-[3/4] bg-gray-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={storyTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600">
              <span className="text-6xl">📖</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${story.status === 'ongoing'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
              }`}>
              {getStatusText(story.status)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {storyTitle}
          </h3>

          {story.author && story.author.length > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              {story.author.join(', ')}
            </p>
          )}

          {story.category && story.category.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {story.category.slice(0, 2).map((cat, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {story.chaptersLatest && story.chaptersLatest.length > 0 && (
            <p className="text-sm text-blue-600">
              Chương mới nhất: {story.chaptersLatest[0].chapter_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

const GenrePage = () => {
  const params = useParams();
  const slug = params?.slug as string;

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genreName, setGenreName] = useState('');

  // Map slug to display name
  const genreNames: Record<string, string> = {
    'lang-man': 'Lãng Mạn',
    'high-school': 'High School',
    'gangster': 'Gangster',
    'obsessive': 'Obsessive',
    'historical': 'Historical',
    'one-side-love': 'One-side Love',
    'bully': 'Bully',
    'non-human': 'Non-human',
    'fantasy': 'Fantasy',
    'supernatural': 'Supernatural',
    'comedy': 'Comedy',
    'action': 'Action',
    'mystery': 'Mystery',
    'tragedy': 'Tragedy',
    'drama': 'Drama',
    'manhwa': 'Manhwa',
    'martial-arts': 'Võ Thuật',
    'truyen-mau': 'Truyện Màu',
  };

  useEffect(() => {
    const fetchGenreStories = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        console.log('[Genre] Fetching stories for genre:', slug);

        // Try to get genre name
        const displayName = genreNames[slug] || slug;
        setGenreName(displayName);

        // Fetch stories by genre (we'll use search as fallback)
        let listResponse;
        try {
          listResponse = await otruyenApi.getStoriesByGenre(slug, { page: 1, limit: 20 });
        } catch (genreError) {
          // If genre endpoint doesn't work, try search
          console.log('[Genre] Genre endpoint failed, trying search:', genreError);
          listResponse = await otruyenApi.searchStories(displayName, { page: 1, limit: 20 });
        }

        console.log('[Genre] Response:', listResponse);

        if (listResponse && listResponse.items) {
          setStories(listResponse.items);
        } else {
          console.warn('[Genre] No stories found for genre:', slug);
        }

      } catch (err) {
        console.error('[Genre] Error:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchGenreStories();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-white rounded-lg h-80">
                  <div className="h-64 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Quay lại trang chủ
            </Link>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen --background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-400 font-lexend-exa">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/the-loai" className="hover:text-blue-600 transition-colors">Thể loại</Link>
            </li>
            <li>/</li>
            <li className="text-white font-medium">{genreName}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="title-main mb-2">
            Thể loại: {genreName}
          </h1>
          <p className="text-gray-400 font-lexend-exa">
            Tìm thấy {stories.length} truyện
          </p>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4 font-lexend-exa">Không có truyện nào trong thể loại này</p>
            <Link href="/" className="text-blue-600 hover:underline font-lexend-exa">
              Quay lại trang chủ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {stories.map((story) => (
              <StoryCard key={story._id || story.id} story={story} />
            ))}
          </div>
        )}
      </main>

      <FooterComponent />
    </div>
  );
};

export default GenrePage;