'use client';

import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { otruyenApi, Story, Chapter, getImageUrl } from '@/lib/api';
import Image from "next/image";

interface RecentUpdate {
    story: Story;
    latestChapter?: Chapter;
}

const RecentUpdates = () => {
    const [updates, setUpdates] = useState<RecentUpdate[]>([]);
    const [loading, setLoading] = useState(true);
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

    if (loading) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <span className="text-3xl">🆕</span>
                        <span>Cập nhật mới nhất</span>
                    </h2>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex-shrink-0 w-[calc(50%-12px)] animate-pulse">
                            <div className="bg-gray-800 rounded-lg h-64 mb-4"></div>
                            <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-2">
                <h2 className="title-main space-x-2">
                    Mới cập nhật
                </h2>
                <Link href={`/hoan-thanh`} passHref>
                    <Image
                        src="/view_more.svg"
                        alt=""
                        onClick={() => {}}
                        width={116}
                        height={52}
                        className="text-lime-400 cursor-pointer"
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
                                    className="group block flex-shrink-0 w-[calc(50%-12px)] lg:w-[calc(20%-19.2px)] snap-start mr-[3px]"
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    <div className="relative overflow-hidden rounded-lg mb-4 aspect-[2/3]">
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
                                        {update.story.category && Array.isArray(update.story.category) && update.story.category.length > 0
                                            ? update.story.category.map(category => category.name).slice(0, 3).join(' | ')
                                            : 'Thể loại đang được cập nhật.'
                                        }
                                    </h2>
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