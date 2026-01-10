// src/app/history/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingHistory } from '@/lib/hooks/useReadingHistory';
import { History, BookOpen, AlertCircle } from 'lucide-react';

// A simple utility to format time since a timestamp
const timeSince = (date: number): string => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const HistoryPage = () => {
    const { history, loading, error } = useReadingHistory();

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-pulse">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 text-red-500">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-lg font-medium">Error Loading History</h3>
                    <p className="mt-1 text-sm">{error.message}</p>
                </div>
            );
        }

        if (history.length === 0) {
            return (
                <div className="text-center py-16">
                    <History className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">No Reading History</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Chapters you read will appear here.
                    </p>
                    <Link href="/" className="mt-6 inline-block px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                        Find a story to read
                    </Link>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {history.map(item => (
                    <Link 
                        key={item.storySlug} 
                        href={`/truyen/${item.storySlug}/chuong/${item.lastReadChapterId}`}
                        className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-blue-500"
                    >
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-gray-800 dark:text-white">{item.storyTitle}</h3>
                             <span className="text-xs text-gray-500 dark:text-gray-400">{timeSince(item.lastRead)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Continue reading Chapter {item.lastReadChapterId.split('-').pop()}
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${item.progress.toFixed(2)}%` }}
                            ></div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Reading History</h1>
            {renderContent()}
        </div>
    );
};

export default HistoryPage;
