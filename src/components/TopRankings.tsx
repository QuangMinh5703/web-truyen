'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Image from "next/image";
import { useViewTracking } from '@/lib/hooks/useViewTracking';
import { StoryStats } from '@/lib/view-tracking';
import { useResponsive } from '@/lib/hooks/useMediaQuery';

interface MangaItemProps {
    number: number;
    title: string;
    image: string;
    slug?: string;
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

const MangaItem = ({ number, title, image, slug, views }: MangaItemProps) => {
    return (
        <Link href={`/truyen/${slug || ''}`} className="flex-shrink-0 w-full sm:w-auto md:w-full">
            <div className="flex gap-3 md:gap-4 p-2 md:p-3 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
                {/* Thumbnail with badge */}
                <div className="relative flex-shrink-0 hover:scale-105 transition-transform">
                    <Image
                        src={image}
                        alt={title}
                        width={80}
                        height={96}
                        className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-lg shadow-md"
                    />
                    <div
                        className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center top-ranking-banner rounded-full scale-75 md:scale-100"
                    >
                        <span className="top-ranking-banner-text text-xs md:text-sm">{number}</span>
                    </div>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="story-list-name truncate text-sm md:text-base font-medium text-white group-hover:text-lime-400">
                        {title}
                    </h3>
                    {views !== undefined && <p className="text-xs md:text-sm text-gray-500 mt-1">👁️ {views.toLocaleString('vi-VN')}</p>}
                </div>
            </div>
        </Link>
    );
};

const TopRankings = () => {
    const [topStories, setTopStories] = useState<(Story | StoryStats)[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
    const { getHotStories } = useViewTracking();
    const { isMobile, isDesktop } = useResponsive();

    useEffect(() => {
        const shuffledBackground = shuffleArray(localBackground);
        setBackgroundImages(shuffledBackground);
    }, []);

    useEffect(() => {
        const fetchTopStories = async () => {
            try {
                setLoading(true);
                const hotStories = getHotStories('month', 10);
                const stories = await Promise.all(hotStories.map(async (story) => {
                    if ('storySlug' in story && !('cover' in story)) {
                        const storyDetails = await otruyenApi.getStoryBySlug(story.storySlug);
                        return { ...story, ...storyDetails };
                    }
                    return story;
                }));
                setTopStories(stories);
            } catch (error) {
                console.error('Error fetching top stories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopStories();
    }, [getHotStories]);

    if (loading) {
        return (
            <section className="mb-8 md:mb-12">
                <div className="w-full h-[var(--ranking-height)] rounded-2xl bg-gray-900 animate-pulse" />
            </section>
        );
    }

    if (!topStories || topStories.length === 0) return null;

    const movie = topStories[0];
    const otherTopStories = topStories.slice(1, 6); // Lấy 5 truyện tiếp theo

    const movieName = ('name' in movie ? movie.name : ('storyTitle' in movie ? movie.storyTitle : null)) || 'Truyện tranh';
    const movieSlug = ('slug' in movie ? movie.slug : ('storySlug' in movie ? movie.storySlug : null)) || '';
    const imageBgUrl = backgroundImages[0] || localBackground[0];

    let imageUrl = getImageUrl(('cover' in movie && movie.cover) || ('thumbnail' in movie && movie.thumbnail) || ('thumb_url' in movie && movie.thumb_url) || '');

    return (
        <section className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="title-main">
                    Bảng xếp hạng
                </h2>
                <Link href={`/xep-hang`} className="hover:scale-105 transition-transform active:scale-95">
                    <Image
                        src="/view_more.svg"
                        alt="View more"
                        width={isMobile ? 90 : 116}
                        height={isMobile ? 40 : 52}
                        className="cursor-pointer"
                    />
                </Link>
            </div>

            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 md:gap-4`}>
                {/* Left Side - Featured Story */}
                <div
                    className="overflow-hidden rounded-2xl relative"
                    style={{ flexBasis: isMobile ? '100%' : 'var(--ranking-featured-width)' }}
                >
                    <Link href={`/truyen/${movieSlug}`} className="block w-full">
                        <div
                            className="relative w-full overflow-hidden group cursor-pointer transition-all duration-500"
                            style={{ height: 'var(--ranking-height)' }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 bg-gray-900">
                                <Image
                                    src={imageBgUrl}
                                    alt="Background top rank"
                                    fill
                                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            </div>

                            {/* Content Container */}
                            <div className="relative h-full flex flex-col md:flex-row items-center md:items-end p-6 md:p-8 gap-6 md:gap-8">
                                {/* Story Thumbnail */}
                                <div
                                    className="relative flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:-translate-y-2 herobanner-card-3d"
                                    style={{
                                        width: 'var(--ranking-thumbnail-width)',
                                        height: 'var(--ranking-thumbnail-height)'
                                    }}>
                                    <Image
                                        src={imageUrl}
                                        alt={movieName}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 right-0 w-8 h-12 flex items-center justify-center top-1-ranking-banner shadow-lg">
                                        <span className="top-ranking-banner-text text-xl">1</span>
                                    </div>
                                </div>

                                {/* Right Side Content */}
                                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-end md:pb-4 space-y-4 md:space-y-6">
                                    <h2 className="top-ranking-title line-clamp-2 drop-shadow-lg text-white">
                                        🔥 {movieName}
                                    </h2>
                                    {'totalViews' in movie && (
                                        <p className="text-lg md:text-xl text-lime-400 font-medium drop-shadow">
                                            👁️ {movie.totalViews.toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                    <div className="pt-2">
                                        <Image
                                            src="/read_now.svg"
                                            alt="Read now"
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

                {/* Right Side - Top Stories List */}
                <div
                    className="top-ranking-stories-list rounded-2xl flex flex-col p-2 md:p-4 overflow-hidden"
                    style={{ flexBasis: isMobile ? '100%' : 'var(--ranking-list-width)' }}
                >
                    <div className={`${isMobile ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'flex flex-col space-y-1'}`}>
                        {otherTopStories.map((story, index) => {
                            const storyName = ('name' in story ? story.name : ('storyTitle' in story ? story.storyTitle : null)) || 'Truyện tranh';
                            const storySlug = ('slug' in story ? story.slug : ('storySlug' in story ? story.storySlug : null)) || '';
                            let storyImage = getImageUrl(('cover' in story && story.cover) || ('thumbnail' in story && story.thumbnail) || ('thumb_url' in story && story.thumb_url) || '');
                            const views = 'totalViews' in story ? story.totalViews : undefined;

                            return (
                                <MangaItem
                                    key={('id' in story && story.id) || index}
                                    number={index + 2}
                                    title={storyName}
                                    image={storyImage}
                                    slug={storySlug}
                                    views={views}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopRankings;