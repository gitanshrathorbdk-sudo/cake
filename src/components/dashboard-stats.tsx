
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, Music, Clock, Smile } from 'lucide-react';
import { CreatePlaylistDialog } from './create-playlist-dialog';
import type { Playlist, Song } from '@/lib/types';
import * as React from 'react';
import { YourPlaylistsDialog } from './your-playlists-dialog';

type DashboardStatsProps = {
    playlists: Playlist[];
    onPlaylistCreated: (playlist: Playlist) => void;
    songs: Song[];
    timeListenedInSeconds: number;
};

export function DashboardStats({ playlists, onPlaylistCreated, songs, timeListenedInSeconds }: DashboardStatsProps) {
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

  const stats = [
    {
      title: 'Most Listened',
      value: 'Midnight City - M83',
      icon: <Music className="h-6 w-6 text-primary" />,
      description: 'Your top track this month',
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
        {stats.map((stat) => (
          <Card key={stat.title} onClick={stat.action} className={stat.action ? 'cursor-pointer hover:bg-accent/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center pt-4">
        <CreatePlaylistDialog onPlaylistCreated={onPlaylistCreated} songs={songs} />
      </div>
    </section>
    <YourPlaylistsDialog open={isPlaylistsDialogOpen} onOpenChange={setPlaylistsDialogOpen} playlists={playlists} />
    </>
  );
}
