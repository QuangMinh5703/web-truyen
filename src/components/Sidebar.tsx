import Link from 'next/link';
import { TrendingUp, Clock, Star } from 'lucide-react';

// Helper function để tạo slug từ title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻêềếệểễ]/g, 'e')
    .replace(/[ìíịỉê]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

interface TrendingStory {
  id: number;
  title: string;
  chapter: string;
  views: string;
  trend: string;
}

const trendingStories: TrendingStory[] = [
  { id: 1, title: 'One Piece', chapter: 'Chapter 1098', views: '2.5M', trend: '+125K' },
  { id: 2, title: 'Solo Leveling', chapter: 'Chapter 179', views: '3.2M', trend: '+98K' },
  { id: 3, title: 'Jujutsu Kaisen', chapter: 'Chapter 245', views: '1.9M', trend: '+87K' },
  { id: 4, title: 'My Hero Academia', chapter: 'Chapter 405', views: '2.1M', trend: '+76K' },
  { id: 5, title: 'Demon Slayer', chapter: 'Chapter 205', views: '2.7M', trend: '+65K' },
];

interface RecentStory {
  id: number;
  title: string;
  chapter: string;
  timeAgo: string;
}

const recentStories: RecentStory[] = [
  { id: 1, title: 'Chainsaw Man', chapter: 'Chapter 148', timeAgo: '5 phút trước' },
  { id: 2, title: 'Spy x Family', chapter: 'Chapter 92', timeAgo: '15 phút trước' },
  { id: 3, title: 'Tokyo Revengers', chapter: 'Chapter 278', timeAgo: '30 phút trước' },
  { id: 4, title: 'Blue Lock', chapter: 'Chapter 245', timeAgo: '1 giờ trước' },
  { id: 5, title: 'One Punch Man', chapter: 'Chapter 195', timeAgo: '2 giờ trước' },
];

export default function Sidebar() {
  return (
    <aside className="space-y-6">
      {/* Trending Stories */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Truyện Hot Nhất
          </h2>
        </div>
        <div className="space-y-3">
          {trendingStories.map((story, index) => (
            <Link
              key={story.id}
              href={`/truyen/${createSlug(story.title)}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-sm font-bold text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {story.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{story.chapter}</span>
                  <span>•</span>
                  <span className="text-red-500">{story.trend}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Updates */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Cập Nhật Gần Đây
          </h2>
        </div>
        <div className="space-y-3">
          {recentStories.map((story) => (
            <Link
              key={story.id}
              href={`/truyen/${createSlug(story.title)}`}
              className="block rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{story.chapter}</span>
                <span>•</span>
                <span>{story.timeAgo}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Rated */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Đánh Giá Cao
          </h2>
        </div>
        <div className="space-y-3">
          {trendingStories.map((story) => (
            <Link
              key={story.id}
              href={`/truyen/${createSlug(story.title)}`}
              className="block rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-600 dark:text-gray-400">4.9/5</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">{story.views} lượt xem</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
