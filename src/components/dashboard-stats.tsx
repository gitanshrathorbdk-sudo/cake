
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Music, Clock, Smile } from 'lucide-react';
import type { Song } from '@/lib/types';
import * as React from 'react';

type DashboardStatsProps = {
    songs: Song[];
    timeListenedInSeconds: number;
    currentSong: Song | null;
};

export function DashboardStats({ songs, timeListenedInSeconds, currentSong }: DashboardStatsProps) {
  
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          
          return card;
        })}
      </div>
    </section>
    </>
  );
}
