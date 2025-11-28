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
import { SetNextMusicDialog } from '@/components/set-next-music-dialog';
import { LoginPage } from '@/components/login-page';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';

function HarmonicaApp({ onLogout }: { onLogout: () => void }) {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [isSetNextMusicDialogOpen, setSetNextMusicDialogOpen] = React.useState(false);
  const [currentSong, setCurrentSong] = React.useState<Song | null>(null);
  const [nextSong, setNextSong] = React.useState<Song | null>(null);
  const [activePlaylist, setActivePlaylist] = React.useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isRepeat, setIsRepeat] = React.useState(false);
  const [timeListenedInSeconds, setTimeListenedInSeconds] = React.useState(0);
  const [isDbLoading, setIsDbLoading] = React.useState(true);

  const firestore = useFirestore();
  const playlistsCollectionRef = useMemoFirebase(() => collection(firestore, 'playlists'), [firestore]);
  const { data: playlists, isLoading: isPlaylistsLoading } = useCollection<Playlist>(playlistsCollectionRef);

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

  const handlePlaylistCreated = (newPlaylist: Omit<Playlist, 'id'>) => {
    if (!playlistsCollectionRef) return;
    addDocumentNonBlocking(playlistsCollectionRef, newPlaylist);
  };

  const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
     if (!firestore || !updatedPlaylist.id) return;
     const playlistDocRef = doc(firestore, 'playlists', updatedPlaylist.id);
     const { id, ...playlistData } = updatedPlaylist;
     updateDocumentNonBlocking(playlistDocRef, playlistData);
  };
  
  const handlePlaylistDeleted = (playlistId: string) => {
    if (!firestore) return;
    const playlistDocRef = doc(firestore, 'playlists', playlistId);
    deleteDocumentNonBlocking(playlistDocRef);
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
        setNextSong(null); // Clear next song when a new song is explicitly played
    }
  };
  
  const handlePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const playNextSong = () => {
    if (nextSong) {
      setCurrentSong(nextSong);
      setNextSong(null);
      setIsPlaying(true);
      return;
    }
    
    const songPool = activePlaylist && playlists
      ? (activePlaylist.songIds
          .map(id => songs.find(s => s.id === id))
          .filter(Boolean) as Song[])
      : songs;
      
    if (songPool.length === 0) return;

    const currentIndex = songPool.findIndex(s => s.id === currentSong?.id && s.fileUrl === currentSong?.fileUrl);
    
    let nextIndex;
    if (currentIndex === -1) {
        nextIndex = 0;
    } else {
        nextIndex = (currentIndex + 1) % songPool.length;
    }
    
    setCurrentSong(songPool[nextIndex]);
    setIsPlaying(true);
  }

  const handleSkip = (direction: 'forward' | 'backward') => {
     if (direction === 'forward') {
        playNextSong();
        return;
    }
    
    const songPool = activePlaylist && playlists
      ? (activePlaylist.songIds
          .map(id => songs.find(s => s.id === id))
          .filter(Boolean) as Song[])
      : songs;
      
    if (songPool.length === 0) return;

    const currentIndex = songPool.findIndex(s => s.id === currentSong?.id && s.fileUrl === currentSong?.fileUrl);
    
    let nextIndex;
    if (currentIndex === -1) {
        nextIndex = 0;
    } else {
        nextIndex = (currentIndex - 1 + songPool.length) % songPool.length;
    }
    
    setCurrentSong(songPool[nextIndex]);
    setIsPlaying(true);
    setNextSong(null);
  };

  const handleSetNextSong = (song: Song) => {
    setNextSong(song);
    setSetNextMusicDialogOpen(false);
  };
  
  const handleToggleRepeat = () => {
    setIsRepeat(prev => !prev);
  };
  
  return (
    <div className="flex h-svh w-full flex-col bg-background text-foreground">
      <Header onUploadClick={() => setUploadDialogOpen(true)} onLogout={onLogout} />
      <UploadMusicDialog
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSongsAdded={handleSongsAdded}
      />
      <SetNextMusicDialog
        open={isSetNextMusicDialogOpen}
        onOpenChange={setSetNextMusicDialogOpen}
        songs={songs}
        onSongSelected={handleSetNextSong}
        currentSong={currentSong}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto space-y-8 px-4 py-8 md:px-6 lg:space-y-12 lg:py-12">
          <YourMusic songs={songs} onPlaySong={handlePlaySong} isLoading={isDbLoading} />
          <YourPlaylists
            playlists={playlists || []}
            songs={songs}
            onPlaySong={handlePlaySong}
            onPlaylistCreated={handlePlaylistCreated}
            onPlaylistUpdated={handlePlaylistUpdated}
            onPlaylistDeleted={handlePlaylistDeleted}
            isLoading={isPlaylistsLoading}
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
        nextSong={nextSong}
        isPlaying={isPlaying} 
        isRepeat={isRepeat}
        onPlayPause={handlePlayPause}
        onSkip={handleSkip}
        onToggleRepeat={handleToggleRepeat}
        onSongEnd={playNextSong}
        onSetNextClick={() => setSetNextMusicDialogOpen(true)}
      />
    </div>
  );
}


export default function AuthGate() {
  const { user, isUserLoading } = useUser();
  const auth = React.useContext(require('@/firebase').FirebaseContext)?.auth;


  const handleLogout = () => {
    auth?.signOut();
  }

  if (isUserLoading) {
    return (
        <div className="flex h-svh w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground ml-4">Loading...</p>
        </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <HarmonicaApp onLogout={handleLogout} />;
}
