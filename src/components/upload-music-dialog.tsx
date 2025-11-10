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
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  genre: z.string().optional(),
  mood: z.string().optional(),
});

const uploadFormSchema = z.object({
  songs: z.array(songSchema).min(1),
});

export function UploadMusicDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      songs: [{ title: '', artist: '', genre: '', mood: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'songs',
  });

  function onSubmit(values: z.infer<typeof uploadFormSchema>) {
    console.log(values);
    toast({
      title: 'Music Added',
      description: `${values.songs.length} song(s) have been added to your library.`,
    });
    setOpen(false);
    form.reset();
  }
  
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Music
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload From Device</DialogTitle>
          <DialogDescription>
            Add songs to your Harmonica library. Metadata can be edited later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                  <h4 className="font-medium text-lg">Song #{index + 1}</h4>
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
                   <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`songs.${index}.genre`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genre</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Indie, Pop" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`songs.${index}.mood`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mood</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Happy, Melancholic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </div>
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
              onClick={() => append({ title: '', artist: '', genre: '', mood: '' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Song
            </Button>
            <DialogFooter>
              <Button type="submit">Add Music</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
