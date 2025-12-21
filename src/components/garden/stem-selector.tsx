
'use client';

import type { Leaf, SearchableItem, Stem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sprout, Wand2, Search, PlusCircle, Book, CheckSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StemItem } from './stem-item';
import type { User } from 'firebase/auth';
import type { FuseResult } from 'fuse.js';
import { Highlight } from '../ui/highlight';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface StemSelectorProps {
  stems: (Stem & { leaves: Leaf[] })[];
  selectedStemId: string | null;
  onSelectStem: (id: string) => void;
  onAddStem: () => void;
  onEditStem: (updatedStem: Omit<Stem, 'leaves'>) => void;
  onGetSuggestions: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  user: User;
  searchResults: FuseResult<SearchableItem>[];
  onSearchResultClick: (item: SearchableItem) => void;
}

const getIconForType = (type: SearchableItem['type']) => {
  switch (type) {
    case 'stem': return <Sprout className="size-4" />;
    case 'leaf': return <Book className="size-4" />;
    case 'quest': return <CheckSquare className="size-4" />;
    default: return null;
  }
};

export function StemSelector({
  stems,
  selectedStemId,
  onSelectStem,
  onAddStem,
  onEditStem,
  onGetSuggestions,
  onSearch,
  searchQuery,
  user,
  searchResults,
  onSearchResultClick,
}: StemSelectorProps) {

  const groupedResults = useMemo(() => {
    if (!searchQuery) return null;
    return searchResults.reduce((acc, result) => {
      const type = result.item.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(result);
      return acc;
    }, {} as Record<SearchableItem['type'], FuseResult<SearchableItem>[]>);
  }, [searchResults, searchQuery]);

  const getInitials = (name: string | null) => {
    if (!name) return 'A'; // Anonymous
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <aside className="h-full w-72 flex-shrink-0 border-r bg-card/50 p-4 flex flex-col">
      <header className="shrink-0 pb-4 border-b">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Sprout className="size-8 text-primary" />
             <h1 className="font-heading text-2xl tracking-tight text-primary">Skill Garden</h1>
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

      {searchQuery ? (
        <ScrollArea className="flex-grow my-4">
          {groupedResults && Object.keys(groupedResults).length > 0 ? (
             <div className='pr-3 space-y-4'>
             {(['stem', 'leaf', 'quest'] as const).map(type => (
               groupedResults[type] && (
                 <div key={type}>
                   <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">{type}s</h3>
                   <div className="space-y-1">
                     {groupedResults[type].map(({ item, matches }) => (
                       <button
                         key={item.id}
                         onClick={() => onSearchResultClick(item)}
                         className="w-full text-left p-2 rounded-lg transition-colors hover:bg-accent flex items-start gap-3"
                       >
                         <div className="text-muted-foreground mt-1">
                          {getIconForType(item.type)}
                         </div>
                         <div className="flex-grow overflow-hidden">
                           <p className="font-medium truncate text-sm">
                             <Highlight text={'name' in item ? item.name : item.text} matches={matches} />
                           </p>
                           <p className="text-xs text-muted-foreground truncate">
                              {item.type === 'leaf' && item.stemName}
                              {item.type === 'quest' && item.leafName}
                           </p>
                         </div>
                       </button>
                     ))}
                   </div>
                 </div>
               )
             ))}
           </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-8">
                No results for &quot;{searchQuery}&quot;
            </div>
          )}
        </ScrollArea>
      ) : (
        <ScrollArea className="flex-grow my-4">
          <div className="space-y-1 pr-3">
            {stems.map((stem) => (
              <StemItem
                key={stem.id}
                stem={stem}
                isSelected={selectedStemId === stem.id}
                onClick={() => onSelectStem(stem.id)}
                onEdit={onEditStem}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <footer className="shrink-0 pt-4 border-t space-y-2">
        <div className="space-y-2 mb-2">
            <Button onClick={onAddStem} variant="ghost" className="w-full justify-start">
                <PlusCircle className="mr-2" />
                New Stem
            </Button>
            <Button onClick={onGetSuggestions} variant="ghost" className="w-full justify-start">
              <Wand2 className="mr-2" />
              Get Suggestions
            </Button>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className='font-heading bg-primary/20 text-primary'>
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <p className="font-medium text-foreground truncate">
                {user.displayName || 'Anonymous User'}
              </p>
              <p className="text-xs text-muted-foreground">
                UID: {user.uid.slice(0,10)}...
              </p>
            </div>
          </div>
        </div>
      </footer>
    </aside>
  );
}
