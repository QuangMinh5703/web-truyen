'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { otruyenApi, Story, Chapter, getImageUrl } from '@/lib/api';
import Image from "next/image";
import ErrorDisplay from './ui/ErrorDisplay';

interface RecentUpdate {
    story: Story;
    latestChapter?: Chapter;
}

const RecentUpdates = () => {
    const [updates, setUpdates] = useState<RecentUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRecentUpdates = async () => {
            try {
                setLoading(true);
                console.log('[RecentUpdates] Fetching latest stories...');
                const listResponse = await otruyenApi.getLatestStories({
                    page: 1,
                    limit: 12, // Tăng số lượng để có nhiều item hơn khi scroll
                });

                console.log('[RecentUpdates] Response received:', listResponse);

                if (listResponse && listResponse.items) {
                    const updatesWithChapters = listResponse.items.map((story: Story) => {
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
                setError('Không thể tải các truyện cập nhật mới nhất.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentUpdates();
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Tốc độ kéo
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    if (error) {
        return (
            <ErrorDisplay
                message={error}
                onRetry={() => window.location.reload()}
            />
        );
    }

    if (loading) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <span className="text-3xl">🆕</span>
                        <span>Cập nhật mới nhất</span>
                    </h2>
                </div>

                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(33.33%-16px)] lg:w-[calc(20%-19.2px)] animate-pulse">
                            <div className="bg-gray-800 rounded-xl h-64 mb-4"></div>
                            <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="title-main">
                    Mới cập nhật
                </h2>
                <Link href={`/hoan-thanh`} className="hover:scale-105 transition-transform active:scale-95">
                    <Image
                        src="/view_more.svg"
                        alt="View more"
                        width={116}
                        height={52}
                        className="cursor-pointer"
                    />
                </Link>
            </div>

            {updates.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-12 text-center text-gray-400">
                    Không có cập nhật mới
                </div>
            ) : (
                <div className="relative">
                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={`flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide  px-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            userSelect: isDragging ? 'none' : 'auto',
                        }}
                    >
                        {updates.map((update) => {
                            const storyId = update.story._id || update.story.id || '';
                            const storySlug = update.story.slug || storyId;
                            const storyTitle = update.story.name || update.story.title || 'Comic';
                            const imageUrl = getImageUrl(update.story.cover || update.story.thumbnail || update.story.thumb_url || '');

                            return (
                                <Link
                                    key={storyId}
                                    href={`/truyen/${storySlug}`}
                                    className="group block flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(33.33%-16px)] lg:w-[calc(20%-19.2px)] snap-start"
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    <div className="relative overflow-hidden rounded-xl mb-3 md:mb-4 aspect-[2/3] shadow-lg group-hover:shadow-lime-400/20 transition-all duration-300">
                                        <Image
                                            src={imageUrl}
                                            alt={storyTitle}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-story.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <h3 className="mb-1 recent-update-title line-clamp-2 group-hover:text-lime-400 transition-colors">
                                        {storyTitle}
                                    </h3>
                                    <p className="recent-update-sup-title line-clamp-1 opacity-70">
                                        {update.story.category && Array.isArray(update.story.category) && update.story.category.length > 0
                                            ? update.story.category.map(category => category.name).slice(0, 2).join(' | ')
                                            : 'Truyện tranh'
                                        }
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default RecentUpdates;