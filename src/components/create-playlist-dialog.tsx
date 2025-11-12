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
import { ListMusic, Music, Wand2, User, Loader2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Playlist, Song } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from './ui/textarea';
import { generatePlaylist } from '@/ai/flows/generate-playlist-flow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const manualPlaylistFormSchema = z.object({
  playlistName: z.string().min(2, {
    message: 'Playlist name must be at least 2 characters.',
  }),
});

const aiPlaylistFormSchema = z.object({
  playlistName: z.string().min(2, {
    message: 'Playlist name must be at least 2 characters.',
  }),
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
  songCount: z.coerce.number().min(3).max(20),
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
  const [selectedSongs, setSelectedSongs] = React.useState<Set<number>>(
    new Set()
  );
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { toast } = useToast();

  const manualForm = useForm<z.infer<typeof manualPlaylistFormSchema>>({
    resolver: zodResolver(manualPlaylistFormSchema),
    defaultValues: {
      playlistName: '',
    },
  });

  const aiForm = useForm<z.infer<typeof aiPlaylistFormSchema>>({
    resolver: zodResolver(aiPlaylistFormSchema),
    defaultValues: {
      playlistName: '',
      prompt: '',
      songCount: 10,
    },
  });

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
    const songsForPlaylist = songs.filter((s) => s.id && selectedSongs.has(s.id));

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

  const handleSaveAiPlaylist = async (
    values: z.infer<typeof aiPlaylistFormSchema>
  ) => {
    setIsGenerating(true);
    try {
      const availableSongs = songs.map(s => ({ title: s.title, artist: s.artist, characteristics: s.characteristics.join(', ') }));

      const result = await generatePlaylist({
        availableSongs: availableSongs,
        prompt: values.prompt,
        count: values.songCount,
      });
      
      const playlistSongs = result.songs.map(resultSong => {
        const foundSong = songs.find(s => s.title === resultSong.title && s.artist === resultSong.artist);
        return foundSong;
      }).filter((s): s is Song => !!s);
      
      const playlist: Playlist = {
        name: values.playlistName,
        songs: playlistSongs,
        type: 'ai',
      };

      onPlaylistCreated(playlist);
      toast({
        title: 'AI Playlist Generated',
        description: `"${playlist.name}" has been created.`,
      });
      handleOpenChange(false);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate playlist. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSelectedSongs(new Set());
        manualForm.reset();
        aiForm.reset();
      }, 300);
    }
  };

  const handleSongSelection = (songId: number) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(songId)) {
      newSelection.delete(songId);
    } else {
      newSelection.add(songId);
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
            Build a new playlist yourself or let AI do the work.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <User className="mr-2 h-4 w-4" />
              By Yourself
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Wand2 className="mr-2 h-4 w-4" />
              By AI
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <Form {...manualForm}>
              <form
                onSubmit={manualForm.handleSubmit(handleSaveManualPlaylist)}
                className="space-y-4 pt-2"
              >
                <FormField
                  control={manualForm.control}
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

                <ScrollArea className="max-h-[30vh] h-full pr-2">
                  <div className="space-y-2">
                    {songs.length > 0 ? (
                      songs.map((song) => (
                        song.id ? (
                        <div
                          key={song.id}
                          className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 cursor-pointer"
                          onClick={() => handleSongSelection(song.id!)}
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
                            id={`song-${song.id}`}
                            checked={selectedSongs.has(song.id)}
                            onCheckedChange={() =>
                              handleSongSelection(song.id!)
                            }
                          />
                        </div>
                        ) : null
                      ))
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
          </TabsContent>
          <TabsContent value="ai">
             <Form {...aiForm}>
              <form
                onSubmit={aiForm.handleSubmit(handleSaveAiPlaylist)}
                className="space-y-4 pt-2"
              >
                <FormField
                  control={aiForm.control}
                  name="playlistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Playlist Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Vibey Morning" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={aiForm.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Playlist Prompt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'A playlist for a rainy day, with chill, acoustic songs.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={aiForm.control}
                  name="songCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Songs</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of songs" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(18)].map((_, i) => (
                            <SelectItem key={i + 3} value={String(i + 3)}>{i + 3}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Wand2 className='mr-2 h-4 w-4'/>}
                    Generate Playlist
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
