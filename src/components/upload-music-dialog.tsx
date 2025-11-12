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
import { Plus, Trash2, Wand2, Loader2, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { suggestCharacteristics } from '@/ai/flows/suggest-characteristics-flow';
import { db } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';

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

type UploadMusicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSongsAdded: (songs: Song[]) => void;
  children?: React.ReactNode;
};

export function UploadMusicDialog({ open, onOpenChange, onSongsAdded, children }: UploadMusicDialogProps) {
  const { toast } = useToast();
  const [generatingIndex, setGeneratingIndex] = React.useState<number | null>(null);
  
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [isImporting, setIsImporting] = React.useState(false);

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      songs: [{ title: '', artist: '', characteristics: '', file: undefined }],
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


  async function onDeviceSubmit(values: z.infer<typeof uploadFormSchema>) {
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

  const handleYoutubeImport = async () => {
    // Logic will be added in the next step
    toast({
        title: "Feature in progress",
        description: "YouTube import functionality is coming soon!",
    });
  };
  
  React.useEffect(() => {
    if (!open) {
      form.reset({
        songs: [{ title: '', artist: '', characteristics: '', file: undefined }],
      });
      setYoutubeUrl('');
    }
  }, [open, form]);

  const content = (
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Music</DialogTitle>
          <DialogDescription>
            Add songs to your Harmonica library from your device or a YouTube link.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="device" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="device">
              From Device
            </TabsTrigger>
            <TabsTrigger value="youtube">
              <Youtube className="mr-2 h-4 w-4" />
              From YouTube
            </TabsTrigger>
          </TabsList>
          <TabsContent value="device">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onDeviceSubmit)} className="space-y-6 pt-4">
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
            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube Video URL</Label>
                    <Input
                        id="youtube-url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={isImporting}
                    />
                </div>
                 <DialogFooter>
                    <Button onClick={handleYoutubeImport} disabled={isImporting || !youtubeUrl}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Youtube className="mr-2 h-4 w-4" />}
                        Import Song
                    </Button>
                 </DialogFooter>
            </div>
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
