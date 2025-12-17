'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EmblaCarouselType } from 'embla-carousel';
import { useEmblaCarousel } from '@/hooks/use-embla-carousel';
import { Leaf as LeafType } from '@/lib/types';
import { Leaf } from './leaf';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const TWEEN_FACTOR = 1.2;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

type PropType = {
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  searchQuery?: string;
};

export const SkillCarousel: React.FC<PropType> = (props) => {
  const { leaves, onSelectLeaf, searchQuery } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    align: 'center',
    containScroll: 'trimSnaps',
  });
  const [tweenValues, setTweenValues] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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
      const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
      return numberWithinRange(tweenValue, 0, 1);
    });
    setTweenValues(styles);
  }, [emblaApi, setTweenValues]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onScroll);
  }, [emblaApi, onScroll]);

  return (
    <div className="relative flex items-center">
        <Button 
            variant="ghost" 
            size="icon" 
            className="hidden h-12 w-12 rounded-full sm:flex"
            onClick={scrollPrev}
        >
            <ChevronLeft className="h-6 w-6" />
        </Button>
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex items-center" style={{ backfaceVisibility: 'hidden' }}>
          {leaves.map((leaf, index) => (
            <div
              className="flex-shrink-0 flex-grow-0 basis-[33.33%] sm:basis-[20%] min-w-0"
              key={leaf.id}
              style={{
                ...(tweenValues.length && {
                  transform: `scale(${tweenValues[index]})`,
                  opacity: tweenValues[index] * 0.5 + 0.5, // Fade out further away leaves
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
        <Button 
            variant="ghost" 
            size="icon" 
            className="hidden h-12 w-12 rounded-full sm:flex"
            onClick={scrollNext}
        >
            <ChevronRight className="h-6 w-6" />
        </Button>
    </div>
  );
};
