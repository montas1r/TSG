'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Leaf as LeafIcon } from 'lucide-react';
import { Highlight } from '@/components/ui/highlight';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
}

export function Leaf({ leaf, onClick, searchQuery = '' }: LeafProps) {

  const masteryLevel = calculateMasteryLevel(leaf.quests);

  const getMasteryColor = () => {
    const level = masteryLevel;
    
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
        'group relative flex w-full aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg p-2 transition-all hover:bg-accent/10',
        isMastered && 'animate-pulse' // Using pulse for mastered skills now
      )}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
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
