'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Playlist } from '@/lib/types';
import { ListMusic, User, BrainCircuit } from 'lucide-react';

type YourPlaylistsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlists: Playlist[];
};

export function YourPlaylistsDialog({ open, onOpenChange, playlists }: YourPlaylistsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Playlists</DialogTitle>
          <DialogDescription>
            All the playlists you've created.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] h-full pr-4">
            <div className="space-y-3">
            {playlists.length > 0 ? playlists.map((playlist, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                        <ListMusic className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">{playlist.name}</p>
                            <p className="text-sm text-muted-foreground">{playlist.songs.length} songs</p>
                        </div>
                    </div>
                    <Badge variant={playlist.type === 'ai' ? 'default' : 'secondary'}>
                        {playlist.type === 'ai' ? <BrainCircuit className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
                        {playlist.type === 'ai' ? 'By AI' : 'By You'}
                    </Badge>
                </div>
            )) : (
                <p className='text-center text-muted-foreground py-8'>You haven't created any playlists yet.</p>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
