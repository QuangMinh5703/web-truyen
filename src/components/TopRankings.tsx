'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Image from "next/image";
import { useViewTracking } from '@/lib/hooks/useViewTracking';
import { StoryStats } from '@/lib/view-tracking';

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
        <Link href={`/truyen/${slug || ''}`}>
            <div className="flex gap-4 p-3 mb-[5px]  cursor-pointer ">
                {/* Thumbnail with badge */}
                <div className="relative flex-shrink-0 hover:scale-105">
                    <Image
                        src={image}
                        alt={title}
                        width={103}
                        height={103}
                        className="w-20 h-24 object-cover rounded-lg "
                    />
                    <div
                        className="absolute -top-0 -right-[-8px] w-5 h-5  flex items-center justify-center top-ranking-banner"
                    >
                        <span className="top-ranking-banner-text">{number}</span>
                    </div>
                </div>

                {/* Title */}
                <div className="flex-1">
                    <h3 className="story-list-name">
                        {title}
                    </h3>
                    {views !== undefined && <p className="text-sm text-gray-500">👁️ {views}</p>}
                </div>
            </div>
        </Link>
    );
};

const TopRankings = () => {
    const [topStories, setTopStories] = useState<(Story | StoryStats)[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
    const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week');
    const { getHotStories } = useViewTracking();

    useEffect(() => {
        const shuffledBackground = shuffleArray(localBackground);
        setBackgroundImages(shuffledBackground);
    }, []);

    useEffect(() => {
        const fetchTopStories = async () => {
            try {
                setLoading(true);
                let stories: (Story | StoryStats)[] = [];
                if (dataSource === 'local') {
                    const hotStories = getHotStories(period, 10);
                    // Since StoryStats might not have image URLs, we might need to fetch them
                    // For now, we will assume that the slug is enough to navigate
                    // and we will try to get the image from the API if it's not present
                    stories = await Promise.all(hotStories.map(async (story) => {
                        if ('storySlug' in story && !('cover' in story)) {
                            const storyDetails = await otruyenApi.getStoryBySlug(story.storySlug);
                            return { ...story, ...storyDetails };
                        }
                        return story;
                    }));
                } else {
                    const apiStories = await otruyenApi.getHomeStories({ page: 1, limit: 10 });
                    if (apiStories) {
                        stories = apiStories.items;
                    }
                }
                setTopStories(stories);
            } catch (error) {
                console.error('Error fetching top stories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopStories();
    }, [dataSource, period, getHotStories]);

    if (loading) {
        return (
            <section className="mb-12">
                <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-800 animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-xl">Đang tải...</div>
                    </div>
                </div>
            </section>
        );
    }

    if (!topStories || topStories.length === 0) {
        return (
            <section className="mb-12">
                 <div className="flex items-center justify-between mb-2">
                    <h2 className="title-main space-x-2">
                        Bảng xếp hạng
                    </h2>
                </div>
                <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Không có dữ liệu xếp hạng để hiển thị.</p>
                </div>
            </section>
        );
    }

    const movie = topStories[0];
    const otherTopStories = topStories.slice(1, 5); // Lấy 4 truyện tiếp theo

    const movieName = ('name' in movie ? movie.name : movie.storyTitle) || 'Truyện tranh';
    const movieSlug = ('slug' in movie ? movie.slug : movie.storySlug) || '';

    const index = Math.floor(Math.random() * backgroundImages.length);
    const imageBgUrl = backgroundImages[index % backgroundImages.length] || backgroundImages[0];


    let imageUrl = getImageUrl(('cover' in movie && movie.cover) || ('thumbnail' in movie && movie.thumbnail) || ('thumb_url' in movie && movie.thumb_url) || '');

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-2">
                <h2 className="title-main space-x-2">
                    Bảng xếp hạng
                </h2>
                 <div className="flex gap-2 mb-4">
                    <button onClick={() => setDataSource('local')} className={`px-3 py-1 rounded-full text-sm ${dataSource === 'local' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Dữ liệu thực</button>
                    <button onClick={() => setDataSource('api')} className={`px-3 py-1 rounded-full text-sm ${dataSource === 'api' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Dữ liệu API</button>
                </div>
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setPeriod('day')} className={`px-3 py-1 rounded-full text-sm ${period === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Hôm nay</button>
                    <button onClick={() => setPeriod('week')} className={`px-3 py-1 rounded-full text-sm ${period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Tuần này</button>
                    <button onClick={() => setPeriod('month')} className={`px-3 py-1 rounded-full text-sm ${period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Tháng này</button>
                    <button onClick={() => setPeriod('all')} className={`px-3 py-1 rounded-full text-sm ${period === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Tất cả</button>
                </div>
                <Link href={`/xep-hang`} passHref>
                    <Image
                        src="/view_more.svg"
                        alt="View more"
                        onClick={() => {}}
                        width={116}
                        height={52}
                        className="text-lime-400 cursor-pointer"
                    />
                </Link>
            </div>

            <div className="flex flex-row gap-4">
                {/* Left Side - Featured Story */}
                <div className="basis-3/4 rounded-2xl overflow-hidden">
                    <Link href={`/truyen/${movieSlug}`} className="block w-full">
                        <div className="relative w-full  overflow-hidden group cursor-pointer h-[547px]">
                            {/* Background Image with Gradient Overlay */}
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900/50 to-blue-800/30">
                                <Image
                                    src={imageBgUrl}
                                    alt="Background top rank"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Content Container */}
                            <div className="relative h-full flex items-end px-8 gap-8 pb-8">
                                {/* Story Thumbnail Image */}
                                <div
                                    className="relative flex-shrink-0  bg-gray-800 rounded-lg overflow-hidden shadow-2xl transform "
                                    style={{
                                        width: '330px',
                                        height: '400px'
                                    }}>
                                    <Image
                                        src={imageUrl}
                                        alt="Story thumbnail"
                                        width={330}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        className="absolute -top-0 -right-[-12px] w-[30px] h-12  flex items-center justify-center top-1-ranking-banner"
                                    >
                                        <span className="top-ranking-banner-text">1</span>
                                    </div>
                                </div>

                                {/* Right Side Content */}
                                <div className="flex-1 flex flex-col justify-center space-y-6">
                                    {/* Read Now Button */}
                                    <Image
                                        src="/read_now.svg"
                                        alt="Read now"
                                        width={116}
                                        height={52}
                                        className="text-lime-400 cursor-pointer"
                                    />

                                    {/* Story Title */}
                                    <h2 className="top-ranking-title line-clamp-2">
                                        🔥 {movieName}
                                    </h2>
                                    {'totalViews' in movie && <p className="text-lg text-white">👁️ {movie.totalViews}</p>}
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Side - Top Stories List */}
                <div className="basis-1/4 flex items-center justify-center top-ranking-stories-list rounded-2xl">
                    <div className="space-y-3 ">
                        {otherTopStories.map((story, index) => {
                            const storyName = 'name' in story ? story.name : story.storyTitle || 'Truyện tranh';
                            const storySlug = 'slug' in story ? story.slug : story.storySlug || '';
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