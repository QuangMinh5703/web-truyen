// src/lib/hooks/useComments.ts

import { useState, useEffect, useCallback } from 'react';
import { getComments, postComment, Comment } from '../api-comments';

interface UseCommentsResult {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  addComment: (comment: { name: string; message: string }) => Promise<void>;
}

export const useComments = (chapterId: string): UseCommentsResult => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!chapterId) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedComments = await getComments(chapterId);
      setComments(fetchedComments);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (comment: { name: string; message: string }) => {
      if (!chapterId) return;

      try {
        const newComment = await postComment(chapterId, comment);
        setComments(prevComments => [newComment, ...prevComments]);
      } catch (err: any) {
        // Handle error (e.g., show a notification)
        console.error("Failed to post comment:", err);
        throw err;
      }
    },
    [chapterId]
  );

  return { comments, loading, error, addComment };
};
