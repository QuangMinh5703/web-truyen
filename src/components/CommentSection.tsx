// src/components/CommentSection.tsx

'use client';

import { useState } from 'react';
import { useComments } from '@/lib/hooks/useComments';

interface CommentSectionProps {
  storySlug: string;
  storyTitle?: string;
}

const CommentSection = ({ storySlug, storyTitle }: CommentSectionProps) => {
  const { comments, commentCount, loading, error, addComment } = useComments(storySlug);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storySlug) {
      setSubmitError('Không xác định được truyện.');
      return;
    }

    if (!name.trim() || !message.trim()) {
      setSubmitError('Tên và bình luận không được để trống.');
      return;
    }

    if (name.trim().length < 2) {
      setSubmitError('Tên phải có ít nhất 2 ký tự.');
      return;
    }

    if (message.trim().length < 5) {
      setSubmitError('Bình luận phải có ít nhất 5 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addComment({ name: name.trim(), message: message.trim() });
      setName('');
      setMessage('');
    } catch (err) {
      setSubmitError('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return `${date.toLocaleDateString('vi-VN')} lúc ${date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  return (
    <div className="mt-12 p-6 md:p-8 bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Glow Effects */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-lime-400/20 rounded-full blur-[100px] pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h3 className="font-lexend-exa font-black text-xl md:text-2xl text-white uppercase tracking-wide flex items-center gap-3">
            <span className="w-1.5 h-8 bg-lime-400 rounded-full shadow-[0_0_15px_rgba(168,227,0,0.5)]"></span>
            Bình luận
          </h3>
          <p className="text-sm font-medium text-gray-400 mt-2 ml-4">
            Chia sẻ suy nghĩ của bạn về <span className="text-lime-400">{storyTitle || 'truyện này'}</span>
          </p>
        </div>

        {commentCount > 0 && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-3xl font-black text-white/10 leading-none">{commentCount}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">Comments</span>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="relative mb-10 bg-white/5 p-6 rounded-2xl border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="md:col-span-1">
            <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
              Tên hiển thị <span className="text-lime-400">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all font-medium"
                placeholder="Nhập tên..."
                disabled={isSubmitting}
                maxLength={50}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="message" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
              Nội dung <span className="text-lime-400">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="relative w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all font-medium resize-none min-h-[100px]"
                rows={3}
                placeholder="Bạn đang nghĩ gì về chap này?"
                disabled={isSubmitting}
                maxLength={1000}
              ></textarea>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-[10px] uppercase font-bold text-gray-600">{message.length}/1000</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            {submitError}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="group relative px-8 py-3 bg-lime-400 hover:bg-lime-300 text-black rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(168,227,0,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            disabled={isSubmitting || !name.trim() || !message.trim()}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
              {!isSubmitting && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 relative z-10">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-lime-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-lime-400 border-t-transparent animate-spin"></div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
            <p className="font-bold text-sm">⚠️ Không thể tải bình luận</p>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <div className="text-6xl mb-4 opacity-30 grayscale">💬</div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chưa có bình luận nào</p>
            <p className="text-gray-600 text-sm mt-2 font-medium">
              Hãy là người đầu tiên để lại bình luận!
            </p>
          </div>
        )}

        {!loading && !error && comments.map((comment) => (
          <div
            key={comment.id}
            className="group relative p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all hover:scale-[1.01] duration-300"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-full flex items-center justify-center text-black font-black text-lg shadow-lg flex-shrink-0 border-2 border-white/10 group-hover:border-lime-400/50 transition-colors">
                {comment.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                  <span className="font-bold text-white text-base truncate">{comment.name}</span>
                  <span className="hidden sm:inline w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words border-l-2 border-white/5 pl-3 mt-2 group-hover:border-lime-400/30 transition-colors">
                  {comment.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && comments.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Hết danh sách</span>
            <span className="w-1 h-1 bg-lime-400 rounded-full"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
