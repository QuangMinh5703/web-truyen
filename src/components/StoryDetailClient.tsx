'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import { otruyenApi, Story, getImageUrl, UiChapter } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { trackView } from '@/lib/ranking';

const getChapterId = (url: string | undefined): string => {
  if (!url) return '';
  return url.substring(url.lastIndexOf('/') + 1);
};

const DynamicCommentSection = dynamic(() => import('@/components/CommentSection'), {
  loading: () => (
    <div className="text-center py-12 bg-white/5 rounded-2xl">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
      <p className="mt-2 text-gray-500">Đang tải bình luận...</p>
    </div>
  ),
  ssr: false,
});

const StoryDetailClient = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReadChapter, setLastReadChapter] = useState<{ chapterId: string, page: number } | null>(null);

  const trackedRef = useRef(false);
  const { ref: commentsRef, inView: commentsInView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

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
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [slug]);

  // Track view khi story đã load
  useEffect(() => {
    if (story?.slug && story?.name && !trackedRef.current) {
      trackView(story.slug, story.name, story.thumb_url || '');
      trackedRef.current = true;
    }
  }, [story]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  const allChapters: UiChapter[] = useMemo(() => {
    if (!story?.chapters) return [];

    const seen = new Set<string>();
    return story.chapters
      .flatMap(server => server.server_data || [])
      .reduce<UiChapter[]>((acc, apiChapter) => {
        let id = getChapterId(apiChapter.chapter_api_data);
        if (!id && apiChapter.filename) {
          id = apiChapter.filename;
        }
        if (!id || seen.has(id)) return acc;
        seen.add(id);
        acc.push({
          id,
          name: apiChapter.chapter_name || '',
          title: apiChapter.chapter_title || '',
        });
        return acc;
      }, []);
  }, [story]);

  useEffect(() => {
    if (!story || allChapters.length === 0) return;

    let lastRead: { chapterId: string; page: number } | null = null;
    for (let i = allChapters.length - 1; i >= 0; i--) {
      const chapter = allChapters[i];
      const savedPage = localStorage.getItem(`reading-progress-${chapter.id}`);
      if (savedPage) {
        lastRead = { chapterId: chapter.id, page: parseInt(savedPage, 10) };
        break;
      }
    }
    setLastReadChapter(lastRead);
  }, [story, allChapters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'dang-phat-hanh': return 'Đang phát hành';
      case 'hoan-thanh': return 'Hoàn thành';
      case 'sap-ra-mat': return 'Sắp ra mắt';
      default: return 'Đang cập nhật';
    }
  };

  const handleReadClick = () => {
    if (allChapters.length === 0) return;

    if (lastReadChapter) {
      router.push(`/truyen/${slug}/chuong/${lastReadChapter.chapterId}`);
    } else {
      router.push(`/truyen/${slug}/chuong/${allChapters[0].id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0">
                <div className="bg-gray-800 aspect-[3/4] rounded-2xl"></div>
                <div className="h-14 bg-gray-800 rounded-xl mt-6"></div>
                <div className="h-14 bg-gray-800/50 rounded-xl mt-3"></div>
              </div>
              <div className="flex-grow space-y-4">
                <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-32 bg-gray-800 rounded-2xl mt-4"></div>
                <div className="h-24 bg-gray-800 rounded-2xl"></div>
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
      <div className="min-h-screen --background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <ErrorDisplay
            message={error || 'Không tìm thấy truyện'}
            onRetry={() => window.location.reload()}
          />
        </main>
        <FooterComponent />
      </div>
    );
  }

  const imageUrl = getImageUrl(story.cover || story.thumbnail || story.thumb_url || '');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-lime-400 selection:text-black">
      <Navbar />

      <main className="flex-grow max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 md:mb-10">
          <ol className="flex flex-wrap items-center space-x-2 text-xs md:text-sm text-gray-400 uppercase tracking-widest font-medium">
            <li>
              <Link href="/" className="hover:text-lime-400 transition-colors">TRANG CHỦ</Link>
            </li>
            <li>/</li>
            <li className="text-gray-300 truncate max-w-[200px] md:max-w-none">{story.name || 'Truyện'}</li>
          </ol>
        </nav>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-14">

          {/* Left Side: Cover and Quick Stats */}
          <div className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0">
            <div className="sticky top-24 space-y-6 md:space-y-8">
              {/* Cover Image */}
              <div className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 group">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`Bìa truyện ${story.name}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-6xl">📖</span>
                  </div>
                )}

                {/* Floating Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xl ${story.status === 'dang-phat-hanh'
                    ? 'bg-blue-600/90 text-white backdrop-blur-md'
                    : 'bg-green-600/90 text-white backdrop-blur-md'
                    }`}>
                    {getStatusText(story.status || '')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleReadClick}
                  disabled={allChapters.length === 0}
                  className={`w-full px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-lg ${allChapters.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-lime-500 text-black hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98] shadow-lime-500/20'
                    }`}
                >
                  {lastReadChapter ? 'ĐỌC TIẾP' : 'ĐỌC TỪ ĐẦU'}
                </button>

                <button className="w-full px-6 py-4 bg-white/5 text-white rounded-xl font-bold text-base hover:bg-white/10 transition-all border border-white/10 select-none active:scale-[0.98]">
                  THEO DÕI
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
                <div className="text-center">
                  <div className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1">Lượt xem</div>
                  <div className="text-white font-bold">{story.views?.toLocaleString('vi-VN') ?? '0'}</div>
                </div>
                <div className="text-center border-x border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1">Đánh giá</div>
                  <div className="text-lime-400 font-bold">{story.rating ?? 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1">Chương</div>
                  <div className="text-white font-bold">{allChapters.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Info */}
          <div className="flex-grow">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase mb-4 leading-tight title-main">
              {story.name}
            </h1>

            {story.origin_name && story.origin_name.length > 0 && (
              <p className="text-gray-400 text-sm md:text-base font-medium mb-6">
                <span className="text-gray-600 mr-2">Tên khác:</span> {story.origin_name.join(', ')}
              </p>
            )}

            {/* Meta Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1.5">Tác giả</span>
                <span className="text-gray-200 font-semibold text-sm md:text-base">
                  {story.author && Array.isArray(story.author) ? story.author.join(', ') : 'Đang cập nhật'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1.5">Cập nhật</span>
                <span className="text-gray-200 font-semibold text-sm md:text-base">
                  {story.updatedAt ? formatDate(story.updatedAt) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Genres Row */}
            <div className="mb-10">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-3">Thể loại</span>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {story.genres && story.genres.map((genre, index) => (
                  <Link
                    key={index}
                    href={`/the-loai/${typeof genre === 'string' ? genre : genre.slug || ''}`}
                    className="px-4 py-2.5 bg-gray-900 text-gray-300 rounded-xl text-xs md:text-sm font-bold border border-white/5 hover:border-lime-500/50 hover:text-lime-400 transition-all active:scale-95"
                  >
                    {typeof genre === 'string' ? genre : genre.name || 'Không rõ'}
                  </Link>
                ))}
              </div>
            </div>

            {/* Description Tab */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest border-b-2 border-lime-500 pb-1">Nội dung</h3>
              </div>
              <div
                className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed font-medium opacity-80"
                dangerouslySetInnerHTML={{ __html: story.description || 'Nội dung truyện đang được cập nhật...' }}
              />
            </div>

            {/* Chapter List Section */}
            {allChapters.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest">Danh sách chương</h3>
                  <span className="text-xs bg-gray-900 px-3 py-1 rounded-full text-gray-500 font-bold">{allChapters.length} CHƯƠNG</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allChapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/truyen/${slug}/chuong/${chapter.id}`}
                      className="group flex flex-col p-4 bg-gray-900/50 rounded-xl border border-white/5 hover:border-lime-500/50 hover:bg-gray-900 transition-all duration-300 active:scale-95"
                    >
                      <div className="font-bold text-gray-200 group-hover:text-lime-400 transition-colors text-sm md:text-base">
                        Chương {chapter.name}
                      </div>
                      {chapter.title && (
                        <div className="text-[10px] text-gray-500 mt-1 truncate uppercase tracking-widest font-bold">
                          {chapter.title}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section Container */}
            <div className="mt-16 pt-10 border-t border-white/10" id="comments" ref={commentsRef}>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-10 text-center md:text-left">Cộng đồng bàn luận</h3>
              {commentsInView && story && (
                <DynamicCommentSection
                  storySlug={slug}
                  storyTitle={story.name}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
};

export default StoryDetailClient;
