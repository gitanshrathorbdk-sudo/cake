'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Music, Play, Plus, ListMusic, Trash2, Edit, GripVertical, Globe, Lock, Share2 } from 'lucide-react';
import type { Playlist, Song } from '@/lib/types';
import { CreatePlaylistDialog } from './create-playlist-dialog';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import type { PlaylistDB } from '@/lib/db';
import { Badge } from './ui/badge';


interface YourPlaylistsProps {
  playlists: Playlist[];
  songs: Song[];
  onPlaySong: (song: Song, playlist: Playlist) => void;
  onLocalPlaylistCreated: (playlist: Omit<PlaylistDB, 'id'>) => void;
  onPublicPlaylistCreated: (playlist: Omit<Playlist, 'id' | 'isPublic'>) => void;
  onLocalPlaylistUpdated: (playlist: PlaylistDB) => void;
  onPublicPlaylistUpdated: (playlist: Playlist) => void;
  onLocalPlaylistDeleted: (playlistId: number) => void;
  onPublicPlaylistDeleted: (playlistId: string) => void;
  onTogglePlaylistPrivacy: (playlist: Playlist) => void;
  isLoading: boolean;
}

export function YourPlaylists({
  playlists,
  songs,
  onPlaySong,
  onLocalPlaylistCreated,
  onPublicPlaylistCreated,
  onLocalPlaylistUpdated,
  onPublicPlaylistUpdated,
  onLocalPlaylistDeleted,
  onPublicPlaylistDeleted,
  onTogglePlaylistPrivacy,
  isLoading,
}: YourPlaylistsProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Playlist | null>(null);
  const [playlistToEdit, setPlaylistToEdit] = React.useState<Playlist | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = React.useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = React.useState<Song[]>([]);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // If the currently selected playlist is deleted from outside, deselect it.
    if (selectedPlaylist && !playlists.find(p => p.id === selectedPlaylist.id && p.isPublic === selectedPlaylist.isPublic)) {
      setSelectedPlaylist(null);
    }
  }, [playlists, selectedPlaylist]);

  React.useEffect(() => {
    if (selectedPlaylist) {
      const songsInPlaylist = selectedPlaylist.songIds
        .map(id => songs.find(song => song.id === id))
        .filter(Boolean) as Song[];
      setPlaylistSongs(songsInPlaylist);
    } else {
      setPlaylistSongs([]);
    }
  }, [selectedPlaylist, songs]);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleSongReordered = (reorderedSongs: Song[]) => {
    if (!selectedPlaylist) return;

    const newSongIds = reorderedSongs.map(s => s.id!).filter(Boolean) as number[];
    
    if (selectedPlaylist.isPublic) {
        const updatedPlaylist: Playlist = { ...selectedPlaylist, songIds: newSongIds };
        onPublicPlaylistUpdated(updatedPlaylist);
    } else {
        const updatedPlaylist: PlaylistDB = { id: selectedPlaylist.id as number, name: selectedPlaylist.name, songIds: newSongIds };
        onLocalPlaylistUpdated(updatedPlaylist);
    }
  };

  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && selectedPlaylist) {
      const newPlaylistSongs = [...playlistSongs];
      const dragItemContent = newPlaylistSongs[dragItem.current];
      newPlaylistSongs.splice(dragItem.current, 1);
      newPlaylistSongs.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      
      setPlaylistSongs(newPlaylistSongs);
      handleSongReordered(newPlaylistSongs);
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setPlaylistToEdit(playlist);
    setCreateDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!playlistToDelete || !playlistToDelete.id) return;
    try {
        if (playlistToDelete.isPublic) {
            onPublicPlaylistDeleted(playlistToDelete.id as string);
        } else {
            onLocalPlaylistDeleted(playlistToDelete.id as number);
        }
        toast({
            title: "Playlist Deleted",
            description: `"${playlistToDelete.name}" has been deleted.`
        });
        if (selectedPlaylist?.id === playlistToDelete.id) {
            setSelectedPlaylist(null);
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not delete the playlist."
        });
        console.error("Failed to delete playlist", error);
    } finally {
        setPlaylistToDelete(null);
    }
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Your Playlists</h2>
          <Button onClick={() => {
            setPlaylistToEdit(null);
            setCreateDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>All Playlists</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
              ) : playlists.length > 0 ? (
                <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-2">
                    {playlists.map(playlist => (
                        <div
                        key={`${playlist.id}-${playlist.isPublic}`}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedPlaylist?.id === playlist.id && selectedPlaylist?.isPublic === playlist.isPublic
                            ? 'bg-primary/20'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedPlaylist(playlist)}
                        >
                        <div className="flex items-center gap-3">
                            <ListMusic className="h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="font-medium">{playlist.name}</span>
                                {playlist.isPublic && playlist.ownerName && <span className="text-xs text-muted-foreground">by {playlist.ownerName}</span>}
                            </div>
                            <Badge variant={playlist.isPublic ? 'outline' : 'secondary'}>
                            {playlist.isPublic 
                                ? <><Globe className="mr-1 h-3 w-3" />Public</>
                                : <><Lock className="mr-1 h-3 w-3" />Private</>
                            }
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onTogglePlaylistPrivacy(playlist)}>
                                  <Share2 className="mr-2 h-4 w-4" />
                                  <span>{playlist.isPublic ? 'Make Private' : 'Make Public'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(playlist)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPlaylistToDelete(playlist)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No playlists yet.</p>
                  <p className="text-sm text-muted-foreground">Click "Create Playlist" to start.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
                {selectedPlaylist ? (
                    <>
                        <CardTitle className="flex items-center gap-2">
                            {selectedPlaylist.name}
                            <Badge variant={selectedPlaylist.isPublic ? 'outline' : 'secondary'}>
                              {selectedPlaylist.isPublic 
                                ? <><Globe className="mr-1 h-3 w-3" />Public</>
                                : <><Lock className="mr-1 h-3 w-3" />Private</>
                              }
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {playlistSongs.length} songs {selectedPlaylist.isPublic && selectedPlaylist.ownerName && `· Curated by ${selectedPlaylist.ownerName}`}
                        </CardDescription>
                    </>
                ) : (
                     <CardTitle>Select a Playlist</CardTitle>
                )}
              
            </CardHeader>
            <CardContent>
              {selectedPlaylist ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Artist</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playlistSongs.map((song, index) => (
                        <TableRow 
                            key={song.id} 
                            className="group"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <TableCell className="cursor-move">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPlaySong(song, selectedPlaylist);
                                    }}
                                >
                                    <Play className="h-5 w-5 fill-current" />
                                </Button>
                            </TableCell>
                          <TableCell onClick={() => onPlaySong(song, selectedPlaylist)} className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Music className="h-5 w-5 text-muted-foreground" />
                              <p className="font-medium">{song.title}</p>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => onPlaySong(song, selectedPlaylist)} className="hidden md:table-cell cursor-pointer">{song.artist}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center">
                    <ListMusic className="h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Select a playlist from the left to see its songs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onLocalPlaylistCreated={onLocalPlaylistCreated}
        onPublicPlaylistCreated={onPublicPlaylistCreated}
        onLocalPlaylistUpdated={onLocalPlaylistUpdated}
        onPublicPlaylistUpdated={onPublicPlaylistUpdated}
        onLocalPlaylistDeleted={onLocalPlaylistDeleted}
        onPublicPlaylistDeleted={onPublicPlaylistDeleted}
        songs={songs}
        playlistToEdit={playlistToEdit}
      />
       <AlertDialog open={!!playlistToDelete} onOpenChange={() => setPlaylistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the playlist "{playlistToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
