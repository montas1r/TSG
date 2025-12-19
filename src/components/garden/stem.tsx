
'use client';

import { useMemo, useState } from 'react';
import type { Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { Highlight } from '../ui/highlight';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { HybridCarousel } from './hybrid-carousel';
import type { Stem as StemTypeWithLeaves } from '@/lib/types';

interface StemProps {
  stem: StemTypeWithLeaves;
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
  searchQuery?: string;
}

export function Stem({ stem, onSelectLeaf, onAddLeaf, searchQuery = '' }: StemProps) {
  const leafList = stem.leaves || [];
  const [isOpen, setIsOpen] = useState(true);

  const stemMastery = useMemo(() => {
    if (!leafList || leafList.length === 0) return 0;
    const totalMastery = leafList.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0);
    return totalMastery / leafList.length;
  }, [leafList]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative py-8">
      
      {/* Stem Header */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
            <h2 className="text-center font-headline text-3xl text-foreground/80">
                <Highlight text={stem.name} query={searchQuery} />
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
                <PlusCircle className="size-6 text-muted-foreground/50 transition-colors group-hover:text-primary" />
            </Button>
            <CollapsibleTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <ChevronDown className={cn("size-6 text-muted-foreground/50 transition-transform duration-300", isOpen && "rotate-180")} />
                    <span className="sr-only">{isOpen ? 'Collapse' : 'Expand'}</span>
                </Button>
            </CollapsibleTrigger>
        </div>
        <div className='mt-2 w-full max-w-xs px-4'>
            <Progress value={stemMastery} />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
            {leafList.length} {leafList.length === 1 ? 'Skill' : 'Skills'}
        </div>
      </div>
      
      <CollapsibleContent asChild>
        <div className="relative mt-8">
          {leafList.length > 0 ? (
             <HybridCarousel 
                leaves={leafList}
                onSelectLeaf={onSelectLeaf}
                searchQuery={searchQuery}
             />
          ) : (
            <div className="text-center text-muted-foreground py-4">No skills planted yet.</div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
