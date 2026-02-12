import type { Metadata } from 'next';
import { fetchStoryMetadata, getServerImageUrl, truncateDescription } from '@/lib/api-server';
import StoryDetailClient from '@/components/StoryDetailClient';

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await fetchStoryMetadata(slug);

  if (!story) {
    return {
      title: 'Không tìm thấy truyện - M-Truyện',
      description: 'Truyện bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }

  const title = `${story.name} - M-Truyện`;
  const description = truncateDescription(story.description);
  const imageUrl = getServerImageUrl(story.thumb_url || story.cover || story.thumbnail);
  const categories = story.category?.map(c => c.name).join(', ') || '';

  return {
    title,
    description,
    keywords: [story.name, ...(story.author || []), categories, 'truyện tranh', 'manga', 'manhwa', 'đọc truyện online'].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/truyen/${slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 400, height: 600, alt: `Bìa truyện ${story.name}` }] : [],
      siteName: 'M-Truyện',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `/truyen/${slug}`,
    },
  };
}

export default function StoryPage() {
  return <StoryDetailClient />;
}
