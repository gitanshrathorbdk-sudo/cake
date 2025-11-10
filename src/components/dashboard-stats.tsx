import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, Music, Clock, Smile, Wand2 } from 'lucide-react';
import { CreatePlaylistDialog } from './create-playlist-dialog';

export function DashboardStats() {
  const stats = [
    {
      title: 'Most Listened',
      value: 'Midnight City - M83',
      icon: <Music className="h-6 w-6 text-primary" />,
      description: 'Your top track this month',
    },
    {
      title: 'Your Playlists',
      value: '12',
      icon: <ListMusic className="h-6 w-6 text-primary" />,
      description: 'Total playlists created',
    },
    {
      title: 'Time Listened',
      value: '27 hours',
      icon: <Clock className="h-6 w-6 text-primary" />,
      description: 'This week',
    },
    {
      title: 'Current Mood',
      value: 'Upbeat',
      icon: <Smile className="h-6 w-6 text-primary" />,
      description: 'Based on your listening',
    },
  ];

  return (
    <section className="space-y-6">
       <h2 className="text-3xl font-bold tracking-tight">Your Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
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
        <CreatePlaylistDialog />
      </div>
    </section>
  );
}
