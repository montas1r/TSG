'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Garden, Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { initialGarden } from '@/lib/data';
import { useAuth } from '@/components/auth-provider';
import { Stem } from '@/components/garden/stem';
import { LeafDetailsSheet } from '@/components/garden/leaf-details-sheet';
import { AddStemDialog } from '@/components/garden/add-stem-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wand2, Sprout } from 'lucide-react';
import { AddLeafDialog } from '@/components/garden/add-leaf-dialog';
import { SuggestionDialog } from '@/components/garden/suggestion-dialog';
import { Skeleton } from './ui/skeleton';

export function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [garden, setGarden] = useState<Garden>(initialGarden);
  const [selectedLeaf, setSelectedLeaf] = useState<LeafType | null>(null);
  const [isLeafSheetOpen, setIsLeafSheetOpen] = useState(false);
  
  const [isAddStemOpen, setIsAddStemOpen] = useState(false);
  const [isAddLeafOpen, setIsAddLeafOpen] = useState(false);
  const [stemToAddLeafTo, setStemToAddLeafTo] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const { allLeaves, bloomedLeaves, progress, currentSkillNames } = useMemo(() => {
    const allLeaves = garden.flatMap(stem => stem.leaves);
    const bloomedLeaves = allLeaves.filter(leaf => leaf.isBloomed);
    const progress = allLeaves.length > 0 ? (bloomedLeaves.length / allLeaves.length) * 100 : 0;
    const currentSkillNames = allLeaves.map(leaf => leaf.name);
    return { allLeaves, bloomedLeaves, progress, currentSkillNames };
  }, [garden]);


  const handleSelectLeaf = (leaf: LeafType) => {
    setSelectedLeaf(leaf);
    setIsLeafSheetOpen(true);
  };

  const handleSaveLeaf = (updatedLeaf: LeafType) => {
    setGarden(
      garden.map((stem) => ({
        ...stem,
        leaves: stem.leaves.map((leaf) =>
          leaf.id === updatedLeaf.id ? updatedLeaf : leaf
        ),
      }))
    );
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
    setGarden([...garden, newStem]);
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
        isBloomed: false,
        notes: '',
        link: '',
    };
    setGarden(garden.map(stem => {
        if (stem.id === stemId) {
            return {
                ...stem,
                leaves: [...stem.leaves, newLeaf]
            }
        }
        return stem;
    }));
  }

  if (loading || !user) {
    return (
      <div className="space-y-12">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <>
      <header className="mb-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg border bg-card p-6 sm:flex-row">
          <div className="text-center sm:text-left">
              <h1 className="font-headline text-4xl tracking-tight">The Skill Garden</h1>
              <p className="text-muted-foreground">Welcome, {user.displayName || 'Gardener'}! Nurture your skills and watch them grow.</p>
          </div>
          <Button onClick={() => setIsSuggestionOpen(true)} className="w-full sm:w-auto">
              <Wand2 className="mr-2" />
              Get Suggestions
          </Button>
        </div>
        <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Garden Progress</span>
                <span>{bloomedLeaves.length} / {allLeaves.length} Bloomed</span>
            </div>
            <Progress value={progress} />
        </div>
      </header>
      
      <main className="space-y-8">
        {garden.length > 0 ? garden.map((stem) => (
          <Stem 
            key={stem.id} 
            stem={stem} 
            onSelectLeaf={handleSelectLeaf}
            onAddLeaf={handleOpenAddLeaf}
          />
        )) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 text-center">
            <h3 className="font-headline text-2xl">Your garden is empty</h3>
            <p className="text-muted-foreground">Start by planting a new stem for your skills.</p>
          </div>
        )}
        <div className="flex justify-center pt-4">
            <Button variant="outline" className="gap-2" onClick={() => setIsAddStemOpen(true)}>
                <Sprout />
                Plant a New Stem
            </Button>
        </div>
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
    </>
  );
}
