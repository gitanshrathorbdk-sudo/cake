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
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { GripVertical, Lock, Music, Trash2, Globe, User } from 'lucide-react';
import { Switch } from './ui/switch';
import type { PlaylistDB } from '@/lib/db';

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocalPlaylistCreated: (playlist: Omit<PlaylistDB, 'id'>) => void;
  onPublicPlaylistCreated: (playlist: Omit<Playlist, 'id' | 'isPublic'>) => void;
  onLocalPlaylistUpdated: (playlist: PlaylistDB) => void;
  onPublicPlaylistUpdated: (playlist: Playlist) => void;
  onLocalPlaylistDeleted: (playlistId: number) => void;
  onPublicPlaylistDeleted: (playlistId: string) => void;
  songs: Song[];
  playlistToEdit?: Playlist | null;
}

export function CreatePlaylistDialog({
  open,
  onOpenChange,
  onLocalPlaylistCreated,
  onPublicPlaylistCreated,
  onLocalPlaylistUpdated,
  onPublicPlaylistUpdated,
  onLocalPlaylistDeleted,
  onPublicPlaylistDeleted,
  songs,
  playlistToEdit,
}: CreatePlaylistDialogProps) {
  const { toast } = useToast();
  const [playlistName, setPlaylistName] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [selectedSongs, setSelectedSongs] = React.useState<Song[]>([]);
  const [isPublic, setIsPublic] = React.useState(false);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (playlistToEdit) {
      setPlaylistName(playlistToEdit.name);
      setIsPublic(playlistToEdit.isPublic);
      setOwnerName(playlistToEdit.ownerName || '');
      const playlistSongs = playlistToEdit.songIds
        .map(id => songs.find(s => s.id === id))
        .filter(Boolean) as Song[];
      setSelectedSongs(playlistSongs);
    } else {
      setPlaylistName('');
      setIsPublic(false);
      setOwnerName('');
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
    
    if (isPublic && !ownerName.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Public playlists must have an owner name.',
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
            // Logic for updating an existing playlist
            const wasPublic = playlistToEdit.isPublic;
            
            // If privacy changed, we need to delete from the old location and create in the new one
            if (wasPublic && !isPublic) { // Was public, now private
                onPublicPlaylistDeleted(playlistToEdit.id as string);
                const newLocalPlaylist: Omit<PlaylistDB, 'id'> = { name: playlistName, songIds };
                onLocalPlaylistCreated(newLocalPlaylist);
            } else if (!wasPublic && isPublic) { // Was private, now public
                onLocalPlaylistDeleted(playlistToEdit.id as number);
                const newPublicPlaylist: Omit<Playlist, 'id' | 'isPublic'> = { name: playlistName, songIds, ownerName };
                onPublicPlaylistCreated(newPublicPlaylist);
            } else { // Privacy not changed, just update
                if (isPublic) {
                    const updatedPlaylist: Playlist = { ...playlistToEdit, id: playlistToEdit.id as string, name: playlistName, songIds, ownerName, isPublic: true };
                    onPublicPlaylistUpdated(updatedPlaylist);
                } else {
                    const updatedPlaylist: PlaylistDB = { id: playlistToEdit.id as number, name: playlistName, songIds, ownerName: '' };
                    onLocalPlaylistUpdated(updatedPlaylist);
                }
            }
            toast({
                title: 'Playlist Updated',
                description: `"${playlistName}" has been updated.`,
            });
        } else {
            // Logic for creating a new playlist
            if (isPublic) {
                const newPlaylist: Omit<Playlist, 'id' | 'isPublic'> = { name: playlistName, songIds, ownerName };
                onPublicPlaylistCreated(newPlaylist);
            } else {
                const newPlaylist: Omit<PlaylistDB, 'id'> = { name: playlistName, songIds, ownerName: '' };
                onLocalPlaylistCreated(newPlaylist);
            }
            toast({
                title: 'Playlist Created',
                description: `"${playlistName}" has been added.`,
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
            {playlistToEdit ? 'Edit the details for your playlist.' : 'Give your playlist a name and add some songs.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 overflow-y-auto py-4">
          {/* Left Side: All Songs */}
          <div className="flex flex-col gap-4">
            <div className='space-y-2'>
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input
                  id="playlist-name"
                  placeholder="My Awesome Mix"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
                <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public-switch" className="flex items-center gap-2 cursor-pointer">
                    {isPublic ? <><Globe className="h-4 w-4" /> Public (Shared)</> : <><Lock className="h-4 w-4" /> Private (This browser only)</>}
                </Label>
            </div>
            {isPublic && (
                <div className='space-y-2 animate-in fade-in'>
                    <Label htmlFor="owner-name" className='flex items-center gap-2'><User className='h-4 w-4'/> Owner Name</Label>
                    <Input
                        id="owner-name"
                        placeholder="Your Name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                    />
                </div>
            )}
            <h3 className="font-semibold mt-4">Available Songs</h3>
            <ScrollArea className="h-80 rounded-md border">
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
            <h3 className="font-semibold md:mt-[58px]">Selected Songs ({selectedSongs.length})</h3>
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
