'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';
import Image from "next/image";

interface MangaItemProps {
    number: number;
    title: string;
    image: string;
    slug?: string;
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

const MangaItem = ({ number, title, image, slug }: MangaItemProps) => {
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
                </div>
            </div>
        </Link>
    );
};

const TopRankings = () => {
    const [movieTop, setMovieTop] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]);

    useEffect(() => {
        const shuffledBackground = shuffleArray(localBackground);
        setBackgroundImages(shuffledBackground);
    }, []);

    useEffect(() => {

        const fetchmovieTop = async () => {
            try {
                setLoading(true);
                const stories = await otruyenApi.getHomeStories({ page: 1, limit: 10 });

                if (stories) {
                    setMovieTop(stories.items);
                } else {
                    console.warn('[TopRankings] No stories found in response');
                }
            } catch (error) {
                console.error('Error fetching top stories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchmovieTop();
    }, []);

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

    if (!movieTop || movieTop.length === 0) {
        return null;
    }

    const movie = movieTop[0];
    const topStories = movieTop.slice(1, 5); // Lấy 4 truyện tiếp theo

    const movieName = movie.name || movie.title || 'Truyện tranh';
    const movieSlug = movie.slug || '';

    const index = Math.floor(Math.random() * backgroundImages.length);
    const imageBgUrl = backgroundImages[index % backgroundImages.length] || backgroundImages[0];


    let imageUrl = getImageUrl(movie.cover || movie.thumbnail || movie.thumb_url || '');

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-2">
                <h2 className="title-main space-x-2">
                    Bảng xếp hạng
                </h2>
                <Image
                    src="/view_more.svg"
                    alt="View more"
                    onClick={() => {}}
                    width={116}
                    height={52}
                    className="text-lime-400 cursor-pointer"
                />
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
                                        {movieName}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Side - Top Stories List */}
                <div className="basis-1/4 flex items-center justify-center top-ranking-stories-list rounded-2xl">
                    <div className="space-y-3 ">
                        {topStories.map((story, index) => {
                            const storyName = story.name || story.title || 'Truyện tranh';
                            const storySlug = story.slug || '';
                            let storyImage = getImageUrl(story.cover || story.thumbnail || story.thumb_url || '');

                            return (
                                <MangaItem
                                    key={story.id || index}
                                    number={index + 2}
                                    title={storyName}
                                    image={storyImage}
                                    slug={storySlug}
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