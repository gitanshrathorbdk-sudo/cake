'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Song, Playlist } from '@/lib/types';
import { db } from '@/lib/db';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { GripVertical, Music, Trash2 } from 'lucide-react';

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaylistCreated: (playlist: Playlist) => void;
  onPlaylistUpdated: (playlist: Playlist) => void;
  songs: Song[];
  playlistToEdit?: Playlist | null;
}

export function CreatePlaylistDialog({
  open,
  onOpenChange,
  onPlaylistCreated,
  onPlaylistUpdated,
  songs,
  playlistToEdit,
}: CreatePlaylistDialogProps) {
  const { toast } = useToast();
  const [playlistName, setPlaylistName] = React.useState('');
  const [selectedSongs, setSelectedSongs] = React.useState<Song[]>([]);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (playlistToEdit) {
      setPlaylistName(playlistToEdit.name);
      const playlistSongs = playlistToEdit.songIds
        .map(id => songs.find(s => s.id === id))
        .filter(Boolean) as Song[];
      setSelectedSongs(playlistSongs);
    } else {
      setPlaylistName('');
      setSelectedSongs([]);
    }
  }, [playlistToEdit, songs, open]);

  const handleSelectSong = (song: Song) => {
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newSelectedSongs = [...selectedSongs];
      const dragItemContent = newSelectedSongs[dragItem.current];
      newSelectedSongs.splice(dragItem.current, 1);
      newSelectedSongs.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setSelectedSongs(newSelectedSongs);
    }
  };

  async function handleSubmit() {
    if (!playlistName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a name for the playlist.',
      });
      return;
    }

    if (selectedSongs.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one song.',
      });
      return;
    }

    const songIds = selectedSongs.map(s => s.id).filter(Boolean) as number[];

    try {
      if (playlistToEdit) {
        const updatedPlaylist: Playlist = {
          ...playlistToEdit,
          name: playlistName,
          songIds: songIds,
        };
        await db.playlists.update(playlistToEdit.id!, {
          name: playlistName,
          songIds: songIds,
        });
        onPlaylistUpdated(updatedPlaylist);
        toast({
          title: 'Playlist Updated',
          description: `"${playlistName}" has been updated.`,
        });
      } else {
        const newPlaylist: Playlist = {
          name: playlistName,
          songIds: songIds,
        };
        const id = await db.playlists.add(newPlaylist);
        newPlaylist.id = id;
        onPlaylistCreated(newPlaylist);
        toast({
          title: 'Playlist Created',
          description: `"${playlistName}" has been added to your playlists.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save playlist:', error);
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Could not save the playlist.',
      });
    }
  }
  
  const songsNotInPlaylist = songs.filter(
    song => !selectedSongs.some(ss => ss.id === song.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{playlistToEdit ? 'Edit Playlist' : 'Create Playlist'}</DialogTitle>
          <DialogDescription>
            {playlistToEdit ? 'Edit the name and songs for your playlist.' : 'Give your playlist a name and add some songs.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 overflow-y-auto py-4">
          {/* Left Side: All Songs */}
          <div className="flex flex-col gap-4">
            <Label htmlFor="playlist-name">Playlist Name</Label>
            <Input
                id="playlist-name"
                placeholder="My Awesome Mix"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
            />
            <h3 className="font-semibold mt-4">Available Songs</h3>
            <ScrollArea className="h-96 rounded-md border">
              <div className="p-4">
                {songsNotInPlaylist.length > 0 ? (
                    songsNotInPlaylist.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">{song.title}</p>
                            <p className="text-xs text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedSongs.some(s => s.id === song.id)}
                        onCheckedChange={() => handleSelectSong(song)}
                      />
                    </div>
                  ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">All songs added.</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side: Selected Songs */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold md:mt-[52px]">Selected Songs ({selectedSongs.length})</h3>
             <ScrollArea className="h-96 rounded-md border">
              <div className="p-4 space-y-2">
                 {selectedSongs.length > 0 ? (
                    selectedSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragEnd={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <span className="text-sm font-mono text-muted-foreground w-6">{index + 1}.</span>
                        <div>
                            <p className="font-medium text-sm">{song.title}</p>
                            <p className="text-xs text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSelectSong(song)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Select songs from the left.</p>
                    </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            {playlistToEdit ? 'Save Changes' : 'Create Playlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
