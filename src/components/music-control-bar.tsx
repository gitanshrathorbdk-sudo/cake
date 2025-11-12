'use client';
import * as React from 'react';
import { SkipBack, Play, Pause, SkipForward, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import type { Playlist, Song } from '@/lib/types';
import { AddToPlaylistMenu } from './add-to-playlist-menu';

interface MusicControlBarProps {
    song: Song | null;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSkip: (direction: 'forward' | 'backward') => void;
    playlists: Playlist[];
    onAddToPlaylist: (playlistName: string, song: Song) => void;
}

export function MusicControlBar({ song, isPlaying, onPlayPause, onSkip, playlists, onAddToPlaylist }: MusicControlBarProps) {
  const [progress, setProgress] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);

  // Effect to manage the audio source
  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio && song) {
      audio.src = song.fileUrl;
      audio.load(); // Load the new source
      if (isPlaying) {
        // Attempt to play, but catch errors
        audio.play().catch(e => console.error("Playback failed for new song", e));
      }
    } else if (audio) {
      audio.pause();
      audio.src = '';
    }
  }, [song?.fileUrl, song?.id]); // Note dependency on fileUrl and id

  // Effect to manage play/pause state
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
  
    if (isPlaying && audio.src) {
       // Only play if there is a source and we are in a playing state
       const playPromise = audio.play();
       if (playPromise !== undefined) {
           playPromise.catch(error => {
               // Autoplay was prevented.
               console.error("Audio playback was prevented:", error);
               // You might want to update the UI state to reflect that it's not playing
               // onPlayPause(); // This could cause a loop if not handled carefully
           });
       }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.duration) && audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
        if (audio.currentTime === audio.duration) {
          onSkip('forward');
        }
    }
  };
  
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
        setDuration(audio.duration);
    }
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.duration)) {
      const newTime = (value[0] / 100) * audio.duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value[0]);
    }
  };

  return (
    <footer className="sticky bottom-0 z-10 w-full border-t bg-card/95 backdrop-blur-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onSkip('forward')}
        // Remove src from here; it's managed by the useEffect
      />
      <div className="container mx-auto flex h-24 items-center justify-between gap-4 p-4">
        <div className="flex w-1/3 items-center gap-3">
          {song ? (
            <>
              <Image
                src="https://picsum.photos/seed/currentSong/64/64"
                alt="Album Art"
                width={48}
                height={48}
                className="rounded-md"
                data-ai-hint="album cover"
              />
              <div className="hidden md:block">
                <p className="font-semibold text-foreground truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
            </>
          ) : (
             <div className="flex items-center gap-3 text-muted-foreground">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-muted">
                    <Music className="h-6 w-6" />
                </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-2 md:w-1/3">
            <div className="flex w-full max-w-xs items-center gap-2 text-xs">
                <span className="w-10 text-right">{formatTime(currentTime)}</span>
                <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={1}
                    className="w-full"
                    disabled={!song}
                />
                <span className="w-10 text-left">{formatTime(duration)}</span>
            </div>
             <div className="flex items-center justify-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSkip('backward')}>
                <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                variant="default"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={onPlayPause}
                disabled={!song}
                >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSkip('forward')}>
                <SkipForward className="h-5 w-5" />
                </Button>
            </div>
        </div>

        <div className="flex w-1/3 items-center justify-end">
            <AddToPlaylistMenu playlists={playlists} currentSong={song} onAddToPlaylist={onAddToPlaylist} />
        </div>
      </div>
    </footer>
  );
}
