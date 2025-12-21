
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { Card } from '../ui/card';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
  isSelected?: boolean;
}

const getMasteryStyles = (mastery: number): React.CSSProperties => {
  if (mastery < 25) return { '--leaf-bg': 'hsl(var(--mastery-0))', '--leaf-text': 'hsl(var(--foreground) / 0.8)' } as React.CSSProperties;
  if (mastery < 50) return { '--leaf-bg': 'hsl(var(--mastery-1))', '--leaf-text': 'hsl(var(--foreground) / 0.9)' } as React.CSSProperties;
  if (mastery < 75) return { '--leaf-bg': 'hsl(var(--mastery-2))', '--leaf-text': 'hsl(var(--foreground))' } as React.CSSProperties;
  if (mastery < 100) return { '--leaf-bg': 'hsl(var(--mastery-3))', '--leaf-text': 'hsl(var(--background))' } as React.CSSProperties;
  return { '--leaf-bg': 'hsl(var(--mastery-4))', '--leaf-text': 'hsl(var(--background))' } as React.CSSProperties;
};


export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {

  const masteryLevel = calculateMasteryLevel(leaf.quests);
  const isMastered = masteryLevel === 100;
  const masteryStyle = getMasteryStyles(masteryLevel);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-all duration-200 rounded-lg overflow-hidden h-full flex flex-col',
        'hover:shadow-xl hover:-translate-y-1 ',
        isSelected ? 'ring-2 ring-primary shadow-xl -translate-y-1' : 'shadow-md'
      )}
      style={masteryStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onClick() }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="flex-grow p-4 flex flex-col justify-between" style={{ backgroundColor: 'var(--leaf-bg)', color: 'var(--leaf-text)'}}>
          <h3 className="font-semibold tracking-tight leading-snug">
             <Highlight text={leaf.name} query={searchQuery} />
          </h3>
          <div className="flex items-center justify-between text-xs font-medium opacity-80 mt-4">
              <div className="flex items-center gap-1.5">
                  <BookOpen className="size-3" />
                  <span>
                      {leaf.quests?.filter(q => q.completed).length || 0} / {leaf.quests?.length || 0}
                  </span>
              </div>
          </div>
      </div>
      <div 
        className="h-2 w-full bg-black/10 relative overflow-hidden"
      >
        <div 
          className="absolute top-0 left-0 h-full bg-white/30 transition-all duration-500" 
          style={{ width: `${masteryLevel}%`}}
        />
        {isMastered && (
             <div className="absolute top-1/2 right-1 -translate-y-1/2">
                <CheckCircle2 className="size-4 text-white/80" />
            </div>
        )}
      </div>
    </div>
  );
}
