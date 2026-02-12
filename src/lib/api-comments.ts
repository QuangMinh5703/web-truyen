// src/lib/api-comments.ts

// ✅ CHANGED: Interface với storySlug
export interface Comment {
  id: string;
  storySlug: string;      // CHANGED: từ chapterId
  storyTitle?: string;    // NEW: thêm title
  name: string;
  message: string;
  createdAt: string;
}

// ✅ CHANGED: Đổi tên Map
const commentsByStory = new Map<string, Comment[]>();

// Storage keys
const STORAGE_KEY = 'mtruyen-story-comments';
const STORAGE_VERSION = '1.0';

// ✅ NEW: Mock data với storySlug
const initialComments: Comment[] = [
  {
    id: '1',
    storySlug: 'demo-story',
    storyTitle: 'Demo Story',
    name: 'Độc giả 1',
    message: 'Truyện này hay quá!',
    createdAt: new Date('2025-01-15T10:00:00Z').toISOString(),
  },
];

commentsByStory.set('demo-story', initialComments);

// Storage functions
const saveToStorage = () => {
  try {
    const data = {
      version: STORAGE_VERSION,
      comments: Array.from(commentsByStory.entries()),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save comments:', error);
  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data = JSON.parse(stored);
    if (data.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const entries = data.comments as [string, Comment[]][];
    entries.forEach(([slug, comments]) => {
      commentsByStory.set(slug, comments);
    });
  } catch (error) {
    console.error('Failed to load comments:', error);
  }
};

loadFromStorage();

// ✅ CHANGED: getComments nhận storySlug
export const getComments = async (storySlug: string): Promise<Comment[]> => {

  await new Promise(resolve => setTimeout(resolve, 300));

  const comments = commentsByStory.get(storySlug) || [];
  return [...comments].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// ✅ CHANGED: postComment nhận storySlug
export const postComment = async (
  storySlug: string,
  comment: { name: string; message: string; storyTitle?: string }
): Promise<Comment> => {
  // console.log(`Posting comment for story: ${storySlug}`);

  if (!storySlug || !comment.name.trim() || !comment.message.trim()) {
    throw new Error('Invalid comment data');
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  const existingComments = commentsByStory.get(storySlug) || [];
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newComment: Comment = {
    id: newId,
    storySlug,
    storyTitle: comment.storyTitle,
    name: comment.name.trim(),
    message: comment.message.trim(),
    createdAt: new Date().toISOString(),
  };

  commentsByStory.set(storySlug, [...existingComments, newComment]);
  saveToStorage();

  return newComment;
};

// ✅ NEW: Helper functions
export const getCommentCount = async (storySlug: string): Promise<number> => {
  const comments = commentsByStory.get(storySlug) || [];
  return comments.length;
};

export const deleteComment = async (
  storySlug: string,
  commentId: string
): Promise<boolean> => {
  const comments = commentsByStory.get(storySlug);
  if (!comments) return false;

  const filtered = comments.filter(c => c.id !== commentId);
  if (filtered.length === comments.length) return false;

  commentsByStory.set(storySlug, filtered);
  saveToStorage();
  return true;
};

export const clearStoryComments = async (storySlug: string): Promise<void> => {
  commentsByStory.delete(storySlug);
  saveToStorage();
};

export const getAllStoriesWithComments = (): string[] => {
  return Array.from(commentsByStory.keys());
};
