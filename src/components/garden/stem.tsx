'use client';

import { useMemo, useState } from 'react';
import type { Leaf as LeafType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wand2, MoreHorizontal, Pencil } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '../ui/scroll-area';
import { Leaf } from './leaf';

interface StemProps {
  stem: StemTypeWithLeaves;
  selectedLeaf: LeafType | null;
  onSelectLeaf: (leaf: LeafType | null) => void;
  onSaveLeaf: (leaf: LeafType) => void;
  onDeleteLeaf: (leafId: string) => void;
  onAddLeaf: () => void;
  onSuggestSkills: () => void;
  onEditStem: () => void;
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
    onEditStem,
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

  const { leaves, ...stemData } = stem;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Stem Header */}
        <header className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex-grow min-w-0">
              <h2 className="font-heading text-2xl text-foreground truncate">
                  {stem.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {stem.description || `${leafList.length} ${leafList.length === 1 ? 'Skill' : 'Skills'}`}
              </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={onSuggestSkills}>
                  <Wand2 className="size-4 mr-2" /> Suggest Skills
              </Button>
              <Button variant="ghost" size="sm" onClick={onAddLeaf} aria-label={`Add new skill to ${stem.name}`}>
                  <PlusCircle className="size-4 mr-2" /> New Skill
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEditStem}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Stem
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteAlertOpen(true)}
                  >
                    Delete Stem
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex-grow flex overflow-hidden">
            <ScrollArea className="flex-grow h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {leafList.length > 0 ? (
                        leafList.map(leaf => (
                            <Leaf 
                                key={leaf.id}
                                leaf={leaf}
                                onClick={() => onSelectLeaf(leaf)}
                                isSelected={selectedLeaf?.id === leaf.id}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-8 bg-background/50 rounded-lg">
                            <p className="font-heading text-xl">This stem is empty.</p>
                            <p className="mb-4">Plant your first skill to get started.</p>
                            <Button onClick={onAddLeaf}>
                                <PlusCircle className="mr-2" /> Plant a Skill
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
            
            <AnimatePresence>
                {selectedLeaf && (
                     <motion.div
                        key={selectedLeaf.id}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 450, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-background border-l shrink-0 h-full overflow-hidden"
                     >
                        <LeafDetails 
                            leaf={selectedLeaf}
                            onSave={onSaveLeaf}
                            onDelete={() => onDeleteLeaf(selectedLeaf.id)}
                            onClose={() => onSelectLeaf(null)}
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