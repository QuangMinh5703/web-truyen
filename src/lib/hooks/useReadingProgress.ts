import { useState, useEffect } from 'react';

export const useReadingProgress = (chapterId: string, chapter: any) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const savedPage = localStorage.getItem(`reading-progress-${chapterId}`);
        if(savedPage) {
            setCurrentPage(parseInt(savedPage, 10));
        } else {
            setCurrentPage(0);
        }
    }, [chapterId]);

    useEffect(() => {
        if (chapter && chapter.images) {
            localStorage.setItem(`reading-progress-${chapterId}`, String(currentPage));
            const calculatedProgress = ((currentPage + 1) / chapter.images.length) * 100;
            setProgress(calculatedProgress);
        }
    }, [currentPage, chapter, chapterId]);

    const nextPage = () => {
        if (chapter && chapter.images && currentPage < chapter.images.length - 1) {
          setCurrentPage(currentPage + 1);
          return true;
        }
        return false;
      };
    
      const prevPage = () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
      };
    
      const goToPage = (pageIndex: number) => {
        if (chapter && chapter.images && pageIndex >= 0 && pageIndex < chapter.images.length) {
          setCurrentPage(pageIndex);
        }
      };

      return { currentPage, progress, nextPage, prevPage, goToPage, setCurrentPage };
}
