
'use client';

import { useMemo, useState } from 'react';
import type { Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { Leaf } from './leaf';
import { Highlight } from '../ui/highlight';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface StemProps {
  stem: Omit<StemType, 'leaves'>;
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
  searchQuery?: string;
}

export function Stem({ stem, leaves, onSelectLeaf, onAddLeaf, searchQuery = '' }: StemProps) {
  const leafList = leaves || [];
  const [isOpen, setIsOpen] = useState(true);

  const stemMastery = useMemo(() => {
    if (!leafList || leafList.length === 0) return 0;
    const totalMastery = leafList.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0);
    return totalMastery / leafList.length;
  }, [leafList]);

  // Base height for each leaf section + some padding
  const baseHeight = 110; 
  const containerHeight = isOpen ? leafList.length * baseHeight + 150 : 150;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative py-8">
      <div 
        className="absolute top-0 bottom-0 left-1/2 w-1.5 -translate-x-1/2 bg-gradient-to-b from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 transition-all duration-700 ease-in-out rounded-full" 
        style={{ height: `${containerHeight}px`}}
      />
      
      {/* Stem Header (Root of the Stem) */}
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
        <div className="relative mt-12">
            {leafList.map((leaf, index) => {
                const isRightSide = index % 2 !== 0;
                // Staggering values
                const horizontalShift = 50 + (index % 3) * 20; // 50, 70, 90
                const verticalOffset = (index % 4) * 5; // 0, 5, 10, 15
                
                return (
                    <div 
                        key={leaf.id} 
                        className="group absolute w-full transition-transform duration-300 ease-out"
                        style={{
                            top: `${index * baseHeight + verticalOffset}px`,
                            transform: `translateX(${isRightSide ? horizontalShift : -horizontalShift}px)`,
                        }}
                    >
                         <div className={`relative flex items-center ${isRightSide ? 'justify-start' : 'justify-end'}`}>
                            {/* SVG Branch Connector */}
                            <svg 
                                className="absolute z-0 text-neutral-300 dark:text-neutral-700 transition-transform duration-300 ease-out group-hover:scale-105"
                                width="120" height="80" 
                                viewBox="0 0 120 80"
                                style={{
                                    left: isRightSide ? '-50px' : 'auto',
                                    right: isRightSide ? 'auto' : '-50px',
                                    top: '50%',
                                    transform: `translateY(-50%) ${isRightSide ? '' : 'scaleX(-1)'}`,
                                    overflow: 'visible'
                                }}
                            >
                                <path 
                                    d="M0,40 C 40,40 60,10 120,40" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    fill="none" 
                                />
                            </svg>
                            {/* Leaf Component */}
                            <div className="relative z-10 transition-transform duration-300 ease-out group-hover:scale-110">
                                <Leaf 
                                    leaf={leaf}
                                    onClick={() => onSelectLeaf(leaf)}
                                    searchQuery={searchQuery}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
