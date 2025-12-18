import type { Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Leaf } from './leaf';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Highlight } from '../ui/highlight';
import { HybridCarousel } from './hybrid-carousel';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface StemProps {
  stem: StemType;
  onSelectLeaf: (leaf: LeafType) => void;
  onAddLeaf: (stemId: string) => void;
  searchQuery?: string;
  user: User;
}

export function Stem({ stem, onSelectLeaf, onAddLeaf, searchQuery = '', user }: StemProps) {
  const firestore = useFirestore();
  const leavesRef = useMemoFirebase(
    () => collection(firestore, 'users', user.uid, 'stems', stem.id, 'leaves'),
    [firestore, user.uid, stem.id]
  );
  const { data: leaves } = useCollection<LeafType>(leavesRef);

  const leafList = leaves || [];
  const useCarousel = leafList.length > 1;

  return (
    <div className="space-y-4 rounded-lg border border-dashed bg-card/50 p-6">
      <div className="flex items-center gap-4">
        <h2 className="font-headline text-3xl text-foreground/80">
          <Highlight text={stem.name} query={searchQuery} />
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
          <PlusCircle className="size-6 text-muted-foreground/50 transition-colors group-hover:text-primary" />
        </Button>
      </div>
      
      {useCarousel ? (
          <HybridCarousel 
            leaves={leafList} 
            onSelectLeaf={onSelectLeaf} 
            searchQuery={searchQuery} 
          />
      ) : (
        <div className="relative">
            <ScrollArea>
              <div className="flex gap-4 pb-4">
                {leafList.map((leaf) => (
                  <Leaf key={leaf.id} leaf={leaf} onClick={() => onSelectLeaf(leaf)} searchQuery={searchQuery} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      )}
    </div>
  );
}

    