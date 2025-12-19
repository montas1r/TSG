
'use client';

import { useMemo } from 'react';
import type { Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical } from 'lucide-react';
import { Highlight } from '../ui/highlight';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { HybridCarousel } from './hybrid-carousel';
import type { Stem as StemTypeWithLeaves } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StemProps {
  stem: StemTypeWithLeaves;
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
  onEditStem: (stem: StemTypeWithLeaves) => void;
  onDeleteStem: (stemId: string) => void;
  searchQuery?: string;
}

export function Stem({ stem, onSelectLeaf, onAddLeaf, onEditStem, onDeleteStem, searchQuery = '' }: StemProps) {
  const leafList = stem.leaves || [];
  
  const stemMastery = useMemo(() => {
    if (!leafList || leafList.length === 0) return 0;
    const totalMastery = leafList.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0);
    return totalMastery / leafList.length;
  }, [leafList]);

  return (
    <div className="relative h-full flex flex-col p-6 bg-card rounded-lg">
      
      {/* Stem Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-grow">
            <h2 className="font-headline text-3xl text-foreground/80 truncate">
                <Highlight text={stem.name} query={searchQuery} />
            </h2>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {stem.description || `${leafList.length} ${leafList.length === 1 ? 'Skill' : 'Skills'}`}
            </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
                <PlusCircle className="size-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="size-5 text-muted-foreground/50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditStem(stem)}>
                        Edit Stem
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteStem(stem.id)} className="text-destructive">
                        Delete Stem
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className='mt-4 w-full'>
          <Progress value={stemMastery} indicatorColor={stem.color} />
      </div>
      
      <div className="relative mt-8 flex-grow flex items-center">
        {leafList.length > 0 ? (
            <HybridCarousel 
            leaves={leafList}
            onSelectLeaf={onSelectLeaf}
            searchQuery={searchQuery}
            />
        ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-8 rounded-lg border-2 border-dashed">
              <p className="font-headline text-xl">This stem is empty.</p>
              <p className="mb-4">Plant your first skill to get started.</p>
              <Button onClick={() => onAddLeaf(stem.id)}>
                <PlusCircle className="mr-2" /> Plant a Skill
              </Button>
            </div>
        )}
      </div>
    </div>
  );
}
