'use client';

import { useState, useMemo, useRef } from 'react';
import type { Leaf as LeafType, Stem as StemType } from '@/lib/types';
import { Stem } from '@/components/garden/stem';
import { LeafDetailsSheet } from '@/components/garden/leaf-details-sheet';
import { AddStemDialog } from '@/components/garden/add-stem-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wand2, Sprout, Search, Loader2 } from 'lucide-react';
import { AddLeafDialog } from '@/components/garden/add-leaf-dialog';
import { SuggestionDialog } from '@/components/garden/suggestion-dialog';
import { calculateMasteryLevel } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { User } from 'firebase/auth';
import { collection, doc, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';

export function Dashboard({ user }: { user: User }) {
  const [selectedLeaf, setSelectedLeaf] = useState<LeafType | null>(null);
  const [isLeafSheetOpen, setIsLeafSheetOpen] = useState(false);
  
  const [isAddStemOpen, setIsAddStemOpen] = useState(false);
  const [isAddLeafOpen, setIsAddLeafOpen] = useState(false);
  const [stemToAddLeafTo, setStemToAddLeafTo] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const firestore = useFirestore();

  const stemsRef = useMemoFirebase(() => collection(firestore, 'users', user.uid, 'stems'), [firestore, user.uid]);
  const { data: stems, isLoading: areStemsLoading } = useCollection<Omit<StemType, 'leaves'>>(stemsRef);
  
  const allLeavesQuery = useMemoFirebase(() => query(collection(firestore, `users/${user.uid}/leaves`)), [firestore, user.uid]);
  const { data: allLeavesFlat, isLoading: areLeavesLoading } = useCollection<LeafType>(allLeavesQuery);
  
  const leavesByStem = useMemo(() => {
    if (!allLeavesFlat) return {};
    return allLeavesFlat.reduce((acc, leaf) => {
        if (!acc[leaf.stemId]) {
            acc[leaf.stemId] = [];
        }
        acc[leaf.stemId].push(leaf);
        return acc;
    }, {} as Record<string, LeafType[]>);
  }, [allLeavesFlat]);

  const gardenWithLeaves = useMemo(() => {
    return (stems || []).map(stem => ({
      ...stem,
      leaves: leavesByStem[stem.id] || [],
    }));
  }, [stems, leavesByStem]);

  const progress = useMemo(() => {
    if (!allLeavesFlat || allLeavesFlat.length === 0) return 0;
    const totalMastery = allLeavesFlat.reduce((sum, leaf) => {
        const mastery = calculateMasteryLevel(leaf.quests);
        return sum + mastery;
    }, 0);
    const maxMastery = allLeavesFlat.length * 100;
    return maxMastery > 0 ? (totalMastery / maxMastery) * 100 : 0;
  }, [allLeavesFlat]);
  
  const currentSkillNames = useMemo(() => (allLeavesFlat || []).map(leaf => leaf.name), [allLeavesFlat]);

  const filteredGarden = useMemo(() => {
    if (!searchQuery) {
      return gardenWithLeaves;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    return gardenWithLeaves.map(stem => {
        const matchingLeaves = (stem.leaves || []).filter((leaf: LeafType) => {
            const inName = leaf.name.toLowerCase().includes(lowerCaseQuery);
            const inNotes = (leaf.notes || '').toLowerCase().includes(lowerCaseQuery);
            const inQuests = (leaf.quests || []).some(quest => quest.text.toLowerCase().includes(lowerCaseQuery));
            return inName || inNotes || inQuests;
        });

        if (stem.name.toLowerCase().includes(lowerCaseQuery)) {
             return { ...stem, leaves: matchingLeaves };
        }

        if (matchingLeaves.length > 0) {
            return { ...stem, leaves: matchingLeaves };
        }
        
        return null;
    }).filter((stem): stem is StemType => stem !== null);
  }, [gardenWithLeaves, searchQuery]);

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
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', updatedLeaf.id);
    setDocumentNonBlocking(leafRef, updatedLeaf, { merge: true });

    if (selectedLeaf && selectedLeaf.id === updatedLeaf.id) {
      setSelectedLeaf(updatedLeaf);
    }
  };
  
  const handleDeleteLeaf = (leafId: string) => {
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', leafId);
    deleteDocumentNonBlocking(leafRef);
  }

  const handleAddStem = (name: string) => {
    const stemId = uuidv4();
    const newStem = {
      name,
      userId: user.uid,
      id: stemId
    };
    const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
    setDocumentNonBlocking(stemRef, newStem, { merge: false });
  };
  
  const handleAddLeaf = (name: string, stemId: string) => {
    const leafId = uuidv4();
    const newLeaf: Omit<Leaf, 'id'> = {
        name,
        stemId,
        userId: user.uid,
        masteryLevel: 0,
        notes: '',
        link: '',
        quests: [{ id: uuidv4(), text: 'Explore the basics', completed: false }]
    };
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', leafId);
    setDocumentNonBlocking(leafRef, { ...newLeaf, id: leafId }, { merge: false });
  };
  
  const handleAddSkillBundle = (stemName: string, leafNames: string[]) => {
    const stemId = uuidv4();
    const newStem = {
      name: stemName,
      userId: user.uid,
      id: stemId
    };
    const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
    setDocumentNonBlocking(stemRef, newStem, { merge: false });

    leafNames.forEach(leafName => {
        handleAddLeaf(leafName, stemId);
    })
  }

  const handleOpenAddLeaf = (stemId: string) => {
    setStemToAddLeafTo(stemId);
    setIsAddLeafOpen(true);
  }

  if (areStemsLoading || areLeavesLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
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
          if (!stem) return null;
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
                    leaves={stem.leaves}
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
             {!searchQuery && (
              <Button onClick={() => setIsAddStemOpen(true)} className="mt-4">
                <Sprout className="mr-2" />
                Plant Your First Stem
              </Button>
            )}
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
        onDelete={() => selectedLeaf && handleDeleteLeaf(selectedLeaf.id)}
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
          onAddSkillBundle={handleAddSkillBundle}
      />
    </div>
  );
}
