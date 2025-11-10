import { Header } from '@/components/header';
import { MusicControlBar } from '@/components/music-control-bar';
import { MusicGenreGrid } from '@/components/music-genre-grid';
import { DashboardStats } from '@/components/dashboard-stats';

export default function Home() {
  return (
    <div className="flex h-svh w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto space-y-8 px-4 py-8 md:px-6 lg:space-y-12 lg:py-12">
          <MusicGenreGrid />
          <DashboardStats />
        </div>
      </main>
      <MusicControlBar />
    </div>
  );
}
