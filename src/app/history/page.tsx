'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import { useReadingHistory } from '@/lib/hooks/useReadingHistory';
import { History, BookOpen, AlertCircle } from 'lucide-react';

const timeSince = (date: number): string => {
  const seconds = Math.floor((Date.now() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' năm trước';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' tháng trước';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' ngày trước';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' giờ trước';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' phút trước';
  return 'Vừa xong';
};

export default function HistoryPage() {
  const { history, loading, error } = useReadingHistory();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main mb-8">Lịch sử đọc</h1>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-lime-400/30 h-1.5 rounded-full" style={{ width: `${30 + i * 15}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Lỗi tải lịch sử</h3>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <History className="mx-auto h-16 w-16 text-gray-600 mb-6" />
            <h3 className="text-xl font-bold mb-3">Chưa có lịch sử đọc</h3>
            <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: 'var(--font-lexend-exa)' }}>
              Các chương truyện bạn đọc sẽ xuất hiện tại đây.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3.5 bg-lime-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-lime-400 transition-all shadow-lg shadow-lime-500/20 active:scale-95"
            >
              KHÁM PHÁ TRUYỆN
            </Link>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-3">
            {history.map(item => {
              const chapterNum = item.lastReadChapterId.split('-').pop();
              const progressPercent = Math.min(item.progress, 100);

              return (
                <Link
                  key={item.storySlug}
                  href={`/truyen/${item.storySlug}/chuong/${item.lastReadChapterId}`}
                  className="block bg-white/5 p-5 rounded-2xl border border-white/5
                             hover:border-lime-400/20 transition-all duration-300 group active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm md:text-base font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-1"
                        style={{ fontFamily: 'var(--font-lexend-exa)' }}>
                      {item.storyTitle}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex-shrink-0 ml-4">
                      {timeSince(item.lastRead)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-lexend-exa)' }}>
                      Đang đọc Chương {chapterNum}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(to right, #A8E300, #EAF6C6)',
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-lime-400 flex-shrink-0">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <FooterComponent />
    </div>
  );
}
