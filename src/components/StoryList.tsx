'use client';

import Link from 'next/link';
import Image from 'next/image';
import StoryGrid from './StoryGrid';

/**
 * @interface StoryListProps
 * @description Props for the StoryList component.
 */
interface StoryListProps {
  /**
   * @property {string} title - The title to display for the list section.
   */
  title: string;
  /**
   * @property {'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh'} [type='truyen-moi']
   * - The type of stories to fetch.
   */
  type?: 'truyen-moi' | 'sap-ra-mat' | 'dang-phat-hanh' | 'hoan-thanh';
  /**
   * @property {number} [limit=20] - The maximum number of stories to fetch.
   */
  limit?: number;
}

/**
 * A component that fetches and displays a grid of stories with a standardized header.
 * Utilizes StoryGrid for the responsive grid layout.
 *
 * @param {StoryListProps} props - The component props.
 * @returns {JSX.Element} A section containing a list of stories.
 */
const StoryList = ({ title, type = 'hoan-thanh', limit = 10 }: StoryListProps) => {
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="title-main">
          {title}
        </h2>
        <Link href={`/${type}`} className="flex items-center justify-center min-w-[90px] min-h-[44px] hover:scale-105 transition-transform active:scale-95">
          <Image
            src="/view_more.svg"
            alt="View more"
            width={116}
            height={44}
            className="cursor-pointer"
          />
        </Link>
      </div>

      <StoryGrid type={type} limit={limit} />
    </section>
  );
};

export default StoryList;