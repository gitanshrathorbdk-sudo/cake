
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ListMusic, Music, Clock, Smile } from 'lucide-react';
import { CreatePlaylistDialog } from './create-playlist-dialog';
import type { Playlist, Song } from '@/lib/types';
import * as React from 'react';
import { YourPlaylistsDialog } from './your-playlists-dialog';
import { cn } from '@/lib/utils';

type DashboardStatsProps = {
    playlists: Playlist[];
    onPlaylistCreated: (playlist: Playlist) => void;
    onPlaylistsChange: (playlists: Playlist[]) => void;
    songs: Song[];
    timeListenedInSeconds: number;
    currentSong: Song | null;
    onPlaySong: (song: Song, playlist?: Playlist) => void;
};

export function DashboardStats({ playlists, onPlaylistCreated, onPlaylistsChange, songs, timeListenedInSeconds, currentSong, onPlaySong }: DashboardStatsProps) {
  const [isPlaylistsDialogOpen, setPlaylistsDialogOpen] = React.useState(false);
  
  const formatTimeListened = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let display = '';
    if (hours > 0) {
        display += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
        display += `${minutes}m `;
    }
    display += `${seconds}s`;

    return display.trim();
  };

  const mostListenedValue = currentSong ? `${currentSong.title} - ${currentSong.artist}` : 'No songs yet';
  const mostListenedDescription = currentSong ? 'Currently playing' : 'Play a song to start';

  const stats = [
    {
      title: 'Most Listened',
      value: mostListenedValue,
      icon: <Music className="h-6 w-6 text-primary" />,
      description: mostListenedDescription,
    },
    {
      title: 'Your Playlists',
      value: playlists.length.toString(),
      icon: <ListMusic className="h-6 w-6 text-primary" /> ,
      description: 'Total playlists created',
      action: () => setPlaylistsDialogOpen(true),
    },
    {
      title: 'Time Listened',
      value: formatTimeListened(timeListenedInSeconds),
      icon: <Clock className="h-6 w-6 text-primary" />,
      description: 'This session',
    },
    {
      title: 'Current Mood',
      value: 'Upbeat',
      icon: <Smile className="h-6 w-6 text-primary" />,
      description: 'Based on your listening',
    },
  ];

  return (
    <>
    <section className="space-y-6">
       <h2 className="text-3xl font-bold tracking-tight">Your Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const card = (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold truncate">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
            </Card>
          );
          
          if (stat.action) {
            return (
                <div key={stat.title} onClick={stat.action} className={cn(stat.action ? 'cursor-pointer rounded-lg hover:ring-2 hover:ring-primary/50' : '')}>
                    {card}
                </div>
            )
          }

          return card;
        })}
      </div>
      <div className="flex justify-center pt-4">
        <CreatePlaylistDialog onPlaylistCreated={onPlaylistCreated} songs={songs} />
      </div>
    </section>
    <YourPlaylistsDialog open={isPlaylistsDialogOpen} onOpenChange={setPlaylistsDialogOpen} playlists={playlists} onPlaylistsChange={onPlaylistsChange} onPlaySong={onPlaySong} />
    </>
  );
}
