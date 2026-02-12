'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReadingHistory } from '@/lib/hooks/useReadingHistory';
import { otruyenApi, getImageUrl, Story } from '@/lib/api';
import { BookOpen } from 'lucide-react';

export const ContinueReading = () => {
    const { history, loading: historyLoading } = useReadingHistory();
    const [storyDetails, setStoryDetails] = useState<Story | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [imageError, setImageError] = useState(false);

    const lastRead = history?.[0];

    useEffect(() => {
        if (lastRead && !storyDetails) {
            const fetchStoryDetails = async () => {
                setIsLoadingDetails(true);
                try {
                    const details = await otruyenApi.getStoryBySlug(lastRead.storySlug);
                    if (details) setStoryDetails(details);
                } catch {
                    // Silently fail — component will not render
                } finally {
                    setIsLoadingDetails(false);
                }
            };
            fetchStoryDetails();
        }
    }, [lastRead, storyDetails]);

    if (historyLoading) {
        return (
            <div className="animate-pulse bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-5"></div>
                <div className="flex gap-4">
                    <div className="w-20 h-28 bg-white/10 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-5 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        <div className="h-2 bg-white/10 rounded-full w-full mt-3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!lastRead || isLoadingDetails || !storyDetails) {
        return null;
    }

    const coverImage = getImageUrl(storyDetails.thumb_url || storyDetails.thumbnail || storyDetails.cover || '');
    const chapterNumber = lastRead.lastReadChapterId.split('-').pop();
    const progressPercent = Math.min(lastRead.progress, 100);

    return (
        <section className="mb-10 md:mb-14">
            <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/5 backdrop-blur-sm
                            hover:border-lime-400/20 transition-all duration-300 group/card">
                <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2.5"
                    style={{ fontFamily: 'var(--font-lexend-exa)' }}>
                    <BookOpen className="w-5 h-5 text-lime-400 flex-shrink-0" />
                    <span className="text-gradient">Đọc tiếp</span>
                </h2>

                <Link
                    href={`/truyen/${lastRead.storySlug}/chuong/${lastRead.lastReadChapterId}`}
                    className="flex gap-4 group"
                >
                    {/* Cover thumbnail */}
                    <div className="flex-shrink-0 w-20 md:w-24">
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-lg
                                        group-hover:shadow-lime-400/20 transition-all duration-300">
                            {!imageError ? (
                                <Image
                                    src={coverImage}
                                    alt={storyDetails.name || 'Bìa truyện'}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="100px"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-2xl">📖</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm md:text-base font-bold line-clamp-2 text-white
                                       group-hover:text-lime-400 transition-colors"
                            style={{ fontFamily: 'var(--font-lexend-exa)' }}>
                            {storyDetails.name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1.5"
                           style={{ fontFamily: 'var(--font-lexend-exa)' }}>
                            Đang đọc Chương {chapterNumber}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Tiến độ
                                </span>
                                <span className="text-[10px] font-bold text-lime-400">
                                    {progressPercent.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progressPercent}%`,
                                        background: 'linear-gradient(to right, #A8E300, #EAF6C6)',
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
};
