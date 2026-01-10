// src/lib/hooks/useReadingHistory.ts
import { useState, useEffect } from 'react';
import { getAllReadingProgress } from '@/lib/api-sync';
import { ReadingProgress, ApiError } from '@/lib/types';

export interface HistoryStory {
    storySlug: string;
    storyTitle: string; // Using slug as title for now, can be enriched later
    lastRead: number;
    lastReadChapterId: string;
    progress: number;
    // coverImage: string; // To be added later
}

export const useReadingHistory = () => {
    const [history, setHistory] = useState<HistoryStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        const fetchAndProcessHistory = async () => {
            try {
                setLoading(true);
                const allProgress = await getAllReadingProgress();
                
                // Group progress by storySlug
                const progressByStory: Record<string, ReadingProgress[]> = {};
                for (const chapterId in allProgress) {
                    const progress = allProgress[chapterId];
                    if (progress.storySlug) {
                        if (!progressByStory[progress.storySlug]) {
                            progressByStory[progress.storySlug] = [];
                        }
                        progressByStory[progress.storySlug].push(progress);
                    }
                }

                // Find the latest progress for each story
                const processedHistory: HistoryStory[] = [];
                for (const storySlug in progressByStory) {
                    const chapters = progressByStory[storySlug];
                    if (chapters.length > 0) {
                        // Find the chapter with the most recent lastRead timestamp
                        const latestChapterProgress = chapters.reduce((latest, current) => {
                            return current.lastRead > latest.lastRead ? current : latest;
                        });

                        processedHistory.push({
                            storySlug: storySlug,
                            storyTitle: storySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Simple slug-to-title
                            lastRead: latestChapterProgress.lastRead,
                            lastReadChapterId: latestChapterProgress.chapterId,
                            progress: latestChapterProgress.progress,
                        });
                    }
                }
                
                // Sort stories by most recently read
                processedHistory.sort((a, b) => b.lastRead - a.lastRead);
                
                setHistory(processedHistory);

            } catch (err) {
                console.error("Failed to fetch reading history:", err);
                setError({ message: 'Could not load reading history.' });
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessHistory();
    }, []);

    return { history, loading, error };
};
