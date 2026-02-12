'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

// StoryGrid is not used here to match legacy style

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
    'high-school': 'Học Đường',
    'gangster': 'Giang Hồ',
    'obsessive': 'Ám Ảnh',
    'historical': 'Lịch Sử',
    'one-side-love': 'Tình Đơn Phương',
    'bully': 'Bắt Nạt',
    'non-human': 'Phi Nhân',
    'fantasy': 'Huyền Huyễn',
    'supernatural': 'Siêu Nhiên',
    'comedy': 'Hài Hước',
    'action': 'Hành Động',
    'mystery': 'Bí Ẩn',
    'tragedy': 'Bi Kịch',
    'drama': 'Chính Kịch',
    'manhwa': 'Manhwa',
    'martial-arts': 'Võ Thuật',
    'truyen-mau': 'Truyện Màu',
    'bl': 'BL',
    'gl': 'GL',
    'mature': 'Trưởng Thành',
    'adventure': 'Phiêu Lưu',
    'chuyen-sinh': 'Chuyển Sinh',
    'harem': 'Harem',
    'ngon-tinh': 'Ngôn Tình',
    'psychological': 'Tâm Lý',
    'romance': 'Tình Cảm',
    'sci-fi': 'Khoa Học Viễn Tưởng',
    'trinh-tham': 'Trinh Thám',
    'slice-of-life': 'Đời Thường',
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    const fetchGenreStories = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const displayName = genreNames[slug] || slug;
        setGenreName(displayName);

        let listResponse;
        try {
          listResponse = await otruyenApi.getStoriesByGenre(slug, { page: 1, limit: 20 });
        } catch {
          listResponse = await otruyenApi.searchStories(displayName, { page: 1, limit: 20 });
        }

        if (listResponse && listResponse.items) {
          setStories(listResponse.items.slice(0, 20));
        }

      } catch (err) {
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-800 rounded-xl w-64 mb-10"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6 mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
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
      <div className="min-h-screen --background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <ErrorDisplay
            message={error}
            onRetry={() => window.location.reload()}
          />
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
        <nav className="mb-8">
          <ol className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-500 font-lexend-exa">
            <li>
              <Link href="/" className="hover:text-lime-400 transition-colors">TRANG CHỦ</Link>
            </li>
            <li className="opacity-30">/</li>
            <li>
              <Link href="/the-loai" className="hover:text-lime-400 transition-colors">THỂ LOẠI</Link>
            </li>
            <li className="opacity-30">/</li>
            <li className="text-white">{genreName}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="title-main mb-4">
            Thể loại: <span className="text-lime-400">{genreName}</span>
          </h1>
          <p className="text-gray-500 font-lexend-exa font-bold uppercase tracking-widest text-xs">
            Tìm thấy <span className="text-white">{stories.length}</span> truyện tranh phù hợp
          </p>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/20 rounded-3xl border border-white/5 border-dashed">
            <p className="text-gray-500 mb-8 font-lexend-exa text-lg">Hệ thống chưa tìm thấy truyện nào thuộc thể loại này...</p>
            <Link href="/" className="px-8 py-3 bg-lime-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-lime-400 transition-all">
              KHÁM PHÁ CÁC TRUYỆN KHÁC
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {stories.map((story) => {
              const imageUrl = getImageUrl(story.cover || story.thumbnail || story.thumb_url || '');
              const storyTitle = story.name || story.title || 'Untitled Story';
              const categories = story.category;
              const storyId = story._id || story.id;
              const storySlug = story.slug;

              return (
                <Link
                  key={storyId}
                  href={`/truyen/${storySlug}`}
                  className="group block flex-shrink-0 snap-start"
                  onDragStart={(e) => e.preventDefault()}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4 aspect-[2/3] shadow-lg group-hover:shadow-lime-400/20 transition-all duration-300">
                    <Image
                      src={imageUrl}
                      alt={storyTitle}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-story.jpg';
                      }}
                    />
                  </div>

                  <h3 className="mb-2 recent-update-title line-clamp-2">
                    {storyTitle}
                  </h3>
                  <h2 className="mb-2 recent-update-sup-title line-clamp-1">
                    {categories && Array.isArray(categories) && categories.length > 0
                      ? categories.map(category => category.name).slice(0, 3).join(' | ')
                      : 'Thể loại đang được cập nhật.'
                    }
                  </h2>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <FooterComponent />
    </div>
  );
};

export default GenrePage;
