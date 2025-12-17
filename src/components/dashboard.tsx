'use client';

import { useState, useMemo, useRef } from 'react';
import type { Garden, Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { initialGarden } from '@/lib/data';
import { Stem } from '@/components/garden/stem';
import { LeafDetailsSheet } from '@/components/garden/leaf-details-sheet';
import { AddStemDialog } from '@/components/garden/add-stem-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wand2, Sprout, Search } from 'lucide-react';
import { AddLeafDialog } from '@/components/garden/add-leaf-dialog';
import { SuggestionDialog } from '@/components/garden/suggestion-dialog';
import { calculateMasteryLevel } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useVirtualizer } from '@tanstack/react-virtual';

export function Dashboard() {
  const [garden, setGarden] = useState<Garden>(initialGarden);
  const [selectedLeaf, setSelectedLeaf] = useState<LeafType | null>(null);
  const [isLeafSheetOpen, setIsLeafSheetOpen] = useState(false);
  
  const [isAddStemOpen, setIsAddStemOpen] = useState(false);
  const [isAddLeafOpen, setIsAddLeafOpen] = useState(false);
  const [stemToAddLeafTo, setStemToAddLeafTo] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allLeaves = useMemo(() => garden.flatMap(stem => stem.leaves), [garden]);

  const progress = useMemo(() => {
    if (allLeaves.length === 0) return 0;
    const totalMastery = allLeaves.reduce((sum, leaf) => {
        const mastery = calculateMasteryLevel(leaf.quests);
        return sum + mastery;
    }, 0);
    const maxMastery = allLeaves.length * 100;
    return maxMastery > 0 ? (totalMastery / maxMastery) * 100 : 0;
  }, [allLeaves]);
  
  const currentSkillNames = allLeaves.map(leaf => leaf.name);

  const filteredGarden = useMemo(() => {
    if (!searchQuery) {
      return garden;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    return garden.map(stem => {
        const matchingLeaves = stem.leaves.filter(leaf => {
            const inName = leaf.name.toLowerCase().includes(lowerCaseQuery);
            const inNotes = leaf.notes.toLowerCase().includes(lowerCaseQuery);
            const inQuests = leaf.quests.some(quest => quest.text.toLowerCase().includes(lowerCaseQuery));
            return inName || inNotes || inQuests;
        });

        if (stem.name.toLowerCase().includes(lowerCaseQuery)) {
            // If stem name matches, we can decide if we want to show all its leaves or just the matching ones.
            // For now, let's show the stem with its matching leaves. If no leaves match, the stem header will still show.
            return { ...stem, leaves: matchingLeaves };
        }

        if (matchingLeaves.length > 0) {
            return { ...stem, leaves: matchingLeaves };
        }
        
        return null;
    }).filter((stem): stem is StemType => stem !== null);
  }, [garden, searchQuery]);

  // Virtualization logic
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredGarden.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // Estimate height for a stem component
    overscan: 5,
  });

  const handleSelectLeaf = (leaf: LeafType) => {
    setSelectedLeaf(leaf);
    setIsLeafSheetOpen(true);
  };

  const handleSaveLeaf = (updatedLeaf: LeafType) => {
    const newGarden = garden.map((stem) => ({
      ...stem,
      leaves: stem.leaves.map((leaf) =>
        leaf.id === updatedLeaf.id ? updatedLeaf : leaf
      ),
    }));
    setGarden(newGarden);
    // Also update the selectedLeaf in case the sheet is still open
    if (selectedLeaf && selectedLeaf.id === updatedLeaf.id) {
      setSelectedLeaf(updatedLeaf);
    }
  };
  
  const handleDeleteLeaf = (leafId: string) => {
    setGarden(
        garden.map((stem) => ({
            ...stem,
            leaves: stem.leaves.filter((leaf) => leaf.id !== leafId)
        }))
    );
  }

  const handleAddStem = (name: string) => {
    const newStem: StemType = {
      id: `stem-${Date.now()}`,
      name,
      leaves: [],
    };
    setGarden([newStem, ...garden]);
  };

  const handleOpenAddLeaf = (stemId: string) => {
    setStemToAddLeafTo(stemId);
    setIsAddLeafOpen(true);
  }

  const handleAddLeaf = (name: string, stemId: string) => {
    const newLeaf: LeafType = {
        id: `leaf-${Date.now()}`,
        name,
        stemId,
        masteryLevel: 0, // Will be calculated
        notes: '',
        link: '',
        quests: [
            { id: `quest-${Date.now()}`, text: 'Read the official documentation', completed: false }
        ]
    };
    setGarden(garden.map(stem => {
        if (stem.id === stemId) {
            return {
                ...stem,
                leaves: [newLeaf, ...stem.leaves]
            }
        }
        return stem;
    }));
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <header className="mb-6 shrink-0">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg border bg-card p-6 sm:flex-row">
          <div className="text-center sm:text-left">
              <div className="flex items-center gap-4">
                <h1 className="font-headline text-4xl tracking-tight text-primary">The Skill Garden</h1>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsAddStemOpen(true)} aria-label="Plant a New Stem">
                    <Sprout className="size-6 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                </Button>
              </div>
              <p className="text-muted-foreground">Nurture your skills and watch them grow.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search your garden..."
                className="w-full pl-10 sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsSuggestionOpen(true)} className="w-full sm:w-auto">
                <Wand2 className="mr-2" />
                Get Suggestions
            </Button>
          </div>
        </div>
        <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Overall Mastery</span>
                <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
        </div>
      </header>
      
      <main ref={parentRef} className="flex-grow space-y-8 overflow-y-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const stem = filteredGarden[virtualItem.index];
          return (
             <div
                key={virtualItem.key}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                }}
             >
                <Stem 
                    stem={stem} 
                    onSelectLeaf={handleSelectLeaf}
                    onAddLeaf={handleOpenAddLeaf}
                    searchQuery={searchQuery}
                />
            </div>
          )
        })}
        </div>
        {!rowVirtualizer.getVirtualItems().length && (
           <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 text-center">
            <h3 className="font-headline text-2xl">
              {searchQuery ? "No skills found" : "Your garden is empty"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term." : "Start by planting a new stem for your skills."}
            </p>
          </div>
        )}
      </main>

      <LeafDetailsSheet
        leaf={selectedLeaf}
        isOpen={isLeafSheetOpen}
        onOpenChange={(open) => {
            if (!open) setSelectedLeaf(null);
            setIsLeafSheetOpen(open);
        }}
        onSave={handleSaveLeaf}
        onDelete={handleDeleteLeaf}
        searchQuery={searchQuery}
      />
      
      <AddStemDialog
        isOpen={isAddStemOpen}
        onOpenChange={setIsAddStemOpen}
        onAddStem={handleAddStem}
      />

      <AddLeafDialog
        isOpen={isAddLeafOpen}
        onOpenChange={setIsAddLeafOpen}
        onAddLeaf={handleAddLeaf}
        stemId={stemToAddLeafTo}
      />

      <SuggestionDialog 
          isOpen={isSuggestionOpen}
          onOpenChange={setIsSuggestionOpen}
          currentSkills={currentSkillNames}
      />
    </div>
  );
}
