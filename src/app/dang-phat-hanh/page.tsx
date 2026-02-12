'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import StoryGrid from '@/components/StoryGrid';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { otruyenApi, Story } from '@/lib/api';

export default function DangPhatHanhPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const listResponse = await otruyenApi.getStoriesByType('dang-phat-hanh', { page: currentPage, limit: 20 });

        if (listResponse) {
          setStories(listResponse.items.slice(0, 20));
          setTotalPages(listResponse.pagination.totalPages);
        } else {
          throw new Error('Không thể tải danh sách truyện.');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="title-main mb-8">Truyện Đang Phát Hành</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg aspect-[2/3] mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
        </main>
        <FooterComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main mb-8">Truyện Đang Phát Hành</h1>
        <StoryGrid stories={stories} />

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm
                         disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-95"
            >
              ← Trước
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                      currentPage === pageNum
                        ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="w-10 h-10 flex items-center justify-center text-gray-500 font-bold">…</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                      currentPage === totalPages
                        ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm
                         disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-95"
            >
              Sau →
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="text-center mt-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
            Trang {currentPage} / {totalPages}
          </div>
        )}
      </main>

      <FooterComponent />
    </div>
  );
}
