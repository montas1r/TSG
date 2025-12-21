
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Leaf as LeafType, Stem as StemType, SearchableItem } from '@/lib/types';
import { Stem } from '@/components/garden/stem';
import { AddStemDialog } from '@/components/garden/add-stem-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AddLeafDialog } from '@/components/garden/add-leaf-dialog';
import { SuggestionDialog } from '@/components/garden/suggestion-dialog';
import { SuggestSkillsDialog } from '@/components/garden/suggest-skills-dialog';
import type { User } from 'firebase/auth';
import { collection, doc, query, deleteDoc, orderBy, writeBatch, where, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import { StemSelector } from '@/components/garden/stem-selector';
import Fuse from 'fuse.js';
import { useToast } from '@/hooks/use-toast';
import { safeSetDoc } from '@/lib/firestore-safe';

export function Dashboard({ user }: { user: User }) {
  const [selectedLeaf, setSelectedLeaf] = useState<LeafType | null>(null);
  
  const [isAddStemOpen, setIsAddStemOpen] = useState(false);
  
  const [isAddLeafOpen, setIsAddLeafOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isSuggestSkillsOpen, setIsSuggestSkillsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStemId, setSelectedStemId] = useState<string | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();

  const stemsQuery = useMemoFirebase(() => query(collection(firestore, 'users', user.uid, 'stems'), orderBy('createdAt', 'desc')), [firestore, user.uid]);
  const { data: stems, isLoading: areStemsLoading } = useCollection<Omit<StemType, 'leaves'>>(stemsQuery);
  
  const allLeavesQuery = useMemoFirebase(() => query(collection(firestore, `users/${user.uid}/leaves`)), [firestore, user.uid]);
  const { data: allLeavesFlat, isLoading: areLeavesLoading } = useCollection<LeafType>(allLeavesQuery);
  
  useEffect(() => {
    if (!selectedStemId && stems && stems.length > 0) {
      setSelectedStemId(stems[0].id);
    }
     // If the selected stem is deleted, select the first available stem
    if (selectedStemId && stems && !stems.some(s => s.id === selectedStemId)) {
      setSelectedStemId(stems.length > 0 ? stems[0].id : null);
    }
  }, [stems, selectedStemId]);

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

  const gardenWithLeaves: StemType[] = useMemo(() => {
    return (stems || []).map(stem => ({
      ...stem,
      leaves: leavesByStem[stem.id] || [],
    }));
  }, [stems, leavesByStem]);

  const currentSkillNames = useMemo(() => (allLeavesFlat || []).map(leaf => leaf.name), [allLeavesFlat]);

  // --- Search Logic ---
  const searchableData = useMemo<SearchableItem[]>(() => {
    const data: SearchableItem[] = [];
    if (stems) {
      data.push(...stems.map(s => ({ ...s, type: 'stem' } as const)));
    }
    if (allLeavesFlat) {
      const leavesWithStemName = allLeavesFlat.map(l => {
        const stemName = stems?.find(s => s.id === l.stemId)?.name || 'Unknown Stem';
        return { ...l, stemName, type: 'leaf' } as const;
      });
      data.push(...leavesWithStemName);

      // Add quests
      for (const leaf of leavesWithStemName) {
        if (leaf.quests) {
          data.push(...leaf.quests.map(q => ({ ...q, type: 'quest', leafName: leaf.name, stemId: leaf.stemId } as const)))
        }
      }
    }
    return data;
  }, [stems, allLeavesFlat]);

  const fuse = useMemo(() => new Fuse(searchableData, {
      keys: [
          { name: 'name', weight: 3 }, // For Stems and Leaves
          { name: 'text', weight: 2 }, // For Quests
          { name: 'description', weight: 1 },
      ],
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true,
  }), [searchableData]);

  const searchResults = useMemo(() => {
      if (!searchQuery) return [];
      return fuse.search(searchQuery);
  }, [searchQuery, fuse]);
  // --- End Search Logic ---

  const handleSearchResultClick = (item: SearchableItem) => {
    setSearchQuery(''); // Clear search
    if (item.type === 'stem') {
      setSelectedStemId(item.id);
      setSelectedLeaf(null);
    } else if (item.type === 'leaf') {
      setSelectedStemId(item.stemId);
      // find the full leaf object to select it
      const leafToSelect = allLeavesFlat?.find(l => l.id === item.id);
      if (leafToSelect) {
        setSelectedLeaf(leafToSelect);
      }
    } else if (item.type === 'quest') {
      setSelectedStemId(item.stemId);
      const leafToSelect = allLeavesFlat?.find(l => l.stemId === item.stemId && l.name === item.leafName);
      if (leafToSelect) {
        setSelectedLeaf(leafToSelect);
      }
    }
  };

  const selectedStem = useMemo(() => {
    return gardenWithLeaves.find(stem => stem.id === selectedStemId) || null;
  }, [gardenWithLeaves, selectedStemId]);

  useEffect(() => {
    if (selectedLeaf) {
      // Find the "live" version of the selected leaf from the collection
      const liveLeaf = allLeavesFlat?.find(l => l.id === selectedLeaf.id);
      
      // If the live version exists and is different from the current one, update it.
      if (liveLeaf && JSON.stringify(liveLeaf) !== JSON.stringify(selectedLeaf)) {
        setSelectedLeaf(liveLeaf);
      } else if (!liveLeaf) {
        // If the leaf was deleted from the collection (e.g. by another client), deselect it.
        setSelectedLeaf(null);
      }
    }
  }, [allLeavesFlat, selectedLeaf]);

  // When the selected stem changes, clear the selected leaf.
  useEffect(() => {
    setSelectedLeaf(null);
  }, [selectedStemId]);



  const handleSelectLeaf = (leaf: LeafType) => {
    setSelectedLeaf(leaf);
  };

  const handleSaveLeaf = useCallback((updatedLeaf: LeafType) => {
    if (!firestore || !user?.uid) return;
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', updatedLeaf.id);
    safeSetDoc(leafRef, updatedLeaf, { merge: true });
  }, [firestore, user?.uid]);
  
  const handleDeleteLeaf = useCallback((leafId: string) => {
    if (!firestore || !user?.uid) return;
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', leafId);
    deleteDoc(leafRef);
    setSelectedLeaf(null);
    toast({
      title: "Skill Deleted",
      description: "The skill has been removed from your garden.",
    });
  }, [firestore, user?.uid, toast]);

  const handleAddStem = (name: string, description: string, icon: string, color: string) => {
    if (!firestore || !user) return;
    const stemId = uuidv4();
    const newStem: Omit<StemType, 'leaves'> = {
      name,
      description,
      icon,
      color,
      userId: user.uid,
      id: stemId,
      createdAt: new Date().toISOString()
    };
    const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
    safeSetDoc(stemRef, newStem, { merge: false });
    setSelectedStemId(stemId);
  };

  const handleDeleteStem = async (stemId: string) => {
    if (!firestore || !user) return;
  
    try {
      const batch = writeBatch(firestore);
  
      const leavesCollectionRef = collection(firestore, 'users', user.uid, 'leaves');
      const q = query(leavesCollectionRef, where("stemId", "==", stemId));
      const leavesSnapshot = await getDocs(q);
  
      leavesSnapshot.forEach((leafDoc) => {
        batch.delete(leafDoc.ref);
      });
  
      const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
      batch.delete(stemRef);
  
      await batch.commit();
  
      toast({
        title: "Stem Deleted",
        description: `The stem and all its skills have been removed.`,
      });
  
    } catch (error) {
      console.error("Error deleting stem and leaves: ", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the stem. Please try again.",
      });
    }
  };
  
  const handleAddLeaf = (name: string, stemId: string) => {
    if (!firestore || !user) return;
    const leafId = uuidv4();
    const newLeaf: LeafType = {
        id: leafId,
        name,
        stemId,
        userId: user.uid,
        masteryLevel: 0,
        notes: '',
        link: '',
        quests: []
    };
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', leafId);
    safeSetDoc(leafRef, newLeaf, { merge: false });
  };
  
  const handleAddMultipleLeaves = (names: string[], stemId: string) => {
    names.forEach(name => handleAddLeaf(name, stemId));
  };
  
  const handleAddSkillBundle = (stemName: string, leafNames: string[]) => {
    if (!firestore || !user) return;
    const stemId = uuidv4();
    const newStem: Omit<StemType, 'leaves'> = {
      name: stemName,
      userId: user.uid,
      id: stemId,
      createdAt: new Date().toISOString(),
      icon: 'Sprout',
      color: '#8b5cf6',
      description: 'AI-suggested skills'
    };
    const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
    safeSetDoc(stemRef, newStem, { merge: false });

    leafNames.forEach(leafName => {
        handleAddLeaf(leafName, stemId);
    });
    setSelectedStemId(stemId);
  }

  const handleOpenAddLeaf = () => {
    setIsAddLeafOpen(true);
  }

  const handleOpenSuggestSkills = () => {
    setIsSuggestSkillsOpen(true);
  }

  if (areStemsLoading || areLeavesLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className={"h-screen w-full flex bg-background font-body"}>
      <StemSelector 
        stems={gardenWithLeaves}
        selectedStemId={selectedStemId}
        onSelectStem={setSelectedStemId}
        onAddStem={() => setIsAddStemOpen(true)}
        onGetSuggestions={() => setIsSuggestionOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
        searchResults={searchResults}
        onSearchResultClick={handleSearchResultClick}
      />
      
      <main className="flex-grow h-screen overflow-y-auto">
        {selectedStem ? (
          <Stem 
            stem={selectedStem}
            onSelectLeaf={handleSelectLeaf}
            selectedLeaf={selectedLeaf}
            onSaveLeaf={handleSaveLeaf}
            onDeleteLeaf={handleDeleteLeaf}
            onAddLeaf={handleOpenAddLeaf}
            onSuggestSkills={handleOpenSuggestSkills}
            onDeleteStem={handleDeleteStem}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <h3 className="font-heading text-4xl text-primary">Welcome to your Skill Garden!</h3>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Your garden is a place to cultivate new talents. Start by planting a "Stem" — a category for the skills you want to grow.
            </p>
            <div className="mt-8 flex gap-4">
              <Button onClick={() => setIsAddStemOpen(true)} size="lg">
                Plant Your First Stem
              </Button>
               <Button onClick={() => setIsSuggestionOpen(true)} size="lg" variant="outline">
                Get AI Suggestions
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <AddStemDialog
        isOpen={isAddStemOpen}
        onOpenChange={setIsAddStemOpen}
        onAddStem={handleAddStem}
      />

      {selectedStem && <AddLeafDialog
        isOpen={isAddLeafOpen}
        onOpenChange={setIsAddLeafOpen}
        onAddLeaf={(name) => selectedStemId && handleAddLeaf(name, selectedStemId)}
        stemId={selectedStemId}
      />}

      {selectedStem && <SuggestSkillsDialog
          isOpen={isSuggestSkillsOpen}
          onOpenChange={setIsSuggestSkillsOpen}
          stem={selectedStem}
          onAddSkills={(names) => handleAddMultipleLeaves(names, selectedStem.id)}
      />}

      <SuggestionDialog 
          isOpen={isSuggestionOpen}
          onOpenChange={setIsSuggestionOpen}
          currentSkills={currentSkillNames}
          onAddSkillBundle={handleAddSkillBundle}
      />
    </div>
  );
}

    
    