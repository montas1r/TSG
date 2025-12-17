'use client';

import { useState } from 'react';
import type { Garden, Stem as StemType, Leaf as LeafType } from '@/lib/types';
import { initialGarden } from '@/lib/data';
import { Stem } from '@/components/garden/stem';
import { LeafDetailsSheet } from '@/components/garden/leaf-details-sheet';
import { AddStemDialog } from '@/components/garden/add-stem-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wand2, Sprout } from 'lucide-react';
import { AddLeafDialog } from '@/components/garden/add-leaf-dialog';
import { SuggestionDialog } from '@/components/garden/suggestion-dialog';

export function Dashboard() {
  const [garden, setGarden] = useState<Garden>(initialGarden);
  const [selectedLeaf, setSelectedLeaf] = useState<LeafType | null>(null);
  const [isLeafSheetOpen, setIsLeafSheetOpen] = useState(false);
  
  const [isAddStemOpen, setIsAddStemOpen] = useState(false);
  const [isAddLeafOpen, setIsAddLeafOpen] = useState(false);
  const [stemToAddLeafTo, setStemToAddLeafTo] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const allLeaves = garden.flatMap(stem => stem.leaves);
  const totalMastery = allLeaves.reduce((sum, leaf) => sum + leaf.masteryLevel, 0);
  const maxMastery = allLeaves.length * 100;
  const progress = maxMastery > 0 ? (totalMastery / maxMastery) * 100 : 0;
  const currentSkillNames = allLeaves.map(leaf => leaf.name);

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
    // Also update the selectedLeaf to reflect changes instantly in the sheet
    setSelectedLeaf(updatedLeaf);
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
        masteryLevel: 0,
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

  return (
    <>
      <header className="mb-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg border bg-card p-6 sm:flex-row">
          <div className="text-center sm:text-left">
              <h1 className="font-headline text-4xl tracking-tight">The Skill Garden</h1>
              <p className="text-muted-foreground">Nurture your skills and watch them grow.</p>
          </div>
          <Button onClick={() => setIsSuggestionOpen(true)} className="w-full sm:w-auto">
              <Wand2 className="mr-2" />
              Get Suggestions
          </Button>
        </div>
        <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Overall Mastery</span>
                <span>{Math.round(progress)}% Complete</span>
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
