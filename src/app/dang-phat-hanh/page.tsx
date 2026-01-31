'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import StoryGrid from '@/components/StoryGrid';
import { otruyenApi, Story, getImageUrl } from '@/lib/api';

export default function DangPhatHanhPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-[var(--main-content-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="title-main mb-8">Truyện Đang Phát Hành</h1>
          <p className="--text-while">Đang tải truyện...</p>
        </main>
        <FooterComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen --background">
        <Navbar />
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="title-main mb-8">Truyện Đang Phát Hành</h1>
          <p className="--text-while">Lỗi khi tải truyện: {error}</p>
        </main>
        <FooterComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen --background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main mb-8">Truyện Đang Phát Hành</h1>
        <StoryGrid stories={stories} />

        {/* Pagination Controls */}
        <div className="pagination-container flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button px-3 py-2 rounded-md bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            ← Trước
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-button px-3 py-2 rounded-md ${currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-white">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`pagination-button px-3 py-2 rounded-md ${currentPage === totalPages
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
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
            className="pagination-button px-3 py-2 rounded-md bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Sau →
          </button>
        </div>

        <div className="text-center mt-4 text-gray-400">
          Trang {currentPage} / {totalPages}
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}