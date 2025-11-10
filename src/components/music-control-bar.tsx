'use client';
import * as React from 'react';
import { SkipBack, Play, Pause, SkipForward, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';

export function MusicControlBar() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(30);

  // This effect simulates song progress
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <footer className="sticky bottom-0 z-10 w-full border-t bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto grid h-24 grid-cols-3 items-center p-4">
        <div className="flex items-center gap-4">
          <Image
            src="https://picsum.photos/seed/currentSong/64/64"
            alt="Album Art"
            width={56}
            height={56}
            className="rounded-md"
            data-ai-hint="album cover"
          />
          <div className="hidden md:block">
            <p className="font-semibold text-foreground">Starlight Echoes</p>
            <p className="text-sm text-muted-foreground">Astral Projections</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden w-full max-w-xs items-center gap-2 text-xs lg:flex">
             <span>1:12</span>
             <Slider
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
             <span>4:02</span>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button variant="ghost" size="icon">
            <ListPlus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
