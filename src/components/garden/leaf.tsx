
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { Progress } from '../ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
  isSelected?: boolean;
}

export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {

  const masteryLevel = calculateMasteryLevel(leaf.quests);
  const isMastered = masteryLevel === 100;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'bg-card'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter') onClick() }}
      aria-label={`View details for ${leaf.name}`}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold tracking-tight">
           <Highlight text={leaf.name} query={searchQuery} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-3">
             <Progress value={masteryLevel} className="h-2 w-full" />
             {isMastered ? (
                <CheckCircle2 className="size-5 text-green-500 shrink-0"/>
             ) : (
                <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums">
                    {masteryLevel}%
                </span>
             )}
          </div>
           {leaf.quests && leaf.quests.length > 0 && (
             <p className="text-xs text-muted-foreground mt-2">
                {leaf.quests.filter(q => q.completed).length} / {leaf.quests.length} quests
             </p>
           )}
      </CardContent>
    </Card>
  );
}

    