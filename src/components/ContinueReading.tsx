// src/components/ContinueReading.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReadingHistory } from '@/lib/hooks/useReadingHistory';
import { otruyenApi, getImageUrl } from '@/lib/api';
import type { Story } from '@/lib/types';
import { BookPlus } from 'lucide-react';

export const ContinueReading = () => {
    const { history, loading: historyLoading } = useReadingHistory();
    const [storyDetails, setStoryDetails] = useState<Story | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const lastRead = history?.[0];

    useEffect(() => {
        if (lastRead && !storyDetails) {
            const fetchStoryDetails = async () => {
                setIsLoadingDetails(true);
                try {
                    const details = await otruyenApi.getStoryDetails(lastRead.storySlug);
                    setStoryDetails(details);
                } catch (error) {
                    console.error("Failed to fetch story details for Continue Reading:", error);
                } finally {
                    setIsLoadingDetails(false);
                }
            };
            fetchStoryDetails();
        }
    }, [lastRead, storyDetails]);

    if (historyLoading) {
        // Render a skeleton loader while fetching history
        return (
            <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="flex gap-4">
                    <div className="w-24 h-36 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-2.5 bg-gray-300 dark:bg-gray-700 rounded-full w-full mt-2"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    // If no history or still loading details, render nothing
    if (!lastRead || isLoadingDetails || !storyDetails) {
        return null;
    }

    const coverImage = getImageUrl(storyDetails.thumb_url);
    const chapterNumber = lastRead.lastReadChapterId.split('-').pop();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookPlus className="text-blue-500" />
                Continue Reading
            </h2>
            <Link 
                href={`/truyen/${lastRead.storySlug}/chuong/${lastRead.lastReadChapterId}`}
                className="flex gap-4 group"
            >
                <div className="flex-shrink-0 w-24">
                    <div className="aspect-[3/4] relative rounded-md overflow-hidden">
                        <Image 
                            src={coverImage}
                            alt={storyDetails.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="100px"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {storyDetails.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        You were at Chapter {chapterNumber}
                    </p>
                    <div className="mt-3">
                        <span className="text-xs font-semibold">{lastRead.progress.toFixed(0)}% complete</span>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${lastRead.progress.toFixed(2)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};
