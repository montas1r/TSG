import type { Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Leaf } from './leaf';

interface StemProps {
  stem: StemType;
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
}

export function Stem({ stem, onSelectLeaf, onAddLeaf }: StemProps) {
  return (
    <div className="space-y-8 rounded-lg border border-dashed bg-card/50 p-6">
      <h2 className="font-headline text-3xl text-foreground/80">{stem.name}</h2>
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted-foreground/30" />
        
        <div className="relative flex flex-wrap items-start justify-center gap-x-8 gap-y-12 py-8 sm:justify-around">
          {stem.leaves.map((leaf) => (
            <Leaf key={leaf.id} leaf={leaf} onClick={() => onSelectLeaf(leaf)} />
          ))}
          <div className="flex flex-col items-center gap-1 pt-2">
            <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
              <PlusCircle className="size-8 text-muted-foreground/50 transition-colors hover:text-primary" />
            </Button>
            <p className="w-24 text-center text-sm text-muted-foreground">New Skill</p>
          </div>
        </div>
      </div>
    </div>
  );
}
