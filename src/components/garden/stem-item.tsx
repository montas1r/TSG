'use client';

import { icons } from 'lucide-react';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import type { Stem, Leaf } from '@/lib/types';
import { AnimatedStemProgress } from './animated-stem-progress';

interface StemItemProps {
  stem: Stem & { leaves: Leaf[] };
  isSelected: boolean;
  onClick: () => void;
}

export function StemItem({ stem, isSelected, onClick }: StemItemProps) {
  const mastery = stem.leaves.length > 0 
    ? stem.leaves.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0) / stem.leaves.length
    : 0;

  const LucideIcon = icons[stem.icon as keyof typeof icons] || icons['Sprout'];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-2 group',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent/5'
      )}
      style={isSelected ? { '--stem-color': stem.color } as React.CSSProperties : {}}
    >
      <div className='flex items-center gap-3'>
        <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground'
        )}
        style={isSelected ? { backgroundColor: stem.color } : {}}>
          <LucideIcon className="size-5" />
        </div>
        <div className="flex-grow overflow-hidden">
          <p className={cn(
              "font-medium truncate",
              isSelected ? 'text-primary' : 'text-foreground'
          )} style={isSelected ? { color: stem.color } : {}}>{stem.name}</p>
          <p className="text-xs text-muted-foreground">
              {stem.leaves.length} {stem.leaves.length === 1 ? 'skill' : 'skills'}
          </p>
        </div>
      </div>
      <AnimatedStemProgress value={mastery} />
    </button>
  );
}
