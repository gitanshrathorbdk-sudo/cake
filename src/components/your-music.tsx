'use client';

import { Music, Play, Search, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Song } from '@/lib/types';
import * as React from 'react';
import { UploadMusicDialog } from './upload-music-dialog';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';

interface YourMusicProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onSongsAdded: (songs: Song[]) => void;
  isLoading: boolean;
}

export function YourMusic({ songs, onPlaySong, onSongsAdded, isLoading }: YourMusicProps) {
    const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <section>
       <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Your Music</h2>
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by title or artist..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Artist</TableHead>
                  <TableHead className="hidden lg:table-cell">Characteristics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-64" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : songs.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Artist</TableHead>
                    <TableHead className="hidden lg:table-cell">Characteristics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSongs.map((song) => (
                    <TableRow key={song.id || song.fileUrl} className="group cursor-pointer" onClick={() => onPlaySong(song)}>
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
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {song.characteristics?.map(char => <Badge key={char} variant="secondary">{char}</Badge>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
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
