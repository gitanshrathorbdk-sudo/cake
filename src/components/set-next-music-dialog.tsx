'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Music, Search } from 'lucide-react';
import type { Song } from '@/lib/types';
import { Button } from './ui/button';

interface SetNextMusicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songs: Song[];
  onSongSelected: (song: Song) => void;
  currentSong: Song | null;
}

export function SetNextMusicDialog({
  open,
  onOpenChange,
  songs,
  onSongSelected,
  currentSong,
}: SetNextMusicDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSongs = songs.filter(song =>
    (song.id !== currentSong?.id || song.fileUrl !== currentSong.fileUrl) &&
    (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (song: Song) => {
    onSongSelected(song);
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if(open) {
        setSearchQuery('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Next Music</DialogTitle>
          <DialogDescription>
            Select which song you want to play after the current one finishes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for a song..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-96">
            <Table>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id || song.fileUrl} className="group cursor-pointer" onClick={() => handleSelect(song)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                       <Button variant="outline" size="sm">Select</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
