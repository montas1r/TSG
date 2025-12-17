'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Leaf as LeafIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
}

export function Leaf({ leaf, onClick }: LeafProps) {
  const [animationDelay, setAnimationDelay] = useState('0s');

  useEffect(() => {
    // This code runs only on the client, after hydration
    setAnimationDelay(`${Math.random() * 2}s`);
  }, []);

  const getMasteryColor = () => {
    const level = leaf.masteryLevel;
    if (level <= 20) return 'hsl(var(--primary) / 0.2)'; // Soft Lavender
    if (level > 20 && level <= 80) {
      const percentage = (level - 20) / 60;
      // This is a simple interpolation. For a true gradient feel, we'd need more complex logic
      // or rely on CSS `background: linear-gradient`. However, for fill, we interpolate.
      // HSL: 250, 60%, 90% (Lavender) -> 330, 40%, 80% (Rose)
      const h = 250 + (330 - 250) * percentage;
      const s = 60 + (40 - 60) * percentage;
      const l = 90 + (80 - 90) * percentage;
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    return 'hsl(var(--accent) / 0.5)'; // Muted Rose with higher opacity
  };

  const isMastered = leaf.masteryLevel > 80;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-32 cursor-pointer flex-col items-center gap-1 rounded-lg p-2 transition-all hover:bg-accent/20',
        isMastered && 'animate-sway'
      )}
      style={{ animationDelay }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute bottom-0 h-1/2 w-0.5 bg-muted-foreground/30" />
        <LeafIcon
          className={cn(
            'size-10 transition-colors duration-500',
             isMastered ? 'text-accent-foreground/30' : 'text-primary-foreground/30',
          )}
          style={{
            fill: getMasteryColor(),
          }}
        />
      </div>
      <p className="w-full truncate text-center text-sm text-muted-foreground group-hover:text-foreground">
        {leaf.name}
      </p>
    </button>
  );
}
