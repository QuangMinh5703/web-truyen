'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import { getTopStories, RankedStory } from '@/lib/ranking';
import Image from "next/image";
import { useResponsive } from '@/lib/hooks/useMediaQuery';
import ErrorDisplay from './ui/ErrorDisplay';
import EyeIcon from './icons/EyeIcon';

interface DisplayStory {
    name: string;
    slug: string;
    imageUrl: string;
    views?: number;
}

const localBackground = [
    '/ig_toprank/rank1.jpg',
    '/ig_toprank/rank2.jpg',
    '/ig_toprank/rank3.jpg',
    '/ig_toprank/rank4.jpg',
    '/ig_toprank/rank5.jpg'
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface MangaItemProps {
    number: number;
    title: string;
    image: string;
    slug: string;
    views?: number;
}

const MangaItem = ({ number, title, image, slug, views }: MangaItemProps) => (
    <Link href={`/truyen/${slug}`} className="flex-shrink-0 w-full sm:w-auto md:w-full active:scale-[0.97] transition-transform">
        <div className="flex gap-3 md:gap-4 p-2 md:p-3 cursor-pointer hover:bg-white/5 rounded-xl transition-colors group">
            <div className="relative flex-shrink-0 hover:scale-105 transition-transform shadow-lg group-hover:shadow-lime-400/20 rounded-lg">
                <Image
                    src={image}
                    alt={title}
                    width={80}
                    height={96}
                    className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-lg"
                    onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center top-ranking-banner scale-75 md:scale-100">
                    <span className="top-ranking-banner-text text-xs md:text-sm">{number}</span>
                </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="story-list-name line-clamp-2 text-sm md:text-base font-medium text-white group-hover:text-lime-400">
                    {title}
                </h3>
                {views !== undefined && views > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <EyeIcon width={16} height={16} className="flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-500">{views.toLocaleString('vi-VN')}</span>
                    </div>
                )}
            </div>
        </div>
    </Link>
);

/**
 * Merge ranking data (có views) với fallback từ otruyenApi (nếu ranking trống).
 * Ranking Worker trả thumb_url dạng filename → cần getImageUrl().
 */
async function fetchDisplayStories(): Promise<DisplayStory[]> {
    // Try ranking API first
    const ranked = await getTopStories('month', 6);

    if (ranked.length > 0) {
        return ranked.map((r) => ({
            name: r.story_name,
            slug: r.story_slug,
            imageUrl: getImageUrl(r.thumb_url),
            views: r.total_views,
        }));
    }

    // Fallback: show latest stories from otruyenApi
    const response = await otruyenApi.getHomeStories();
    const stories = response?.items ?? [];
    return stories.slice(0, 6).map((s: Story) => ({
        name: s.name || 'Truyện tranh',
        slug: s.slug || '',
        imageUrl: getImageUrl(s.thumb_url || s.cover || s.thumbnail || ''),
    }));
}

const TopRankings = () => {
    const [stories, setStories] = useState<DisplayStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
    const { isMobile } = useResponsive();

    useEffect(() => {
        setBackgroundImages(shuffleArray(localBackground));
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const data = await fetchDisplayStories();
                if (!cancelled) setStories(data);
            } catch {
                if (!cancelled) setError('Không thể tải bảng xếp hạng.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <section className="mb-10 md:mb-14 animate-pulse">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="h-8 bg-gray-800 rounded w-52"></div>
                    <div className="h-10 w-24 bg-gray-800 rounded"></div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-[3] h-[var(--ranking-height)] rounded-2xl bg-gray-900 relative overflow-hidden">
                        <div className="absolute bottom-6 left-6 flex gap-4 items-end">
                            <div className="w-32 h-44 md:w-48 md:h-64 bg-gray-800 rounded-xl"></div>
                            <div className="space-y-3 pb-4">
                                <div className="h-6 bg-gray-800 rounded w-40"></div>
                                <div className="h-4 bg-gray-800 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-2xl p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <div className="w-16 h-20 bg-gray-800 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;
    }

    if (stories.length === 0) return null;

    const featured = stories[0];
    const rest = stories.slice(1, 6);
    const imageBgUrl = backgroundImages[0] || localBackground[0];

    return (
        <section className="mb-10 md:mb-14">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="title-main">Bảng xếp hạng</h2>
                <Link href="/xep-hang" className="flex items-center justify-center min-w-[90px] min-h-[44px] hover:scale-105 transition-transform active:scale-95">
                    <Image
                        src="/view_more.svg"
                        alt="Xem thêm"
                        width={isMobile ? 90 : 116}
                        height={isMobile ? 44 : 52}
                        className="cursor-pointer"
                    />
                </Link>
            </div>

            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 md:gap-4`}>
                {/* Featured Story */}
                <div
                    className="overflow-hidden rounded-2xl relative"
                    style={{ flexBasis: isMobile ? '100%' : 'var(--ranking-featured-width)' }}
                >
                    <Link href={`/truyen/${featured.slug}`} className="block w-full active:scale-[0.99] transition-transform">
                        <div
                            className="relative w-full overflow-hidden group cursor-pointer transition-all duration-500"
                            style={{ height: 'var(--ranking-height)' }}
                        >
                            <div className="absolute inset-0 bg-gray-900">
                                <Image
                                    src={imageBgUrl}
                                    alt="Background top rank"
                                    fill
                                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            </div>

                            <div className="relative h-full flex flex-col md:flex-row items-center md:items-end p-6 md:p-8 gap-6 md:gap-8">
                                <div
                                    className="relative flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lime-400/20 herobanner-card-3d"
                                    style={{
                                        width: 'var(--ranking-thumbnail-width)',
                                        height: 'var(--ranking-thumbnail-height)'
                                    }}
                                >
                                    <Image
                                        src={featured.imageUrl}
                                        alt={featured.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => { e.currentTarget.src = '/placeholder-story.jpg'; }}
                                    />
                                    <div className="absolute top-0 right-0 w-8 h-12 flex items-center justify-center top-1-ranking-banner shadow-lg">
                                        <span className="top-ranking-banner-text text-xl">1</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-end md:pb-4 space-y-4 md:space-y-6">
                                    <h2 className="top-ranking-title line-clamp-2 drop-shadow-lg text-white">
                                        🔥 {featured.name}
                                    </h2>
                                    {featured.views !== undefined && featured.views > 0 && (
                                        <div className="flex items-center gap-2">
                                            <EyeIcon width={20} height={20} className="flex-shrink-0" />
                                            <span className="text-lg md:text-xl text-lime-400 font-medium drop-shadow">
                                                {featured.views.toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <Image
                                            src="/read_now.svg"
                                            alt="Đọc ngay"
                                            width={isMobile ? 120 : 130}
                                            height={isMobile ? 45 : 48}
                                            className="cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Top Stories List */}
                <div
                    className="top-ranking-stories-list rounded-2xl flex flex-col p-2 md:p-4 overflow-hidden shadow-xl"
                    style={{ flexBasis: isMobile ? '100%' : 'var(--ranking-list-width)' }}
                >
                    <div className={`${isMobile ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'flex flex-col space-y-1'}`}>
                        {rest.map((story, index) => (
                            <MangaItem
                                key={story.slug || index}
                                number={index + 2}
                                title={story.name}
                                image={story.imageUrl}
                                slug={story.slug}
                                views={story.views}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopRankings;
