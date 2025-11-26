'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Playlist, Song } from '@/lib/types';
import { ListMusic, User, GripVertical, Play } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type YourPlaylistsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlists: Playlist[];
  onPlaylistsChange: (playlists: Playlist[]) => void;
  onPlaySong: (song: Song, playlist?: Playlist) => void;
};

export function YourPlaylistsDialog({
  open,
  onOpenChange,
  playlists,
  onPlaylistsChange,
  onPlaySong,
}: YourPlaylistsDialogProps) {
  const [draggedSong, setDraggedSong] = React.useState<{
    playlistName: string;
    song: Song;
    index: number;
  } | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    playlistName: string,
    song: Song,
    index: number
  ) => {
    setDraggedSong({ playlistName, song, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetPlaylistName: string,
    targetIndex: number
  ) => {
    e.preventDefault();
    if (
      !draggedSong ||
      draggedSong.playlistName !== targetPlaylistName ||
      draggedSong.index === targetIndex
    ) {
      setDraggedSong(null);
      return;
    }

    const updatedPlaylists = playlists.map((p) => {
      if (p.name === targetPlaylistName) {
        const newSongs = [...p.songs];
        const [removed] = newSongs.splice(draggedSong.index, 1);
        newSongs.splice(targetIndex, 0, removed);
        return { ...p, songs: newSongs };
      }
      return p;
    });

    onPlaylistsChange(updatedPlaylists);
    setDraggedSong(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Playlists</DialogTitle>
          <DialogDescription>
            All the playlists you've created. Drag and drop to reorder songs.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] h-full pr-4">
          {playlists.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {playlists.map((playlist) => (
                <AccordionItem key={playlist.name} value={playlist.name}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <ListMusic className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold text-left">
                          {playlist.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {playlist.songs.length} songs
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {playlist.songs.map((song, index) => (
                        <div
                          key={song.id || song.fileUrl}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, playlist.name, song, index)
                          }
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, playlist.name, index)}
                          className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 cursor-grab active:cursor-grabbing group"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{song.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {song.artist}
                              </p>
                            </div>
                          </div>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlaySong(song, playlist);
                              }}
                            >
                              <Play className="h-5 w-5 fill-current" />
                            </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              You haven't created any playlists yet.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
