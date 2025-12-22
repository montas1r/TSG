
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { CheckCircle2, BookOpen, Leaf as LeafIcon } from 'lucide-react';
import { Progress } from '../ui/progress';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
  isSelected?: boolean;
}

const getMasteryColor = (mastery: number, forIndicator: boolean = false): string => {
  if (forIndicator) {
      if (mastery < 25) return 'hsl(var(--mastery-1))';
      if (mastery < 50) return 'hsl(var(--mastery-2))';
      if (mastery < 75) return 'hsl(var(--mastery-3))';
      return 'hsl(var(--mastery-4))';
  }

  if (mastery < 25) return 'hsl(var(--mastery-1) / 0.1)';
  if (mastery < 50) return 'hsl(var(--mastery-2) / 0.1)';
  if (mastery < 75) return 'hsl(var(--mastery-3) / 0.1)';
  return 'hsl(var(--mastery-4) / 0.1)';
};

const getMasteryIconColor = (mastery: number): string => {
    if (mastery < 25) return 'hsl(var(--mastery-1))';
    if (mastery < 50) return 'hsl(var(--mastery-2))';
    if (mastery < 75) return 'hsl(var(--mastery-3))';
    return 'hsl(var(--mastery-4))';
}


export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {
  const masteryLevel = calculateMasteryLevel(leaf.quests);
  const isMastered = masteryLevel === 100;
  
  const cardBgColor = getMasteryColor(masteryLevel);
  const indicatorColor = getMasteryColor(masteryLevel, true);
  const iconColor = getMasteryIconColor(masteryLevel);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-all duration-200 relative w-full h-full p-4 rounded-xl border-2 flex flex-col justify-between',
        'hover:-translate-y-1 hover:shadow-lg',
        isSelected ? 'border-primary shadow-lg -translate-y-1' : 'border-transparent',
        isMastered ? 'bg-mastery-4/20' : 'bg-card'
      )}
      style={{
        backgroundColor: isSelected ? cardBgColor : undefined
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onClick() }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="flex justify-between items-start">
        <LeafIcon className="size-6 transition-colors" style={{ color: iconColor }}/>
        {isMastered && <CheckCircle2 className="size-5 text-green-500" />}
      </div>
      
      <div className='space-y-2'>
          <h3 className="font-semibold tracking-tight leading-snug break-words text-foreground">
             <Highlight text={leaf.name} query={searchQuery} />
          </h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <BookOpen className="size-3" />
                    <span>
                        {leaf.quests?.filter(q => q.completed).length || 0}/{leaf.quests?.length || 0}
                    </span>
                </div>
                <span>{masteryLevel}%</span>
            </div>
            <Progress value={masteryLevel} indicatorColor={indicatorColor} />
          </div>
      </div>
    </div>
  );
}

