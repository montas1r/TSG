
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { CheckCircle2, BookOpen } from 'lucide-react';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
  isSelected?: boolean;
}

const getMasteryFillColor = (mastery: number): string => {
  if (mastery < 25) return 'hsl(var(--mastery-0))';
  if (mastery < 50) return 'hsl(var(--mastery-1))';
  if (mastery < 75) return 'hsl(var(--mastery-2))';
  if (mastery < 100) return 'hsl(var(--mastery-3))';
  return 'hsl(var(--mastery-4))';
};

const getMasteryTextColor = (mastery: number): string => {
    if (mastery < 75) return 'hsl(var(--foreground))';
    return 'hsl(var(--background))';
}


export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {
  const masteryLevel = calculateMasteryLevel(leaf.quests);
  const isMastered = masteryLevel === 100;
  const fillColor = getMasteryFillColor(masteryLevel);
  const textColor = getMasteryTextColor(masteryLevel);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-transform duration-200 relative aspect-[4/5] w-full',
        'hover:-translate-y-1',
        isSelected && '-translate-y-1'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onClick() }}
      aria-label={`View details for ${leaf.name}`}
    >
      <svg viewBox="0 0 100 125" className={cn("absolute inset-0 w-full h-full transition-all drop-shadow-md group-hover:drop-shadow-xl", isSelected && "drop-shadow-xl")}>
        {isSelected && <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>}
        <path 
            d="M50,125 C20,100 0,70 0,50 C0,22.38 22.38,0 50,0 C77.62,0 100,22.38 100,50 C100,70 80,100 50,125 Z" 
            fill={fillColor}
            className={cn("transition-colors duration-300", isSelected && "stroke-primary stroke-[3px]")}
            style={isSelected ? { filter: 'url(#glow)'} : {}}
        />
      </svg>
      
      <div className="relative z-10 h-full p-4 flex flex-col justify-between text-center" style={{color: textColor}}>
          <h3 className="font-semibold tracking-tight leading-snug break-words">
             <Highlight text={leaf.name} query={searchQuery} />
          </h3>
          <div className="flex items-center justify-center gap-4 text-xs font-medium opacity-80 mt-2">
              <div className="flex items-center gap-1.5">
                  <BookOpen className="size-3" />
                  <span>
                      {leaf.quests?.filter(q => q.completed).length || 0}/{leaf.quests?.length || 0}
                  </span>
              </div>
              {isMastered && <CheckCircle2 className="size-4 text-white/80" />}
          </div>
      </div>
    </div>
  );
}

