// src/components/CommentSection.tsx

'use client';

import { useState } from 'react';
import { useComments } from '@/lib/hooks/useComments';

// ✅ CHANGED: Props interface
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
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            💬 Bình luận
            {storyTitle && (
              <span className="text-base font-normal text-gray-500">
                - {storyTitle}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Chia sẻ suy nghĩ của bạn về truyện này
          </p>
        </div>
        {commentCount > 0 && (
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
            {commentCount} bình luận
          </div>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Tên của bạn <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            placeholder="Nhập tên của bạn"
            disabled={isSubmitting}
            maxLength={50}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Bình luận <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-gray-900"
            rows={4}
            placeholder="Viết bình luận của bạn..."
            disabled={isSubmitting}
            maxLength={1000}
          ></textarea>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {message.length}/1000 ký tự
          </div>
        </div>
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ⚠️ {submitError}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting || !name.trim() || !message.trim()}
          >
            {isSubmitting ? 'Đang gửi...' : '📤 Gửi bình luận'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải bình luận...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">⚠️ Lỗi khi tải bình luận</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-gray-600 text-lg font-medium">Chưa có bình luận nào</p>
            <p className="text-gray-500 text-sm mt-2">
              Hãy là người đầu tiên chia sẻ suy nghĩ về truyện này!
            </p>
          </div>
        )}

        {!loading && !error && comments.map((comment) => (
          <div 
            key={comment.id} 
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">{comment.name}</p>
                  <p className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap break-words">
                  {comment.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && comments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Hiển thị {comments.length} bình luận
        </div>
      )}
    </div>
  );
};

export default CommentSection;
