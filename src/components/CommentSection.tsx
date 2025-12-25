// src/components/CommentSection.tsx

'use client';

import { useState } from 'react';
import { useComments } from '@/lib/hooks/useComments';
import { Comment } from '@/lib/api-comments';

interface CommentSectionProps {
  chapterId: string;
}

const CommentSection = ({ chapterId }: CommentSectionProps) => {
  const { comments, loading, error, addComment } = useComments(chapterId);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setSubmitError('Tên và bình luận không được để trống.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await addComment({ name, message });
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
    return `${date.toLocaleDateString('vi-VN')} lúc ${date.toLocaleTimeString('vi-VN')}`;
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Bình luận</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên của bạn"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Bình luận
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Viết bình luận của bạn..."
            disabled={isSubmitting}
          ></textarea>
        </div>
        {submitError && <p className="text-red-600 text-sm mb-2">{submitError}</p>}
        <div className="text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && <p>Đang tải bình luận...</p>}
        {error && <p className="text-red-600">Lỗi: {error.message}</p>}
        {!loading && !error && comments.length === 0 && (
          <p className="text-gray-600">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
        {!loading && !error &&
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-1">
                <p className="font-bold text-gray-800">{comment.name}</p>
                <span className="text-xs text-gray-500 ml-2">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700">{comment.message}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CommentSection;
