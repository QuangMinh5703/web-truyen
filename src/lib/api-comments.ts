// src/lib/api-comments.ts

export interface Comment {
  id: string;
  chapterId: string;
  name: string;
  message: string;
  createdAt: string;
}

// In-memory store for comments
const commentsByChapter = new Map<string, Comment[]>();

// Mock initial data
const initialComments: Comment[] = [
  {
    id: '1',
    chapterId: '123',
    name: 'Độc giả 1',
    message: 'Chương này hay quá!',
    createdAt: new Date('2025-12-18T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    chapterId: '123',
    name: 'Fan Manhwa',
    message: 'Hóng chương mới!',
    createdAt: new Date('2025-12-18T11:30:00Z').toISOString(),
  },
    {
    id: '3',
    chapterId: '123',
    name: 'Tester',
    message: 'Test comment.',
    createdAt: new Date('2025-12-19T11:30:00Z').toISOString(),
  },
];

commentsByChapter.set('123', initialComments);

// Mock API functions
export const getComments = async (chapterId: string): Promise<Comment[]> => {
  console.log(`[Mock API] Fetching comments for chapter: ${chapterId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let comments = commentsByChapter.get(chapterId);

  // If no comments exist for this chapter, create some default ones for demonstration
  if (!comments || comments.length === 0) {
    const defaultComments: Comment[] = [
      {
        id: '1',
        chapterId: chapterId,
        name: 'Độc Giả Ẩn Danh',
        message: 'Chương này hay quá! Hóng chương tiếp theo từng ngày.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: '2',
        chapterId: chapterId,
        name: 'Fan Cứng',
        message: 'Art càng ngày càng lên tay, nội dung thì cuốn khỏi bàn. 10/10!',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
    ];
    commentsByChapter.set(chapterId, defaultComments);
    comments = defaultComments;
  }
  
  console.log(`[Mock API] Found ${comments.length} comments.`);
  return [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const postComment = async (
  chapterId: string,
  comment: { name: string; message: string }
): Promise<Comment> => {
  console.log(`[Mock API] Posting comment for chapter: ${chapterId}`, comment);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const existingComments = commentsByChapter.get(chapterId) || [];
  const newComment: Comment = {
    id: (existingComments.length + 1).toString(),
    chapterId,
    ...comment,
    createdAt: new Date().toISOString(),
  };

  commentsByChapter.set(chapterId, [...existingComments, newComment]);
  console.log(`[Mock API] Comment posted successfully.`);
  return newComment;
};
