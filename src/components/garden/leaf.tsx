'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Leaf as LeafIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
}

export function Leaf({ leaf, onClick }: LeafProps) {
  const [animationDelay, setAnimationDelay] = useState('0s');

  useEffect(() => {
    // Only run on the client to prevent hydration mismatch
    setAnimationDelay(`${Math.random() * 2}s`);
  }, []);

  const masteryLevel = calculateMasteryLevel(leaf.quests);

  const getMasteryColor = () => {
    const level = masteryLevel;
    // Sage Green (secondary) -> Forest Green (primary)
    // HSL for Sage: 110 20% 88%
    // HSL for Forest: 125 28% 25%

    if (level <= 20) {
      return `hsl(var(--secondary))`; // Sage Green
    }
    if (level > 80) {
      return `hsl(var(--primary))`; // Forest Green
    }
    
    // Interpolate between Sage and Forest
    const percentage = (level - 20) / 60;
    const h = 110 + (125 - 110) * percentage;
    const s = 20 + (28 - 20) * percentage;
    const l = 88 + (25 - 88) * percentage;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const isMastered = masteryLevel > 80;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-32 cursor-pointer flex-col items-center gap-1 rounded-lg p-2 transition-all hover:bg-accent/50',
        isMastered && 'animate-sway'
      )}
      style={{ animationDelay }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute bottom-0 h-1/2 w-0.5 bg-muted-foreground/30" />
        <LeafIcon
          className={cn(
            'size-10 text-primary-foreground transition-colors duration-500',
          )}
          style={{
            fill: getMasteryColor(),
            stroke: isMastered ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
          }}
        />
      </div>
      <p className="w-full truncate text-center text-sm text-muted-foreground group-hover:text-foreground">
        {leaf.name}
      </p>
    </button>
  );
}
