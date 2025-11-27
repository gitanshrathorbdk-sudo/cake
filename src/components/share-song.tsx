'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { SharedSong } from '@/lib/types';
import { List } from 'lucide-react';

interface ShareSongProps {
  onSongShared: (song: SharedSong) => void;
  sharedSongs: SharedSong[];
}

export function ShareSong({ onSongShared, sharedSongs }: ShareSongProps) {
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [songName, setSongName] = React.useState('');
  
  // Replace this with your actual email address
  const YOUR_EMAIL_ADDRESS = 'your-email@example.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !songName) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all the fields to share a song.',
      });
      return;
    }
    
    const newSharedSong: SharedSong = { name, email, songName };
    onSongShared(newSharedSong);
    
    const subject = encodeURIComponent(`New Song Suggestion: ${songName}`);
    const body = encodeURIComponent(`Hi,\n\n${name} (${email}) has suggested the following song:\n\nSong: ${songName}\n\nThanks,\nHarmonica App`);
    window.open(`mailto:${YOUR_EMAIL_ADDRESS}?subject=${subject}&body=${body}`);

    toast({
      title: 'Suggestion Sent!',
      description: `${songName} has been added to the suggestions list.`,
    });
    
    // Reset form
    setName('');
    setEmail('');
    setSongName('');
  };

  return (
    <section>
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Share Your Song</CardTitle>
                <CardDescription>
                    Suggest a song to be added to the app. Your suggestion will be sent to the administrator.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="song-name">Song Name & Artist</Label>
                    <Input id="song-name" placeholder="Bohemian Rhapsody - Queen" value={songName} onChange={e => setSongName(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">Share</Button>
                </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Suggestions</CardTitle>
                    <CardDescription>Songs suggested during this session.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sharedSongs.length > 0 ? (
                        <ul className="space-y-3">
                            {sharedSongs.map((song, index) => (
                                <li key={index} className="flex items-center justify-between rounded-md border p-3">
                                    <div>
                                        <p className="font-medium">{song.songName}</p>
                                        <p className="text-sm text-muted-foreground">Suggested by {song.name}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <List className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No suggestions shared yet in this session.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </section>
  );
}
