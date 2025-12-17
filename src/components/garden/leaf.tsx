'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Leaf as LeafIcon } from 'lucide-react';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
}

export function Leaf({ leaf, onClick }: LeafProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-32 cursor-pointer flex-col items-center gap-1 rounded-lg p-2 transition-all hover:bg-accent/50',
        leaf.isBloomed && 'animate-sway'
      )}
      style={{ animationDelay: `${Math.random() * 2}s` }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute bottom-0 h-1/2 w-0.5 bg-muted-foreground/30" />
        <LeafIcon
          className={cn(
            'size-10 transition-colors duration-500',
            leaf.isBloomed
              ? 'fill-primary text-primary-foreground/20'
              : 'fill-green-300/30 text-green-800/30'
          )}
        />
      </div>
      <p className="w-full truncate text-center text-sm text-muted-foreground group-hover:text-foreground">
        {leaf.name}
      </p>
    </button>
  );
}
