import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import PopularGenres from '@/components/PopularGenres';
import StoryList from '@/components/StoryList';
import RecentUpdates from '@/components/RecentUpdates';
import TopRankings from '@/components/TopRankings';
import FooterComponent from '@/components/FooterComponent';
import { ContinueReading } from '@/components/ContinueReading';

export default function HomePage() {
  return (
    <div className="min-h-screen --background">
      <Navbar />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroBanner />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <TopRankings />
              <RecentUpdates />
              <StoryList />
              <PopularGenres/>
          </div>
      </main>

      <FooterComponent />
    </div>
  );
}
