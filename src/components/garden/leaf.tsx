
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { Leaf as LeafIcon } from 'lucide-react';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
  isSelected?: boolean;
}

const getMasteryColor = (mastery: number): string => {
  if (mastery <= 0) return 'hsl(var(--muted-foreground) / 0.5)';
  if (mastery >= 100) return 'hsl(var(--mastery-4))';

  // Define HSL color stops
  const startColor = { h: 215, s: 16, l: 47 }; // Muted Foreground
  const endColor = { h: 145, s: 70, l: 30 };   // Mastery-4 Green

  // Calculate interpolated HSL values
  const percentage = mastery / 100;
  const h = startColor.h + (endColor.h - startColor.h) * percentage;
  const s = startColor.s + (endColor.s - startColor.s) * percentage;
  const l = startColor.l + (endColor.l - startColor.l) * percentage;
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {
  const color = getMasteryColor(leaf.masteryLevel);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent/5'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex items-center justify-center">
          <LeafIcon
              className={cn(
                  'size-16 transition-all duration-300 group-hover:scale-110',
                  isSelected && 'scale-110'
              )}
              style={{ 
                  color, 
                  fill: isSelected ? `${color}4D` : `${color}26`,
                  transition: 'color 300ms ease-in-out, fill 300ms ease-in-out'
              }}
          />
      </div>
      <p className="w-24 text-center text-xs font-medium text-foreground truncate">
          <Highlight text={leaf.name} query={searchQuery} />
      </p>
    </div>
  );
}
