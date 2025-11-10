'use client';

import { Music, Play, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Song } from '@/lib/types';
import * as React from 'react';
import { UploadMusicDialog } from './upload-music-dialog';

interface YourMusicProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onSongsAdded: (songs: Song[]) => void;
}

export function YourMusic({ songs, onPlaySong, onSongsAdded }: YourMusicProps) {
    const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
    
  return (
    <section>
      <h2 className="mb-4 text-3xl font-bold tracking-tight">Your Music</h2>
      <Card>
        <CardContent className="p-0">
          {songs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Artist</TableHead>
                  <TableHead className="hidden lg:table-cell">Genre</TableHead>
                  <TableHead className="hidden lg:table-cell">Mood</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song, index) => (
                  <TableRow key={index} className="group cursor-pointer" onClick={() => onPlaySong(song)}>
                    <TableCell>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlaySong(song);
                            }}
                        >
                            <Play className="h-5 w-5 fill-current" />
                        </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{song.artist}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{song.artist}</TableCell>
                    <TableCell className="hidden lg:table-cell">{song.genre}</TableCell>
                    <TableCell className="hidden lg:table-cell">{song.mood}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Music className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Your library is empty</h3>
              <p className="text-muted-foreground">Upload your first song to get started.</p>
               <UploadMusicDialog
                    open={isUploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                    onSongsAdded={onSongsAdded}
                >
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Music
                    </Button>
               </UploadMusicDialog>

            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
