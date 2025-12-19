
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Leaf as LeafIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Highlight } from '@/components/ui/highlight';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
}

export function Leaf({ leaf, onClick, searchQuery = '' }: LeafProps) {
  const [animationDelay, setAnimationDelay] = useState('0s');

  useEffect(() => {
    // Only run on the client to prevent hydration mismatch
    setAnimationDelay(`${Math.random() * 2}s`);
  }, []);

  const masteryLevel = calculateMasteryLevel(leaf.quests);

  const getMasteryColor = () => {
    const level = masteryLevel;
    // Interpolate between secondary and primary colors based on mastery
    // HSL for Sage (secondary): 110 20% 88%
    // HSL for Forest (primary): 125 28% 25%
    
    const percentage = level / 100;

    // Using the new theme's mastery colors from globals.css
    if (level <= 1) return 'hsl(var(--mastery-0))';
    if (level <= 25) return 'hsl(var(--mastery-1))';
    if (level <= 50) return 'hsl(var(--mastery-2))';
    if (level <= 75) return 'hsl(var(--mastery-3))';
    return 'hsl(var(--mastery-4))';
  };

  const isMastered = masteryLevel > 80;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-36 cursor-pointer flex-col items-center gap-1 rounded-lg p-2 transition-all hover:bg-accent/10',
        isMastered && 'animate-sway'
      )}
      style={{ animationDelay }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <LeafIcon
          className={cn(
            'size-10 text-primary-foreground transition-colors duration-500',
          )}
          style={{
            fill: getMasteryColor(),
            stroke: isMastered ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
          }}
        />
      </div>
      <p className="w-full truncate text-center text-sm text-muted-foreground group-hover:text-foreground">
        <Highlight text={leaf.name} query={searchQuery} />
      </p>
    </button>
  );
}
