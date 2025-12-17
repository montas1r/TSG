'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { useEmblaCarousel } from '@/hooks/use-embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { Leaf as LeafType } from '@/lib/types';
import { Leaf } from '@/components/garden/leaf';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HybridCarouselProps {
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  searchQuery?: string;
  options?: EmblaOptionsType;
}

const TWEEN_FACTOR = 1.2;

export function HybridCarousel({
  leaves,
  onSelectLeaf,
  searchQuery = '',
  options,
}: HybridCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', ...options },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [tweenValues, setTweenValues] = useState<number[]>([]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();

    const styles = emblaApi.scrollSnapList().map((scrollSnap, index) => {
      let diffToTarget = scrollSnap - scrollProgress;

      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((loopItem) => {
          const target = loopItem.target();
          if (index === loopItem.index && target !== 0) {
            const sign = Math.sign(target);
            if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
            if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
          }
        });
      }
      return diffToTarget;
    });
    setTweenValues(styles);
  }, [emblaApi, setTweenValues]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onScroll);
  }, [emblaApi, onScroll]);

  return (
    <div className="relative group">
       <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={scrollPrev}>
            <ArrowLeft />
       </Button>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex" style={{ perspective: '1000px' }}>
          {leaves.map((leaf, index) => (
            <div
              className="flex-shrink-0 flex-grow-0 basis-1/4 min-w-0 pl-4 relative"
              key={leaf.id}
              style={{
                ...(tweenValues.length && {
                    transform: `scale(${1 - Math.abs(tweenValues[index]) * TWEEN_FACTOR})`,
                    opacity: 1 - Math.abs(tweenValues[index]),
                }),
              }}
            >
              <Leaf
                leaf={leaf}
                onClick={() => onSelectLeaf(leaf)}
                searchQuery={searchQuery}
              />
            </div>
          ))}
        </div>
      </div>
       <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={scrollNext}>
            <ArrowRight />
       </Button>
    </div>
  );
}
