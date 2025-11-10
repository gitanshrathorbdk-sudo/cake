import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function MusicGenreGrid() {
  const genres = PlaceHolderImages.slice(0, 12);

  return (
    <section>
      <h2 className="mb-4 text-3xl font-bold tracking-tight">Genres</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {genres.map((genre) => (
            <CarouselItem key={genre.id} className="md:basis-1/3 lg:basis-1/4">
              <div className="p-1">
                <Card className="overflow-hidden border-2 border-transparent transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="relative aspect-[4/3] p-0">
                    <Image
                      src={genre.imageUrl}
                      alt={genre.description}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={genre.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="absolute bottom-4 left-4 text-xl font-semibold text-white">
                      {genre.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
}
