'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { MusicControlBar } from '@/components/music-control-bar';
import { YourMusic } from '@/components/your-music';
import { DashboardStats } from '@/components/dashboard-stats';
import type { Song } from '@/lib/types';
import { UploadMusicDialog } from '@/components/upload-music-dialog';
import { db } from '@/lib/db';
import defaultSongsData from '@/lib/default-songs.json';

export default function Home() {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [currentSong, setCurrentSong] = React.useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isRepeat, setIsRepeat] = React.useState(false);
  const [timeListenedInSeconds, setTimeListenedInSeconds] = React.useState(0);
  const [isDbLoading, setIsDbLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const defaultSongs: Song[] = defaultSongsData.defaultSongs;
        const dbSongs = await db.songs.toArray();
        const songsWithUrls = dbSongs.map(s => ({
          ...s,
          fileUrl: URL.createObjectURL(s.file)
        }));

        const combinedSongs = [...defaultSongs, ...songsWithUrls];
        const uniqueSongs = Array.from(new Map(combinedSongs.map(s => [s.title + s.artist, s])).values());
        
        setSongs(uniqueSongs);
        if (uniqueSongs.length > 0 && !currentSong) {
          setCurrentSong(uniqueSongs[0]);
        }

      } catch (e) {
        console.error("Failed to load songs", e);
      } finally {
        setIsDbLoading(false);
      }
    }
    loadData();

    // This return function is for cleanup
    return () => {
      songs.forEach(song => {
        if (song.file) { // Only revoke URLs for blob-based songs
          URL.revokeObjectURL(song.fileUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeListenedInSeconds(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);


  const handleSongsAdded = (newSongs: Song[]) => {
    setSongs(prevSongs => {
      const allSongs = [...prevSongs, ...newSongs];
      // Create a map to ensure uniqueness based on a composite key.
      const uniqueSongsMap = new Map(allSongs.map(s => [s.title + s.artist, s]));
      const uniqueSongs = Array.from(uniqueSongsMap.values());
      
      // If no song is currently selected, set the first one from the new list.
      if (!currentSong && uniqueSongs.length > 0) {
        setCurrentSong(uniqueSongs[0]);
      }
      return uniqueSongs;
    });
  };
  
  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id && currentSong?.fileUrl === song.fileUrl) {
        handlePlayPause();
    } else {
        setCurrentSong(song);
        setIsPlaying(true);
    }
  };
  
  const handlePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (direction: 'forward' | 'backward') => {
    if (songs.length === 0) return;

    const currentIndex = songs.findIndex(s => s.id === currentSong?.id && s.fileUrl === currentSong?.fileUrl);
    
    let nextIndex;
    if (currentIndex === -1) {
        nextIndex = 0; // If current song not found, start from the beginning
    } else if (direction === 'forward') {
        nextIndex = (currentIndex + 1) % songs.length;
    } else {
        nextIndex = (currentIndex - 1 + songs.length) % songs.length;
    }
    
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };
  
  const handleToggleRepeat = () => {
    setIsRepeat(prev => !prev);
  };

  return (
    <div className="flex h-svh w-full flex-col bg-background text-foreground">
      <Header onUploadClick={() => setUploadDialogOpen(true)} />
      <UploadMusicDialog
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSongsAdded={handleSongsAdded}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto space-y-8 px-4 py-8 md:px-6 lg:space-y-12 lg:py-12">
          <YourMusic songs={songs} onPlaySong={handlePlaySong} onSongsAdded={handleSongsAdded} isLoading={isDbLoading} />
          <DashboardStats 
            songs={songs}
            timeListenedInSeconds={timeListenedInSeconds} 
            currentSong={currentSong}
          />
        </div>
      </main>
      <MusicControlBar 
        song={currentSong} 
        isPlaying={isPlaying} 
        isRepeat={isRepeat}
        onPlayPause={handlePlayPause}
        onSkip={handleSkip}
        onToggleRepeat={handleToggleRepeat}
      />
    </div>
  );
}
