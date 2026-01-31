// src/app/bookmarks/share/[token]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSharedData } from '@/lib/api-bookmarks';
import { Bookmark, ApiError } from '@/lib/types';
import { Share2, Link as LinkIcon, BookOpen } from 'lucide-react';

interface SharedData {
    folderName: string;
    bookmarks: Bookmark[];
}

const SharedBookmarksPage = ({ params }: { params: { token: string } }) => {
    const { token } = params;
    const [sharedData, setSharedData] = useState<SharedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        if (token) {
            const fetchSharedData = async () => {
                try {
                    setLoading(true);
                    const data = await getSharedData(token);
                    if (data) {
                        setSharedData(data);
                    } else {
                        setError({ message: "This share link is invalid or has expired." });
                    }
                } catch (err) {
                    setError({ message: "Failed to load shared bookmarks." });
                } finally {
                    setLoading(false);
                }
            };
            fetchSharedData();
        }
    }, [token]);

    if (loading) {
        return <div className="text-center py-20">Loading shared bookmarks...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <LinkIcon className="mx-auto h-12 w-12 text-red-400" />
                <h2 className="mt-4 text-2xl font-bold text-red-500">Link Invalid</h2>
                <p className="mt-2 text-gray-500">{error.message}</p>
                <Link href="/bookmarks" className="mt-6 inline-block px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    Go to My Bookmarks
                </Link>
            </div>
        );
    }

    if (!sharedData) {
        return <div className="text-center py-20">No shared data found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <Share2 className="mx-auto h-12 w-12 text-gray-400" />
                <h1 className="mt-4 text-3xl font-bold">Shared Folder: "{sharedData.folderName}"</h1>
                <p className="mt-2 text-lg text-gray-500">
                    A collection of {sharedData.bookmarks.length} bookmarked chapters.
                </p>
            </div>

            {sharedData.bookmarks.length > 0 ? (
                <ul className="space-y-4 max-w-2xl mx-auto">
                    {sharedData.bookmarks.map(bookmark => (
                        <li key={bookmark.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">
                                    {bookmark.storySlug}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Chapter {bookmark.chapterId}
                                </p>
                            </div>
                            <Link
                                href={`/truyen/${bookmark.storySlug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                title={`Go to story ${bookmark.storySlug}`}
                            >
                                <BookOpen size={16} /> Read
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-1 text-sm text-gray-500">The folder &quot;{sharedData.folderName}&quot; has no bookmarks yet.</p>
            )}
        </div>
    );
};

export default SharedBookmarksPage;
