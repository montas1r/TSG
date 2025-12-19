import { useMemo } from 'react';
import type { Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Leaf } from './leaf';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Highlight } from '../ui/highlight';
import { HybridCarousel } from './hybrid-carousel';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface StemProps {
  stem: Omit<StemType, 'leaves'>;
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
  searchQuery?: string;
}

const StemTrunk = ({ progress }: { progress: number }) => {
    const height = 150; // The max height of the SVG
    const animatedHeight = (height + 16) * (progress / 100);
  
    // Interpolate color from border (hsl(40, 10%, 80%)) to primary (hsl(125, 28%, 25%))
    const percentage = progress / 100;
    const h = 40 + (125 - 40) * percentage;
    const s = 10 + (28 - 10) * percentage;
    const l = 80 + (25 - 80) * percentage;
    const animatedColor = `hsl(${h}, ${s}%, ${l}%)`;

    const pathD = `M 16,${height + 16} C 16,${height} 0,${height/1.5} 16,${height/2} C 32,${height/3} 16,${height/4} 16,0`;
    const pathLength = 250; // Approximate length of the curved path
  
    return (
      <div className="absolute left-0 -top-4 bottom-0 w-8" aria-hidden="true">
        <svg width="100%" height="100%" viewBox={`0 0 32 ${height + 16}`} preserveAspectRatio="xMidYMax meet">
          {/* Background Trunk */}
          <path d={pathD} stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
  
          {/* Animated Growth */}
          <path
            d={pathD}
            stroke={animatedColor}
            strokeWidth="4"
            fill="none"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - (animatedHeight / (height+16) * pathLength)}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 1s ease-in-out' }}
          />
        </svg>
      </div>
    );
};

export function Stem({ stem, leaves, onSelectLeaf, onAddLeaf, searchQuery = '' }: StemProps) {
  const leafList = leaves || [];
  const useCarousel = leafList.length > 4;

  const stemMastery = useMemo(() => {
    if (!leafList || leafList.length === 0) return 0;
    const totalMastery = leafList.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0);
    return totalMastery / leafList.length;
  }, [leafList]);

  return (
    <div className="relative pl-8">
       <StemTrunk progress={stemMastery} />
      <div className="space-y-4 rounded-lg border bg-card p-6 ml-8">
        <div className="flex items-center justify-between gap-4">
            <div className='flex-grow'>
                <div className="flex items-center gap-4">
                    <h2 className="font-headline text-3xl text-foreground/80">
                        <Highlight text={stem.name} query={searchQuery} />
                    </h2>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
                    <PlusCircle className="size-6 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                    </Button>
                </div>
                <div className='mt-2 pr-12'>
                    <Progress value={stemMastery} />
                </div>
            </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="font-bold">{leafList.length}</div>
            <div>{leafList.length === 1 ? 'Skill' : 'Skills'}</div>
          </div>
        </div>
        
        {useCarousel ? (
            <HybridCarousel 
              leaves={leafList} 
              onSelectLeaf={onSelectLeaf} 
              searchQuery={searchQuery} 
            />
        ) : (
          <div className="relative -ml-2">
              <ScrollArea>
                <div className="flex gap-0 pb-4">
                  {leafList.map((leaf) => (
                    <Leaf key={leaf.id} leaf={leaf} onClick={() => onSelectLeaf(leaf)} searchQuery={searchQuery} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
