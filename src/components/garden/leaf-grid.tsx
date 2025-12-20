'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { Leaf } from './leaf';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface LeafGridProps {
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  searchQuery?: string;
}

export function LeafGrid({ leaves, onSelectLeaf, searchQuery = '' }: LeafGridProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2">
        {leaves.map((leaf) => (
          <CarouselItem key={leaf.id} className="basis-1/5 md:basis-1/8 lg:basis-1/10 pl-2">
            <Leaf
              leaf={leaf}
              onClick={() => onSelectLeaf(leaf)}
              searchQuery={searchQuery}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
