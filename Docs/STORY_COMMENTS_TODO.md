# 📋 TODO List - Hệ Thống Bình Luận Theo Truyện

## 📊 Phân tích hiện trạng

### ✅ Hệ thống hiện tại:
- ✓ `CommentSection.tsx` - Component bình luận (hiện tại dùng `chapterId`)
- ✓ `api-comments.ts` - API mock để quản lý comments (lưu theo `chapterId`)
- ✓ `useComments.ts` - Hook để fetch/post comments (nhận `chapterId`)
- ✓ Comment section chỉ xuất hiện ở trang đọc chương (`/truyen/[slug]/chuong/[chapterId]/page.tsx`)
- ✓ Trang chi tiết truyện (`/truyen/[slug]/page.tsx`) KHÔNG có comment section

### ❌ Vấn đề cần giải quyết:
- Bình luận hiện tại gắn với `chapterId` (từng chương), không phải `storySlug`
- Người dùng bình luận ở chương 1 sẽ không thấy ở chương 2
- Không có bình luận chung cho toàn bộ truyện
- Trang chi tiết truyện không có nơi để bình luận

### 🎯 Mục tiêu:
1. **Bình luận theo truyện**: Mỗi truyện có một khu vực bình luận riêng
2. **Hiển thị ở trang chi tiết**: Thêm CommentSection vào trang `/truyen/[slug]`
3. **Xóa bình luận ở trang chương**: Tập trung tất cả comments vào trang truyện
4. **Tách biệt dữ liệu**: Bình luận truyện A không hiển thị ở truyện B

---

## 🏗️ Kiến trúc mới - Option 1: Chỉ có bình luận theo truyện

```
Truyện A (slug: "one-piece")
  └── Bình luận cho truyện A (storySlug: "one-piece")
      ├── Comment 1: "Truyện hay quá!"
      ├── Comment 2: "Hóng chương mới"
      └── Comment 3: "10/10"

Truyện B (slug: "naruto")
  └── Bình luận cho truyện B (storySlug: "naruto")
      ├── Comment 1: "Cảm động"
      └── Comment 2: "Nhớ thuở ấu thơ"
```

**Ưu điểm:**
- ✅ Đơn giản, dễ implement
- ✅ Tập trung comments vào một nơi duy nhất
- ✅ Tránh duplicate và confusion
- ✅ Performance tốt hơn
- ✅ Dễ quản lý và moderate

---

## 🚀 Implementation Plan

### Bước 1: Refactor API Layer
### Bước 2: Update Hook Layer
### Bước 3: Update Component Layer
### Bước 4: Integrate vào Story Page
### Bước 5: Remove từ Chapter Page
### Bước 6: Testing & Polish

---

## 📝 BƯỚC 1: Refactor `api-comments.ts`

**File:** `src/lib/api-comments.ts`

**Nhiệm vụ:** Thay đổi từ `chapterId` → `storySlug`

### Code hoàn chỉnh:

```typescript
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
  console.log(`Fetching comments for story: ${storySlug}`);
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
  console.log(`Posting comment for story: ${storySlug}`);
  
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
```

### Checklist Bước 1:
- [x] ✅ Thay đổi interface `Comment`
- [x] ✅ Đổi tên Map từ `commentsByChapter` → `commentsByStory`
- [x] ✅ Update `getComments()` nhận `storySlug`
- [x] ✅ Update `postComment()` nhận `storySlug`
- [x] ✅ Thêm `saveToStorage()` và `loadFromStorage()`
- [x] ✅ Update mock data
- [x] ✅ Thêm helper functions
- [x] ✅ Test với nhiều slug khác nhau

**Estimate:** 1-2 giờ

---

## 📝 BƯỚC 2: Update `useComments.ts` Hook

**File:** `src/lib/hooks/useComments.ts`

**Nhiệm vụ:** Thay đổi hook để dùng `storySlug`

### Code hoàn chỉnh:

```typescript
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
```

### Checklist Bước 2:
- [x] ✅ Đổi parameter `chapterId` → `storySlug`
- [x] ✅ Update dependencies trong hooks
- [x] ✅ Thêm `commentCount` vào return
- [x] ✅ Thêm `refreshComments` function
- [x] ✅ Validation cho storySlug
- [x] ✅ Error handling
- [x] ✅ Test với storySlug valid/invalid

**Estimate:** 30 phút - 1 giờ

---

## 📝 BƯỚC 3: Update `CommentSection.tsx` Component

**File:** `src/components/CommentSection.tsx`

**Nhiệm vụ:** Thay đổi props và UI

### Code hoàn chỉnh:

```typescript
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
```

### Checklist Bước 3:
- [x] ✅ Update props interface
- [x] ✅ Update UI với storyTitle
- [x] ✅ Thêm comment count badge
- [x] ✅ Cải thiện validation
- [x] ✅ Character limit 1000
- [x] ✅ Better UI states
- [x] ✅ Relative time format
- [x] ✅ Avatar circles
- [x] ✅ Responsive design

**Estimate:** 1-2 giờ

---

## 📝 BƯỚC 4: Integrate vào Story Detail Page

**File:** `src/app/truyen/[slug]/page.tsx`

**Nhiệm vụ:** Thêm CommentSection vào trang truyện

### Các thay đổi cần làm:

**1. Import dynamic và useInView:**
```typescript
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
```

**2. Dynamic import CommentSection:**
```typescript
const DynamicCommentSection = dynamic(() => import('@/components/CommentSection'), {
  loading: () => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-gray-600">Đang tải bình luận...</p>
    </div>
  ),
  ssr: false,
});
```

**3. Setup intersection observer:**
```typescript
const { ref: commentsRef, inView: commentsInView } = useInView({
  triggerOnce: true,
  rootMargin: '200px 0px',
});
```

**4. Thêm vào JSX (sau Chapters List):**
```typescript
{/* Chapters List */}
{allChapters.length > 0 && (
  <div className="mb-8">
    {/* ... existing chapters code ... */}
  </div>
)}

{/* ✅ Comments Section */}
<div className="mt-12" id="comments" ref={commentsRef}>
  {commentsInView && story && (
    <DynamicCommentSection 
      storySlug={slug} 
      storyTitle={story.name}
    />
  )}
</div>
```

### Checklist Bước 4:
- [x] ✅ Import dependencies
- [x] ✅ Dynamic import CommentSection
- [x] ✅ Setup lazy loading
- [x] ✅ Add to JSX layout
- [x] ✅ Test comments load
- [x] ✅ Test submit works
- [x] ✅ Test responsive

**Estimate:** 1 giờ

---

## 📝 BƯỚC 5: Remove Comment từ Chapter Page

**File:** `src/app/truyen/[slug]/chuong/[chapterId]/page.tsx`

**Nhiệm vụ:** Xóa CommentSection và thêm link đến trang truyện

### Các thay đổi:

**1. Xóa imports:**
```typescript
// ❌ XÓA
const DynamicCommentSection = dynamic(() => import('@/components/CommentSection'), {
  loading: () => <div className="text-center py-8">Đang tải bình luận...</div>,
  ssr: false,
});
```

**2. Xóa intersection observer:**
```typescript
// ❌ XÓA
const { ref: commentsRef, inView: commentsInView } = useInView({
  triggerOnce: true,
  rootMargin: '200px 0px',
});
```

**3. Xóa Comments Section:**
```typescript
// ❌ XÓA
{/* <div ref={commentsRef}>
  {commentsInView && <DynamicCommentSection chapterId={chapterId} />}
</div> */}
```

**4. Thêm link đến trang truyện (optional):**
```typescript
{/* Link to story comments */}
<div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
  <div className="text-center">
    <p className="text-gray-700 font-medium mb-3">
      💬 Muốn chia sẻ suy nghĩ về truyện này?
    </p>
    <Link 
      href={`/truyen/${slug}#comments`}
      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-200"
    >
      Đến trang truyện để bình luận →
    </Link>
  </div>
</div>
```

### Checklist Bước 5:
- [x] ✅ Xóa DynamicCommentSection import
- [x] ✅ Xóa useInView
- [x] ✅ Xóa comments section JSX
- [x] ✅ Thêm link đến story page (optional)
- [x] ✅ Test trang chapter vẫn hoạt động

**Estimate:** 30 phút

---

## 🧪 BƯỚC 6: Testing & Polish

### Testing Checklist:

**API Layer (`api-comments.ts`):**
- [ ] ✅ Test `getComments` với slug hợp lệ
- [ ] ✅ Test `getComments` với slug không tồn tại
- [ ] ✅ Test `postComment` thành công
- [ ] ✅ Test `postComment` với data invalid
- [ ] ✅ Test localStorage save/load
- [ ] ✅ Test với nhiều stories khác nhau

**Hook Layer (`useComments.ts`):**
- [ ] ✅ Test hook với storySlug valid
- [ ] ✅ Test hook với storySlug undefined
- [ ] ✅ Test addComment function
- [ ] ✅ Test error states
- [ ] ✅ Test loading states

**Component Layer (`CommentSection.tsx`):**
- [ ] ✅ Test render với props valid
- [ ] ✅ Test form submission
- [ ] ✅ Test validation errors
- [ ] ✅ Test empty state
- [ ] ✅ Test loading state
- [ ] ✅ Test error state
- [ ] ✅ Test responsive design

**Integration:**
- [ ] ✅ Test ở trang story detail
- [ ] ✅ Test comments của story A không hiện ở story B
- [ ] ✅ Test lazy loading
- [ ] ✅ Test sau refresh page
- [ ] ✅ Test với multiple stories

**Estimate:** 2-3 giờ

---

## 📊 Success Metrics

Sau khi hoàn thành, bạn sẽ có:

✅ Hệ thống bình luận theo truyện (không phải theo chương)  
✅ Comments hiển thị ở trang chi tiết truyện  
✅ Mỗi truyện có bình luận riêng biệt  
✅ Data được lưu vào localStorage  
✅ UI/UX đẹp và responsive  
✅ Lazy loading để tối ưu performance  
✅ Form validation đầy đủ  
✅ Empty/Loading/Error states  

---

## 🚦 Status Tracking

| Bước | Task | Status | Time |
|------|------|--------|------|
| 1 | Refactor `api-comments.ts` | ✅ Done | 1-2h |
| 2 | Update `useComments.ts` | ✅ Done | 30m-1h |
| 3 | Update `CommentSection.tsx` | ✅ Done | 1-2h |
| 4 | Integrate vào Story Page | ✅ Done | 1h |
| 5 | Remove từ Chapter Page | ✅ Done | 30m |
| 6 | Testing & Polish | 🚧 In Progress | 2-3h |

**Total: 6-9.5