// src/lib/hooks/useComments.ts

import { useState, useEffect, useCallback } from 'react';
import { getComments, postComment, Comment } from '../api-comments';

// ✅ CHANGED: Interface mới
interface UseCommentsResult {
  comments: Comment[];
  commentCount: number;
  loading: boolean;
  error: Error | null;
  addComment: (comment: { name: string; message: string }) => Promise<void>;
  refreshComments: () => Promise<void>;
}

// ✅ CHANGED: Parameter từ chapterId → storySlug
export const useComments = (storySlug: string): UseCommentsResult => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!storySlug || !storySlug.trim()) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedComments = await getComments(storySlug);
      setComments(fetchedComments);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [storySlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (comment: { name: string; message: string }) => {
      if (!storySlug || !storySlug.trim()) {
        throw new Error('Invalid storySlug');
      }

      if (!comment.name.trim() || !comment.message.trim()) {
        throw new Error('Name and message are required');
      }

      try {
        const newComment = await postComment(storySlug, comment);
        setComments(prevComments => [newComment, ...prevComments]);
      } catch (err: any) {
        console.error('Failed to post comment:', err);
        throw err;
      }
    },
    [storySlug]
  );

  const refreshComments = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  return { 
    comments, 
    commentCount: comments.length,
    loading, 
    error, 
    addComment,
    refreshComments,
  };
};
