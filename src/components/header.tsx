import { Logo } from '@/components/logo';
import { UploadMusicDialog } from '@/components/upload-music-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-card/80 p-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Harmonica
        </h1>
      </div>
      <UploadMusicDialog />
    </header>
  );
}
