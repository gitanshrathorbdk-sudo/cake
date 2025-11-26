'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ListMusic, Music } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Playlist, Song } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const manualPlaylistFormSchema = z.object({
  playlistName: z.string().min(2, {
    message: 'Playlist name must be at least 2 characters.',
  }),
});

type CreatePlaylistDialogProps = {
  onPlaylistCreated: (playlist: Playlist) => void;
  songs: Song[];
};

export function CreatePlaylistDialog({
  onPlaylistCreated,
  songs,
}: CreatePlaylistDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedSongs, setSelectedSongs] = React.useState<Set<string>>(
    new Set()
  );

  const { toast } = useToast();

  const form = useForm<z.infer<typeof manualPlaylistFormSchema>>({
    resolver: zodResolver(manualPlaylistFormSchema),
    defaultValues: {
      playlistName: '',
    },
  });

  const getSongIdentifier = (song: Song): string => {
    return song.id?.toString() || `${song.artist}-${song.title}`;
  };

  const handleSaveManualPlaylist = (
    values: z.infer<typeof manualPlaylistFormSchema>
  ) => {
    if (selectedSongs.size === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Select at least one song.',
      });
      return;
    }
    const songsForPlaylist = songs.filter(
      (s) => selectedSongs.has(getSongIdentifier(s))
    );


    const playlist: Playlist = {
      name: values.playlistName,
      songs: songsForPlaylist,
      type: 'manual',
    };

    onPlaylistCreated(playlist);
    toast({
      title: 'Playlist Saved',
      description: `"${playlist.name}" has been saved.`,
    });
    handleOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setTimeout(() => {
        setSelectedSongs(new Set());
      }, 300);
    }
  };

  const handleSongSelection = (songIdentifier: string) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(songIdentifier)) {
      newSelection.delete(songIdentifier);
    } else {
      newSelection.add(songIdentifier);
    }
    setSelectedSongs(newSelection);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full font-semibold">
          <ListMusic className="mr-2 h-5 w-5" />
          Create a playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create a Playlist
          </DialogTitle>
          <DialogDescription>
            Give your playlist a name and select the songs to add.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSaveManualPlaylist)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="playlistName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Playlist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormLabel>Select Songs</FormLabel>
            <ScrollArea className="h-[400px] pr-2 border rounded-md">
              <div className="space-y-2 p-2">
                {songs.length > 0 ? (
                  songs.map((song) => {
                     const songId = getSongIdentifier(song);
                     return (
                      <div
                        key={songId}
                        className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 cursor-pointer"
                        onClick={() => handleSongSelection(songId)}
                      >
                        <div className="flex items-center gap-3">
                          <Music className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {song.artist}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          id={`song-${songId}`}
                          checked={selectedSongs.has(songId)}
                          onCheckedChange={() => handleSongSelection(songId)}
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    Upload songs to create a playlist.
                  </p>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="submit">Save Playlist</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
