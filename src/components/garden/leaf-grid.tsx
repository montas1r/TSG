'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { Leaf } from './leaf';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEmblaCarousel } from '@/hooks/use-embla-carousel';
import Autoplay from "embla-carousel-autoplay"


interface LeafGridProps {
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  searchQuery?: string;
}

export function LeafGrid({ leaves, onSelectLeaf, searchQuery = '' }: LeafGridProps) {
  const [emblaRef] = useEmblaCarousel({ loop: false }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent ref={emblaRef} className="-ml-2">
        {leaves.map((leaf, index) => (
          <CarouselItem key={leaf.id} className="basis-auto pl-2">
             <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-24"
             >
                <Leaf
                leaf={leaf}
                onClick={() => onSelectLeaf(leaf)}
                searchQuery={searchQuery}
                />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
