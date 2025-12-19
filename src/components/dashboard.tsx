
'use client';

import { useState, useMemo } from 'react';
import type { Leaf as LeafType, Stem as StemType } from '@/lib/types';
import { Stem } from '@/components/garden/stem';
import { LeafDetailsSheet } from '@/components/garden/leaf-details-sheet';
import { AddStemDialog } from '@/components/garden/add-stem-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AddLeafDialog } from '@/components/garden/add-leaf-dialog';
import { SuggestionDialog } from '@/components/garden/suggestion-dialog';
import { calculateMasteryLevel, cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import { collection, doc, query, deleteDoc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';
import { StemSelector } from '@/components/garden/stem-selector';
import { EditStemDialog } from '@/components/garden/edit-stem-dialog';

export function Dashboard({ user }: { user: User }) {
  const [selectedLeaf, setSelectedLeaf] = useState<LeafType | null>(null);
  const [isLeafSheetOpen, setIsLeafSheetOpen] = useState(false);
  
  const [isAddStemOpen, setIsAddStemOpen] = useState(false);
  const [isEditStemOpen, setIsEditStemOpen] = useState(false);
  const [stemToEdit, setStemToEdit] = useState<StemType | null>(null);

  const [isAddLeafOpen, setIsAddLeafOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStemId, setSelectedStemId] = useState<string | null>(null);

  const firestore = useFirestore();

  const stemsQuery = useMemoFirebase(() => query(collection(firestore, 'users', user.uid, 'stems'), orderBy('createdAt', 'desc')), [firestore, user.uid]);
  const { data: stems, isLoading: areStemsLoading } = useCollection<Omit<StemType, 'leaves'>>(stemsQuery);
  
  const allLeavesQuery = useMemoFirebase(() => query(collection(firestore, `users/${user.uid}/leaves`)), [firestore, user.uid]);
  const { data: allLeavesFlat, isLoading: areLeavesLoading } = useCollection<LeafType>(allLeavesQuery);
  
  // Select the first stem by default if none is selected
  useEffect(() => {
    if (!selectedStemId && stems && stems.length > 0) {
      setSelectedStemId(stems[0].id);
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

  const selectedStem = useMemo(() => {
    return gardenWithLeaves.find(stem => stem.id === selectedStemId) || null;
  }, [gardenWithLeaves, selectedStemId]);

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
  };

  const handleAddStem = (name: string, description: string, icon: string, color: string) => {
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
    setDocumentNonBlocking(stemRef, newStem, { merge: false });
    setSelectedStemId(stemId); // Select the new stem
  };

  const handleEditStemSubmit = (updatedStem: Omit<StemType, 'leaves'>) => {
    const stemRef = doc(firestore, 'users', user.uid, 'stems', updatedStem.id);
    setDocumentNonBlocking(stemRef, updatedStem, { merge: true });
  }

  const handleOpenEditStem = (stem: StemType) => {
    setStemToEdit(stem);
    setIsEditStemOpen(true);
  }

  const handleDeleteStem = async (stemId: string) => {
    if (!window.confirm("Are you sure you want to delete this stem and all its leaves? This action cannot be undone.")) return;

    // Delete all leaves associated with the stem first
    const leavesToDelete = leavesByStem[stemId] || [];
    const deletePromises = leavesToDelete.map(leaf => deleteDoc(doc(firestore, 'users', user.uid, 'leaves', leaf.id)));
    await Promise.all(deletePromises);

    // Then delete the stem
    const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
    deleteDocumentNonBlocking(stemRef);

    // If the deleted stem was selected, select another one
    if(selectedStemId === stemId) {
      const remainingStems = stems?.filter(s => s.id !== stemId);
      setSelectedStemId(remainingStems && remainingStems.length > 0 ? remainingStems[0].id : null);
    }
  }
  
  const handleAddLeaf = (name: string, stemId: string) => {
    const leafId = uuidv4();
    const newLeaf: LeafType = {
        id: leafId,
        name,
        stemId,
        userId: user.uid,
        masteryLevel: 0,
        notes: '',
        link: '',
        quests: [{ id: uuidv4(), text: 'Explore the basics', completed: false }]
    };
    const leafRef = doc(firestore, 'users', user.uid, 'leaves', leafId);
    setDocumentNonBlocking(leafRef, newLeaf, { merge: false });
  };
  
  const handleAddSkillBundle = (stemName: string, leafNames: string[]) => {
    const stemId = uuidv4();
    const newStem: Omit<StemType, 'leaves'> = {
      name: stemName,
      userId: user.uid,
      id: stemId,
      createdAt: new Date().toISOString(),
      icon: 'Sprout',
      color: '#8bc34a',
      description: 'AI-suggested skills'
    };
    const stemRef = doc(firestore, 'users', user.uid, 'stems', stemId);
    setDocumentNonBlocking(stemRef, newStem, { merge: false });

    leafNames.forEach(leafName => {
        handleAddLeaf(leafName, stemId);
    });
    setSelectedStemId(stemId);
  }

  const handleOpenAddLeaf = (stemId: string) => {
    setIsAddLeafOpen(true);
  }

  if (areStemsLoading || areLeavesLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className={cn("h-screen w-full flex", "bg-background font-body")}>
      <StemSelector 
        stems={gardenWithLeaves}
        selectedStemId={selectedStemId}
        onSelectStem={setSelectedStemId}
        onAddStem={() => setIsAddStemOpen(true)}
        onGetSuggestions={() => setIsSuggestionOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
      />
      
      <main className="flex-grow h-screen overflow-y-auto">
        {selectedStem ? (
          <Stem 
            stem={selectedStem}
            onSelectLeaf={handleSelectLeaf}
            onAddLeaf={handleOpenAddLeaf}
            onEditStem={handleOpenEditStem}
            onDeleteStem={handleDeleteStem}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <h3 className="font-headline text-4xl text-primary">Welcome to your Skill Garden!</h3>
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

       {stemToEdit && (
         <EditStemDialog
            isOpen={isEditStemOpen}
            onOpenChange={setIsEditStemOpen}
            stem={stemToEdit}
            onEditStem={handleEditStemSubmit}
         />
       )}

      <AddLeafDialog
        isOpen={isAddLeafOpen}
        onOpenChange={setIsAddLeafOpen}
        onAddLeaf={(name) => selectedStemId && handleAddLeaf(name, selectedStemId)}
        stemId={selectedStemId}
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
