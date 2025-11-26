'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { MusicControlBar } from '@/components/music-control-bar';
import { YourMusic } from '@/components/your-music';
import { DashboardStats } from '@/components/dashboard-stats';
import type { Song, Playlist } from '@/lib/types';
import { UploadMusicDialog } from '@/components/upload-music-dialog';
import { db } from '@/lib/db';
import defaultSongsData from '@/lib/default-songs.json';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [currentSong, setCurrentSong] = React.useState<Song | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = React.useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isRepeat, setIsRepeat] = React.useState(false);
  const [timeListenedInSeconds, setTimeListenedInSeconds] = React.useState(0);
  const [isDbLoading, setIsDbLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadData() {
      try {
        // Load default songs from JSON
        const defaultSongs: Song[] = defaultSongsData.defaultSongs;

        // Load user-uploaded songs from IndexedDB
        const dbSongs = await db.songs.toArray();
        const songsWithUrls = dbSongs.map(s => ({
          ...s,
          fileUrl: URL.createObjectURL(s.file)
        }));

        const combinedSongs = [...defaultSongs, ...songsWithUrls];
        const uniqueSongs = Array.from(new Map(combinedSongs.map(s => [s.title + s.artist, s])).values());
        
        setSongs(uniqueSongs);

        // Load playlists from local storage
        const savedPlaylists = localStorage.getItem('harmonica-playlists');
        if (savedPlaylists) {
            const parsedPlaylists: Playlist[] = JSON.parse(savedPlaylists);
            // Re-hydrate song objects from the main songs list
            const hydratedPlaylists = parsedPlaylists.map(p => ({
                ...p,
                songs: p.songs.map(ps => uniqueSongs.find(s => (s.id && s.id === ps.id) || s.fileUrl === ps.fileUrl)).filter((s): s is Song => !!s)
            }));
            setPlaylists(hydratedPlaylists);
        }

      } catch (e) {
        console.error("Failed to load songs or playlists", e);
      } finally {
        setIsDbLoading(false);
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    // Save playlists to local storage whenever they change
    localStorage.setItem('harmonica-playlists', JSON.stringify(playlists));
  }, [playlists]);


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
        if (song.file) {
          URL.revokeObjectURL(song.fileUrl);
        }
      });
    };
  }, [songs]);

  const handleSongsAdded = (newSongs: Song[]) => {
    setSongs(prevSongs => {
      const allSongs = [...prevSongs, ...newSongs];
      const uniqueSongs = Array.from(new Map(allSongs.map(s => [s.title + s.artist, s])).values());
      if (!currentSong && uniqueSongs.length > 0) {
        setCurrentSong(uniqueSongs[0]);
      }
      return uniqueSongs;
    });
  };
  
  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists(prev => [...prev, newPlaylist]);
  };
  
  const handlePlaylistsChange = (updatedPlaylists: Playlist[]) => {
    setPlaylists(updatedPlaylists);
  };


  const handleAddToPlaylist = (playlistName: string, song: Song) => {
    setPlaylists(prevPlaylists => {
      return prevPlaylists.map(p => {
        if (p.name === playlistName) {
          if (p.songs.some(s => (s.id && s.id === song.id) || s.fileUrl === song.fileUrl)) {
             toast({
              variant: 'destructive',
              title: 'Already in playlist',
              description: `"${song.title}" is already in "${playlistName}".`,
            });
            return p;
          }
          toast({
            title: 'Song Added',
            description: `"${song.title}" has been added to "${playlistName}".`,
          });
          return { ...p, songs: [...p.songs, song] };
        }
        return p;
      });
    });
  };

  const handlePlaySong = (song: Song, playlist?: Playlist) => {
    if (playlist) {
      setCurrentPlaylist(playlist);
    } else {
      setCurrentPlaylist(null);
    }

    if ((currentSong?.id && currentSong.id === song.id) || currentSong?.fileUrl === song.fileUrl) {
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
    const songList = currentPlaylist ? currentPlaylist.songs : songs;
    if (!currentSong || songList.length === 0) return;

    const currentIndex = songList.findIndex(s => (s.id && s.id === currentSong.id) || (s.fileUrl === currentSong.fileUrl));
    if (currentIndex === -1) {
        if (songList.length > 0) setCurrentSong(songList[0]);
        return;
    };

    let nextIndex;
    if (direction === 'forward') {
        nextIndex = (currentIndex + 1) % songList.length;
    } else {
        nextIndex = (currentIndex - 1 + songList.length) % songList.length;
    }
    setCurrentSong(songList[nextIndex]);
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
            playlists={playlists} 
            onPlaylistCreated={handlePlaylistCreated} 
            onPlaylistsChange={handlePlaylistsChange}
            songs={songs}
            timeListenedInSeconds={timeListenedInSeconds} 
            currentSong={currentSong}
            onPlaySong={handlePlaySong}
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
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
      />
    </div>
  );
}
