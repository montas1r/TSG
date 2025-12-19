import { useMemo } from 'react';
import type { Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Leaf } from './leaf';
import { Highlight } from '../ui/highlight';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface StemProps {
  stem: Omit<StemType, 'leaves'>;
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
  searchQuery?: string;
}


export function Stem({ stem, leaves, onSelectLeaf, onAddLeaf, searchQuery = '' }: StemProps) {
  const leafList = leaves || [];
  
  const stemMastery = useMemo(() => {
    if (!leafList || leafList.length === 0) return 0;
    const totalMastery = leafList.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0);
    return totalMastery / leafList.length;
  }, [leafList]);

  return (
    <div className="relative py-12">
        {/* Central Stem Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700" />

        {/* Stem Header (Root of the Stem) */}
        <div className="relative z-10 mx-auto mb-12 flex w-full max-w-sm flex-col items-center">
            <div className="flex items-center gap-2">
                <h2 className="text-center font-headline text-3xl text-foreground/80">
                    <Highlight text={stem.name} query={searchQuery} />
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
                    <PlusCircle className="size-6 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                </Button>
            </div>
            <div className='mt-2 w-full px-4'>
                <Progress value={stemMastery} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
                {leafList.length} {leafList.length === 1 ? 'Skill' : 'Skills'}
            </div>
        </div>

        {/* Leaves Branching Out */}
        <div className="relative flex flex-col items-center gap-y-8">
            {leafList.map((leaf, index) => {
                const isRightSide = index % 2 !== 0;
                return (
                    <div 
                        key={leaf.id} 
                        className="relative flex w-full justify-center"
                        style={{ paddingLeft: isRightSide ? '5rem' : '0', paddingRight: !isRightSide ? '5rem' : '0'}}
                    >
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-300 dark:bg-neutral-700" />
                        <div className={`flex w-full ${isRightSide ? 'justify-start' : 'justify-end'}`}>
                            <div className="relative z-10 bg-background px-2">
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
    </div>
  );
}
