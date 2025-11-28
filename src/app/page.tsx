'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { MusicControlBar } from '@/components/music-control-bar';
import { YourMusic } from '@/components/your-music';
import { DashboardStats } from '@/components/dashboard-stats';
import type { Playlist, Song } from '@/lib/types';
import { UploadMusicDialog } from '@/components/upload-music-dialog';
import { db } from '@/lib/db';
import defaultSongsData from '@/lib/default-songs.json';
import { YourPlaylists } from '@/components/your-playlists';

export default function Home() {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [currentSong, setCurrentSong] = React.useState<Song | null>(null);
  const [activePlaylist, setActivePlaylist] = React.useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isRepeat, setIsRepeat] = React.useState(false);
  const [timeListenedInSeconds, setTimeListenedInSeconds] = React.useState(0);
  const [isDbLoading, setIsDbLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        await db.open();
        const defaultSongs: Song[] = defaultSongsData.defaultSongs;
        const dbSongs = await db.songs.toArray();
        const songsWithUrls = dbSongs.map(s => ({
          ...s,
          fileUrl: URL.createObjectURL(s.file)
        }));

        const combinedSongs = [...defaultSongs, ...songsWithUrls];
        const uniqueSongs = Array.from(new Map(combinedSongs.map(s => [s.title + s.artist, s])).values());
        
        setSongs(uniqueSongs);

        const dbPlaylists = await db.playlists.toArray();
        setPlaylists(dbPlaylists);

        if (uniqueSongs.length > 0 && !currentSong) {
          setCurrentSong(uniqueSongs[0]);
        }

      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsDbLoading(false);
      }
    }
    loadData();

    return () => {
      songs.forEach(song => {
        if (song.file) { 
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

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
    setPlaylists(prev => prev.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
  };
  
  const handlePlaylistDeleted = (playlistId: number) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const handleSongsAdded = (newSongs: Song[]) => {
    setSongs(prevSongs => {
      const allSongs = [...prevSongs, ...newSongs];
      const uniqueSongsMap = new Map(allSongs.map(s => [s.title + s.artist, s]));
      const uniqueSongs = Array.from(uniqueSongsMap.values());
      
      if (!currentSong && uniqueSongs.length > 0) {
        setCurrentSong(uniqueSongs[0]);
      }
      return uniqueSongs;
    });
  };
  
  const handlePlaySong = (song: Song, playlist: Playlist | null = null) => {
    if (currentSong?.id === song.id && currentSong?.fileUrl === song.fileUrl) {
        handlePlayPause();
    } else {
        setCurrentSong(song);
        setIsPlaying(true);
        setActivePlaylist(playlist);
    }
  };
  
  const handlePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (direction: 'forward' | 'backward') => {
    const songPool = activePlaylist 
      ? activePlaylist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[] 
      : songs;
      
    if (songPool.length === 0) return;

    const currentIndex = songPool.findIndex(s => s.id === currentSong?.id && s.fileUrl === currentSong?.fileUrl);
    
    let nextIndex;
    if (currentIndex === -1) {
        nextIndex = 0;
    } else if (direction === 'forward') {
        nextIndex = (currentIndex + 1) % songPool.length;
    } else {
        nextIndex = (currentIndex - 1 + songPool.length) % songPool.length;
    }
    
    setCurrentSong(songPool[nextIndex]);
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
          <YourMusic songs={songs} onPlaySong={handlePlaySong} isLoading={isDbLoading} />
          <YourPlaylists
            playlists={playlists}
            songs={songs}
            onPlaySong={handlePlaySong}
            onPlaylistCreated={handlePlaylistCreated}
            onPlaylistUpdated={handlePlaylistUpdated}
            onPlaylistDeleted={handlePlaylistDeleted}
            isLoading={isDbLoading}
          />
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
