
'use client';

import type { Stem, Leaf } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sprout, Wand2, Search, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StemItem } from './stem-item';
import type { User } from 'firebase/auth';

interface StemSelectorProps {
  stems: (Stem & { leaves: Leaf[] })[];
  selectedStemId: string | null;
  onSelectStem: (id: string) => void;
  onAddStem: () => void;
  onGetSuggestions: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  user: User;
}

export function StemSelector({
  stems,
  selectedStemId,
  onSelectStem,
  onAddStem,
  onGetSuggestions,
  onSearch,
  searchQuery,
  user,
}: StemSelectorProps) {
  return (
    <aside className="h-full w-72 flex-shrink-0 border-r bg-card/50 p-4 flex flex-col">
      <header className="shrink-0 pb-4 border-b">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Sprout className="size-8 text-primary" />
             <h1 className="font-headline text-2xl tracking-tight text-primary">Skill Garden</h1>
           </div>
        </div>
        <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
            placeholder="Search garden..."
            className="w-full pl-10 h-9"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            />
        </div>
      </header>

      <ScrollArea className="flex-grow my-4">
        <div className="space-y-1 pr-3">
          {stems.map((stem) => (
            <StemItem
              key={stem.id}
              stem={stem}
              isSelected={selectedStemId === stem.id}
              onClick={() => onSelectStem(stem.id)}
            />
          ))}
        </div>
      </ScrollArea>

      <footer className="shrink-0 pt-4 border-t space-y-2">
        <Button onClick={onAddStem} variant="ghost" className="w-full justify-start">
            <PlusCircle className="mr-2" />
            New Stem
        </Button>
        <Button onClick={onGetSuggestions} variant="ghost" className="w-full justify-start">
          <Wand2 className="mr-2" />
          Get Suggestions
        </Button>
      </footer>
    </aside>
  );
}
