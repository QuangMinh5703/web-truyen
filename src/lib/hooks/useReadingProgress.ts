import { useState, useEffect, useCallback, useRef } from 'react';
import { saveReadingProgress, getReadingProgress } from '@/lib/api-sync';
import { ReadingProgress, SyncStatus } from '@/lib/types';

export const useReadingProgress = (storySlug: string, chapterId: string, chapter: any) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Effect to fetch initial progress from local and "remote"
    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const fetchInitialProgress = async () => {
            setSyncStatus('syncing');
            const localProgressStr = localStorage.getItem(`reading-progress-${chapterId}`);
            const localProgress = localProgressStr ? JSON.parse(localProgressStr) as ReadingProgress : null;

            try {
                // Pass signal if the API supports it
                const remoteProgress = await getReadingProgress(chapterId);

                if (!isMounted || controller.signal.aborted) return;

                if (remoteProgress && (!localProgress || remoteProgress.lastRead > localProgress.lastRead)) {
                    // Remote is newer, use it
                    setCurrentPage(remoteProgress.currentPage);
                    localStorage.setItem(`reading-progress-${chapterId}`, JSON.stringify(remoteProgress));
                } else if (localProgress) {
                    // Local is newer or no remote, use local
                    setCurrentPage(localProgress.currentPage);
                }
                setSyncStatus('synced');
            } catch (error) {
                if (!isMounted || controller.signal.aborted) return;
                console.error("Failed to fetch remote progress:", error);
                setSyncStatus('error');
                // Fallback to local if remote fetch fails
                if (localProgress) {
                    setCurrentPage(localProgress.currentPage);
                }
            }
        };

        fetchInitialProgress();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [chapterId]);

    // Effect to save progress locally and trigger debounced remote save
    useEffect(() => {
        if (!chapter || !chapter.images || chapter.images.length === 0 || !storySlug) return;

        const totalPages = chapter.images.length;
        const calculatedProgress = ((currentPage + 1) / totalPages) * 100;
        setProgress(calculatedProgress);

        const progressData: ReadingProgress = {
            storySlug,
            chapterId,
            currentPage,
            totalPages,
            progress: calculatedProgress,
            lastRead: Date.now(),
        };

        // Save to local storage immediately
        localStorage.setItem(`reading-progress-${chapterId}`, JSON.stringify(progressData));

        // Debounce saving to remote
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        const controller = new AbortController();

        setSyncStatus('syncing');
        debounceTimeout.current = setTimeout(async () => {
            try {
                await saveReadingProgress(chapterId, progressData);
                if (!controller.signal.aborted) {
                    setSyncStatus('synced');
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Failed to save progress:", error);
                    setSyncStatus('error');
                }
            }
        }, 2000); // Debounce for 2 seconds

        // Cleanup function to clear timeout on unmount or when dependencies change
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
            controller.abort();
        };
    }, [currentPage, chapter, chapterId, storySlug]);

    const nextPage = useCallback(() => {
        if (chapter && chapter.images && currentPage < chapter.images.length - 1) {
            setCurrentPage(currentPage + 1);
            return true;
        }
        return false;
    }, [currentPage, chapter]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const goToPage = useCallback((pageIndex: number) => {
        if (chapter && chapter.images && pageIndex >= 0 && pageIndex < chapter.images.length) {
            setCurrentPage(pageIndex);
        }
    }, [chapter]);

    return {
        currentPage,
        progress,
        syncStatus,
        nextPage,
        prevPage,
        goToPage,
        setCurrentPage
    };
}
