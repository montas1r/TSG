
'use client';

import { useMemo, useState } from 'react';
import type { Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wand2, Trash2 } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
import { LeafGrid } from './leaf-grid';
import type { Stem as StemTypeWithLeaves } from '@/lib/types';
import { LeafDetails } from './leaf-details-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AnimatePresence, motion } from 'framer-motion';

interface StemProps {
  stem: StemTypeWithLeaves;
  selectedLeaf: LeafType | null;
  onSelectLeaf: (leaf: LeafType) => void;
  onSaveLeaf: (leaf: LeafType) => void;
  onDeleteLeaf: (leafId: string) => void;
  onAddLeaf: (stemId: string) => void;
  onSuggestSkills: (stemId: string) => void;
  onDeleteStem: (stemId: string) => void;
}

export function Stem({ 
    stem, 
    selectedLeaf,
    onSelectLeaf, 
    onSaveLeaf,
    onDeleteLeaf,
    onAddLeaf, 
    onSuggestSkills,
    onDeleteStem,
}: StemProps) {
  const leafList = stem.leaves || [];
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  const stemMastery = useMemo(() => {
    if (!leafList || leafList.length === 0) return 0;
    const totalMastery = leafList.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0);
    return totalMastery / leafList.length;
  }, [leafList]);

  const handleDeleteConfirm = () => {
    onDeleteStem(stem.id);
    setIsDeleteAlertOpen(false);
  };

  return (
    <>
      <div className="relative h-full flex flex-col p-6 rounded-lg overflow-hidden">
        
        {/* Stem Header */}
        <header className="relative z-10 flex items-center justify-between pb-4 border-b">
          <div className="flex-grow">
              <h2 className="font-heading text-3xl text-foreground/80 truncate">
                  {stem.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {stem.description || `${leafList.length} ${leafList.length === 1 ? 'Skill' : 'Skills'}`}
              </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddLeaf(stem.id)} aria-label={`Add new skill to ${stem.name}`}>
                  <PlusCircle className="size-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onSuggestSkills(stem.id)} aria-label={`Get AI skill suggestions for ${stem.name}`}>
                  <Wand2 className="size-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => setIsDeleteAlertOpen(true)} aria-label={`Delete ${stem.name}`}>
                  <Trash2 className="size-5" />
              </Button>
          </div>
        </header>
        
        <div className="relative mt-4 bg-muted/20 border border-dashed rounded-lg p-4">
          {leafList.length > 0 ? (
              <LeafGrid 
                leaves={leafList}
                onSelectLeaf={onSelectLeaf}
              />
          ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <p className="font-heading text-xl">This stem is empty.</p>
                <p className="mb-4">Plant your first skill to get started.</p>
                <div className="flex items-center gap-4">
                  <Button onClick={() => onAddLeaf(stem.id)}>
                      <PlusCircle className="mr-2" /> Plant a Skill
                  </Button>
                  <Button variant="outline" onClick={() => onSuggestSkills(stem.id)}>
                      <Wand2 className="mr-2" /> Get Suggestions
                  </Button>
                </div>
              </div>
          )}
        </div>

        <div className="flex-grow mt-6">
          <AnimatePresence>
              {selectedLeaf && (
                   <motion.div
                      key={selectedLeaf.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                   >
                      <LeafDetails 
                          leaf={selectedLeaf}
                          onSave={onSaveLeaf}
                          onDelete={() => onDeleteLeaf(selectedLeaf.id)}
                          stemName={stem.name}
                      />
                  </motion.div>
              )}
          </AnimatePresence>
        </div>

      </div>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{stem.name}" stem and all of its skills. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
