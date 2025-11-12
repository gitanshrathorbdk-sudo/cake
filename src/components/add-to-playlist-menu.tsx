'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { ListPlus, ListMusic } from 'lucide-react';
import type { Playlist, Song } from '@/lib/types';

type AddToPlaylistMenuProps = {
  playlists: Playlist[];
  currentSong: Song | null;
  onAddToPlaylist: (playlistName: string, song: Song) => void;
};

export function AddToPlaylistMenu({
  playlists,
  currentSong,
  onAddToPlaylist,
}: AddToPlaylistMenuProps) {
  const handleSelect = (playlistName: string) => {
    if (currentSong) {
      onAddToPlaylist(playlistName, currentSong);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!currentSong}>
          <ListPlus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <DropdownMenuItem
              key={playlist.name}
              onSelect={() => handleSelect(playlist.name)}
              className="flex items-center gap-2"
            >
              <ListMusic className="h-4 w-4 text-muted-foreground" />
              <span>{playlist.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No playlists yet.</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
