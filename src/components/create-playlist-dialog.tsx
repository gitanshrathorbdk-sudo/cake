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
  DialogTrigger,
  DialogFooter,
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
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { generatePlaylist } from '@/app/actions';
import { GeneratePlaylistFromMoodOutput } from '@/ai/flows/generate-playlist-from-mood';
import { Wand2, Pencil, Loader2, ListMusic, ChevronLeft, Music } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

const playlistFormSchema = z.object({
  mood: z.string().min(2, {
    message: 'Mood must be at least 2 characters.',
  }),
  numberOfSongs: z.number().min(5).max(20),
});

const dummySongs = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen' },
  { id: '2', title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
  { id: '3', title: 'Hotel California', artist: 'Eagles' },
  { id: '4', title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
  { id: '5', title: 'Imagine', artist: 'John Lennon' },
  { id: '6', title: 'Like a Rolling Stone', artist: 'Bob Dylan' },
];

export function CreatePlaylistDialog() {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<'options' | 'ai' | 'manual'>('options');
  const [isLoading, setIsLoading] = React.useState(false);
  const [playlist, setPlaylist] =
    React.useState<GeneratePlaylistFromMoodOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof playlistFormSchema>>({
    resolver: zodResolver(playlistFormSchema),
    defaultValues: {
      mood: 'energetic',
      numberOfSongs: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof playlistFormSchema>) {
    setIsLoading(true);
    setPlaylist(null);
    const result = await generatePlaylist(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setPlaylist(result.data);
      toast({
        title: 'Playlist Generated!',
        description: 'Your AI-powered playlist is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setView('options');
        setPlaylist(null);
        form.reset();
      }, 300);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'ai':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Generate Playlist with AI
              </DialogTitle>
              <DialogDescription>
                Describe the mood and let AI create a playlist for you.
              </DialogDescription>
            </DialogHeader>
            {!playlist && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Chill, Focus, Workout" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfSongs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Songs: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={5}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
            {playlist && (
              <div className="max-h-[50vh] overflow-y-auto">
                <h3 className="mb-2 text-lg font-semibold">Your "{form.getValues('mood')}" Playlist</h3>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Genre</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playlist.playlist.map((song, index) => (
                        <TableRow key={index}>
                          <TableCell>{song.title}</TableCell>
                          <TableCell>{song.artist}</TableCell>
                          <TableCell>{song.genre}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            )}
          </>
        );
      case 'manual':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                Create a Playlist
              </DialogTitle>
              <DialogDescription>
                Select songs from your library to build a new playlist.
              </DialogDescription>
            </DialogHeader>
             <div className="space-y-2">
                <Input placeholder="Playlist Name" />
              </div>
            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-2">
              {dummySongs.map(song => (
                <div key={song.id} className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                    </div>
                    <Checkbox id={`song-${song.id}`} />
                </div>
              ))}
            </div>
             <DialogFooter>
                <Button>Save Playlist</Button>
            </DialogFooter>
          </>
        );
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create a New Playlist</DialogTitle>
              <DialogDescription>
                How would you like to start?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setView('ai')}
              >
                <Wand2 className="h-6 w-6 text-primary" />
                <span>Generate with AI</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setView('manual')}
              >
                <Pencil className="h-6 w-6 text-primary" />
                <span>Make it Yourself</span>
              </Button>
            </div>
          </>
        );
    }
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
        {view !== 'options' && (
           <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={() => {
             setPlaylist(null);
             setView('options');
           }}>
             <ChevronLeft className="h-4 w-4" />
             Back
           </Button>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
