'use client';

import * as React from 'react';
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
import { Plus, Trash2, Wand2, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { suggestCharacteristics } from '@/ai/flows/suggest-characteristics-flow';
import { db } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const songSchema = z.object({
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
  songs: z.array(songSchema).min(1),
});

const youtubeImportSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
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
  const [isImporting, setIsImporting] = React.useState(false);

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      songs: [{ title: '', artist: '', characteristics: '', file: undefined }],
    },
  });

  const youtubeForm = useForm<z.infer<typeof youtubeImportSchema>>({
    resolver: zodResolver(youtubeImportSchema),
    defaultValues: {
      url: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'songs',
  });

  async function handleGenerateCharacteristics(index: number) {
    setGeneratingIndex(index);
    const song = form.getValues(`songs.${index}`);
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
      form.setValue(`songs.${index}.characteristics`, result.join(', '));
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


  async function onSubmit(values: z.infer<typeof uploadFormSchema>) {
    try {
      const songsToSave = values.songs.map(s => ({
        title: s.title,
        artist: s.artist,
        characteristics: s.characteristics ? s.characteristics.split(',').map(c => c.trim()).filter(Boolean) : [],
        file: s.file[0],
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

  async function onYoutubeSubmit(values: z.infer<typeof youtubeImportSchema>) {
    setIsImporting(true);
    toast({
        title: "Importing...",
        description: "Please wait while the song is being imported from YouTube."
    })
    // NOTE: Server action to be implemented in the next step.
    console.log('YouTube URL submitted:', values.url);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Placeholder for server action
    
    toast({
        title: "Feature in Progress",
        description: "The server-side logic for YouTube imports is next!"
    });
    setIsImporting(false);
    onOpenChange(false);
  }
  
  React.useEffect(() => {
    if (!open) {
      form.reset({
        songs: [{ title: '', artist: '', characteristics: '', file: undefined }],
      });
      youtubeForm.reset({ url: '' });
    }
  }, [open, form, youtubeForm]);
  
  const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,10.1A2.4,2.4 0 0,1 9.6,12.5A2.4,2.4 0 0,1 7.2,10.1C7.2,8.9 8.2,8 9.6,8C11,8 12,8.9 12,10.1M16.8,10.1A2.4,2.4 0 0,1 14.4,12.5A2.4,2.4 0 0,1 12,10.1C12,8.9 13,8 14.4,8C15.8,8 16.8,8.9 16.8,10.1M18,15.5H6V14C6,12.7 8.4,11.9 11,11.9C11.5,11.9 12.1,12 12.6,12.1L11.5,13.2L12.6,14.3L15.1,11.8L12.6,9.3L11.5,10.4L12.2,11.1C11.8,11.1 11.4,11.1 11,11.1C8.3,11.1 6.8,12.2 6.8,13.2V14.7H17.2V13.2C17.2,12.2 15.7,11.1 13,11.1C12.6,11.1 12.2,11.1 11.8,11.1L12.2,10.4L11.5,9.3L12.6,8.2L15.1,10.7L18,7.8L19.1,8.9L15.1,12.9L12.6,15.4L11.5,14.3L12.6,13.2L13.4,12.4C13.8,12.4 14.1,12.4 14.4,12.4C15.2,12.4 16,12.8 16.4,13.5L18,15.5Z" />
    </svg>
  );

  const content = (
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Music</DialogTitle>
          <DialogDescription>
            Add songs to your Harmonica library from your device or a YouTube link.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="device" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="device">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    From Device
                </TabsTrigger>
                <TabsTrigger value="youtube">
                    <YoutubeIcon className="mr-2 h-5 w-5" />
                    From YouTube
                </TabsTrigger>
            </TabsList>
            <TabsContent value="device">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-4 pr-2 max-h-[50vh] overflow-y-auto">
                      {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                          <h4 className="font-medium text-lg">Song #{index + 1}</h4>
                           <FormField
                              control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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
                              control={form.control}
                              name={`songs.${index}.characteristics`}
                              render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center justify-between">
                                        <span>Characteristics</span>
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
                <Form {...youtubeForm}>
                    <form onSubmit={youtubeForm.handleSubmit(onYoutubeSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={youtubeForm.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>YouTube URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isImporting}>
                                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                Import Song
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
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
