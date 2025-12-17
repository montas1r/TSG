import type { Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Leaf } from './leaf';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface StemProps {
  stem: StemType;
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
}

export function Stem({ stem, onSelectLeaf, onAddLeaf }: StemProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed bg-card/50 p-6">
      <h2 className="font-headline text-3xl text-foreground/80">{stem.name}</h2>
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {stem.leaves.map((leaf) => (
              <Leaf key={leaf.id} leaf={leaf} onClick={() => onSelectLeaf(leaf)} />
            ))}
            <div className="flex w-32 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed">
                <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
                  <PlusCircle className="size-8 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                </Button>
                <p className="w-full truncate text-center text-sm text-muted-foreground">New Skill</p>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
