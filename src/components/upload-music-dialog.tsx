'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Plus, Trash2, Wand2, Loader2, Upload, Youtube, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { suggestCharacteristics } from '@/ai/flows/suggest-characteristics-flow';
import { db } from '@/lib/db';
import { getYouTubeSong } from '@/app/actions';
import { Alert, AlertDescription } from './ui/alert';

const fileSongSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  characteristics: z.string().optional(),
  file: z
    .any()
    .refine(
      (files) =>
        typeof window === 'undefined' || (files instanceof FileList && files.length > 0),
      'File is required.'
    )
    .refine(
      (files) =>
        typeof window === 'undefined' || (files instanceof FileList && files.length === 1),
      'Only one file is allowed.'
    ),
});

const uploadFormSchema = z.object({
  songs: z.array(fileSongSchema).min(1),
});

const youtubeSongSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    artist: z.string().optional(),
    characteristics: z.string().optional(),
});

type UploadMusicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSongsAdded: (songs: Song[]) => void;
  children?: React.ReactNode;
};

export function UploadMusicDialog({ open, onOpenChange, onSongsAdded, children }: UploadMusicDialogProps) {
  const { toast } = useToast();
  const [generatingIndex, setGeneratingIndex] = React.useState<number | null>(null);
  const [isDownloadingFromYT, setIsDownloadingFromYT] = React.useState(false);

  const fileUploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      songs: [{ title: '', artist: '', characteristics: '', file: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: fileUploadForm.control,
    name: 'songs',
  });

  const [ytActionState, formAction, isFetchingYT] = useActionState(getYouTubeSong, null);

  const youtubeSongForm = useForm<z.infer<typeof youtubeSongSchema>>({
    resolver: zodResolver(youtubeSongSchema),
    defaultValues: {
        title: '',
        artist: '',
        characteristics: ''
    }
  });

  React.useEffect(() => {
    if (ytActionState?.title && ytActionState?.audioUrl) {
      youtubeSongForm.setValue('title', ytActionState.title);
      if (ytActionState.artist) {
        youtubeSongForm.setValue('artist', ytActionState.artist);
      }
    }
  }, [ytActionState, youtubeSongForm]);


  async function handleGenerateCharacteristics(index: number) {
    setGeneratingIndex(index);
    const song = fileUploadForm.getValues(`songs.${index}`);
    if (!song.title || !song.artist) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a title and artist first.',
      });
      setGeneratingIndex(null);
      return;
    }
    try {
      const result = await suggestCharacteristics({ title: song.title, artist: song.artist });
      fileUploadForm.setValue(`songs.${index}.characteristics`, result.join(', '));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate characteristics.',
      });
    } finally {
      setGeneratingIndex(null);
    }
  }

  async function handleGenerateYTCharacteristics() {
    setGeneratingIndex(0); // Only one song for YT
    const song = youtubeSongForm.getValues();
     if (!song.title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fetch a song first to get a title.',
      });
      setGeneratingIndex(null);
      return;
    }
     try {
      const result = await suggestCharacteristics({ title: song.title, artist: song.artist || '' });
      youtubeSongForm.setValue('characteristics', result.join(', '));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate characteristics.',
      });
    } finally {
      setGeneratingIndex(null);
    }
  }


  async function onFileUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
    try {
      const songsToSave = values.songs.map(s => ({
        title: s.title,
        artist: s.artist,
        characteristics: s.characteristics ? s.characteristics.split(',').map(c => c.trim()).filter(Boolean) : [],
        file: s.file[0] as File,
      }));

      const addedIds = await db.songs.bulkAdd(songsToSave, { allKeys: true });

      const newSongs: Song[] = songsToSave.map((s, i) => ({
          ...s,
          id: addedIds[i] as number,
          fileUrl: URL.createObjectURL(s.file),
      }));

      onSongsAdded(newSongs);

      toast({
        title: 'Music Added',
        description: `${values.songs.length} song(s) have been added to your library.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save songs to database", error);
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Could not save the songs. Please try again.',
      });
    }
  }
  
  async function onYouTubeSubmit(values: z.infer<typeof youtubeSongSchema>) {
    if (!ytActionState?.audioUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No audio URL found. Please fetch a song first.',
      });
      return;
    }

    setIsDownloadingFromYT(true);
    try {
        const response = await fetch(ytActionState.audioUrl);
        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const file = new File([blob], `${values.title}.mp3`, { type: 'audio/mpeg' });

        const songToSave = {
            title: values.title,
            artist: values.artist || 'Unknown Artist',
            characteristics: values.characteristics ? values.characteristics.split(',').map(c => c.trim()).filter(Boolean) : [],
            file: file,
        };

        const addedId = await db.songs.add(songToSave);

        const newSong: Song = {
            ...songToSave,
            id: addedId,
            fileUrl: URL.createObjectURL(file),
        };

        onSongsAdded([newSong]);
        toast({
            title: 'Music Added',
            description: `"${values.title}" has been added to your library.`,
        });
        onOpenChange(false);

    } catch (error) {
        console.error("Failed to download or save YouTube song", error);
        toast({
            variant: 'destructive',
            title: 'Download Error',
            description: 'Could not download the song from the provided URL. The link might have expired.',
        });
    } finally {
        setIsDownloadingFromYT(false);
    }
  }

  React.useEffect(() => {
    if (!open) {
      fileUploadForm.reset({
        songs: [{ title: '', artist: '', characteristics: '', file: undefined }],
      });
      youtubeSongForm.reset();
    }
  }, [open, fileUploadForm, youtubeSongForm]);
  
  const content = (
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Music</DialogTitle>
          <DialogDescription>
            Add songs to your Harmonica library.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="device" className="w-full pt-2">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="device"><Upload className="mr-2 h-4 w-4" />From Device</TabsTrigger>
                <TabsTrigger value="youtube"><Youtube className="mr-2 h-4 w-4" />From YouTube</TabsTrigger>
            </TabsList>
            <TabsContent value="device">
                <Form {...fileUploadForm}>
                  <form onSubmit={fileUploadForm.handleSubmit(onFileUploadSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-4 pr-2 max-h-[60vh] overflow-y-auto">
                      {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                          <h4 className="font-medium text-lg">Song #{index + 1}</h4>
                          <FormField
                              control={fileUploadForm.control}
                              name={`songs.${index}.file`}
                              render={({ field: { onChange, value, ...rest }}) => (
                                <FormItem>
                                  <FormLabel>Music File</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="file" 
                                      accept="audio/*"
                                      onChange={(e) => onChange(e.target.files)}
                                      {...rest}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={fileUploadForm.control}
                                name={`songs.${index}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Song Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={fileUploadForm.control}
                                name={`songs.${index}.artist`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Artist</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Artist Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                          </div>
                          <FormField
                              control={fileUploadForm.control}
                              name={`songs.${index}.characteristics`}
                              render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center justify-between">
                                        <span>Characteristics (Optional)</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleGenerateCharacteristics(index)}
                                            disabled={generatingIndex === index}
                                        >
                                            {generatingIndex === index ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Wand2 className="mr-2 h-4 w-4" />
                                            )}
                                            Generate with AI
                                        </Button>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. upbeat, indie, summer"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                              )}
                            />
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ title: '', artist: '', characteristics: '', file: undefined })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Song
                    </Button>
                    <DialogFooter>
                      <Button type="submit">Add to Library</Button>
                    </DialogFooter>
                  </form>
                </Form>
            </TabsContent>
             <TabsContent value="youtube">
                <form action={formAction} className="space-y-4 pt-4">
                    <div className='flex items-end gap-2'>
                        <div className="flex-grow">
                            <label htmlFor="yt-url" className='text-sm font-medium'>YouTube URL</label>
                            <Input id="yt-url" name="url" placeholder="https://www.youtube.com/watch?v=..." required />
                        </div>
                        <Button type="submit" disabled={isFetchingYT}>
                            {isFetchingYT ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Fetch Song
                        </Button>
                    </div>
                    {ytActionState?.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{ytActionState.error}</AlertDescription>
                        </Alert>
                    )}
                </form>

                {ytActionState?.audioUrl && (
                     <Form {...youtubeSongForm}>
                        <form onSubmit={youtubeSongForm.handleSubmit(onYouTubeSubmit)} className="space-y-4 pt-6 border-t mt-6">
                             <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={youtubeSongForm.control}
                                    name="title"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Song Title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={youtubeSongForm.control}
                                    name="artist"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Artist (Optional)</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Artist Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={youtubeSongForm.control}
                                name="characteristics"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            <span>Characteristics (Optional)</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleGenerateYTCharacteristics()}
                                                disabled={generatingIndex === 0}
                                            >
                                                {generatingIndex === 0 ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Wand2 className="mr-2 h-4 w-4" />
                                                )}
                                                Generate with AI
                                            </Button>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g. upbeat, indie, summer"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isDownloadingFromYT}>
                                    {isDownloadingFromYT ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Add to Library
                                </Button>
                            </DialogFooter>
                        </form>
                     </Form>
                )}
             </TabsContent>
        </Tabs>
      </DialogContent>
  );

  if (children) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {content}
        </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}
