'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { MusicControlBar } from '@/components/music-control-bar';
import { YourMusic } from '@/components/your-music';
import { DashboardStats } from '@/components/dashboard-stats';
import type { Song, Playlist } from '@/lib/types';
import { UploadMusicDialog } from '@/components/upload-music-dialog';

export default function Home() {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [currentSong, setCurrentSong] = React.useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [timeListenedInSeconds, setTimeListenedInSeconds] = React.useState(0);

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


  React.useEffect(() => {
    // Clean up object URLs to avoid memory leaks
    return () => {
      songs.forEach(song => {
        if (song.fileUrl) {
          URL.revokeObjectURL(song.fileUrl);
        }
      });
    };
  }, [songs]);

  const handleSongsAdded = (newSongs: Song[]) => {
    const allSongs = [...songs, ...newSongs];
    setSongs(allSongs);
    if (!currentSong && allSongs.length > 0) {
      setCurrentSong(allSongs[0]);
    }
  };
  
  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.fileUrl === song.fileUrl) {
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
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex(s => s.fileUrl === currentSong.fileUrl);
    if (currentIndex === -1) {
        if (songs.length > 0) setCurrentSong(songs[0]);
        return;
    };

    let nextIndex;
    if (direction === 'forward') {
        nextIndex = (currentIndex + 1) % songs.length;
    } else {
        nextIndex = (currentIndex - 1 + songs.length) % songs.length;
    }
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
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
          <YourMusic songs={songs} onPlaySong={handlePlaySong} onSongsAdded={handleSongsAdded} />
          <DashboardStats 
            playlists={playlists} 
            onPlaylistCreated={handlePlaylistCreated} 
            songs={songs}
            timeListenedInSeconds={timeListenedInSeconds} 
          />
        </div>
      </main>
      <MusicControlBar 
        song={currentSong} 
        isPlaying={isPlaying} 
        onPlayPause={handlePlayPause}
        onSkip={handleSkip}
      />
    </div>
  );
}
