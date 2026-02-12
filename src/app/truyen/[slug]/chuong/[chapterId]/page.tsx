import type { Metadata } from 'next';
import { fetchStoryMetadata, getServerImageUrl, truncateDescription } from '@/lib/api-server';
import ChapterPageClient from '@/components/ChapterPageClient';

interface ChapterPageProps {
  params: Promise<{ slug: string; chapterId: string }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug, chapterId } = await params;
  const story = await fetchStoryMetadata(slug);

  // Extract chapter number from chapterId (e.g., "chuong-15" → "15")
  const chapterNum = chapterId.split('-').pop() || chapterId;

  if (!story) {
    return {
      title: `Chương ${chapterNum} - M-Truyện`,
      description: 'Đọc truyện online miễn phí tại M-Truyện.',
    };
  }

  const title = `${story.name} Chương ${chapterNum} - M-Truyện`;
  const description = `Đọc ${story.name} Chương ${chapterNum} online miễn phí tại M-Truyện. ${truncateDescription(story.description, 100)}`;
  const imageUrl = getServerImageUrl(story.thumb_url || story.cover || story.thumbnail);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/truyen/${slug}/chuong/${chapterId}`,
      images: imageUrl ? [{ url: imageUrl, width: 400, height: 600, alt: `${story.name} Chương ${chapterNum}` }] : [],
      siteName: 'M-Truyện',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ChapterPage() {
  return <ChapterPageClient />;
}
