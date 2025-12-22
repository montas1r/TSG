'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Leaf, Quest } from '@/lib/types';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { Trash2, PlusCircle, Pencil, Wand2, Loader2, X, GripVertical } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { suggestQuests } from '@/ai/flows/suggest-quests';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableQuestItem } from './draggable-quest-item';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';


interface LeafDetailsProps {
  leaf: Leaf;
  onSave: (updatedLeaf: Leaf) => void;
  onDelete: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  stemName?: string;
}

export function LeafDetails({
  leaf,
  onSave,
  onDelete,
  isOpen,
  onOpenChange,
  stemName,
}: LeafDetailsProps) {
  const [formData, setFormData] = useState<Leaf>(leaf);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSuggestingQuests, startQuestSuggestion] = useTransition();
  
  const debouncedSave = useDebouncedCallback((data: Leaf) => {
    onSave(data);
  }, 500);

  useEffect(() => {
    const questsWithOrder = (leaf.quests || []).map((q, index) => ({
      ...q,
      order: q.order ?? index,
    })).sort((a, b) => a.order - b.order);

    setFormData({ ...leaf, quests: questsWithOrder });
  }, [leaf]);

  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(leaf)) {
      debouncedSave(formData);
    }
    return () => debouncedSave.cancel();
  }, [formData, leaf, debouncedSave]);


  const masteryLevel = useMemo(() => {
    return calculateMasteryLevel(formData.quests);
  }, [formData.quests]);

  const handleLocalChange = (newFormData: Partial<Leaf>) => {
    setFormData(prevData => {
      const updatedData = { ...prevData, ...newFormData };
      
      if (newFormData.quests) {
        updatedData.masteryLevel = calculateMasteryLevel(newFormData.quests);
      }
      
      return updatedData;
    });
  };

  const handleQuestChange = (questId: string, field: 'completed' | 'text', value: string | boolean) => {
    const updatedQuests = formData.quests.map(q => 
        q.id === questId ? { ...q, [field]: value } : q
    );
    handleLocalChange({ quests: updatedQuests });
  };

  const handleAddQuest = () => {
    const newQuest: Quest = {
        id: uuidv4(),
        text: '',
        completed: false,
        order: formData.quests.length > 0 ? Math.max(...formData.quests.map(q => q.order)) + 1 : 0,
    };
    const updatedQuests = [...(formData.quests || []), newQuest];
    handleLocalChange({ quests: updatedQuests });
  }

  const handleDeleteQuest = (questId: string) => {
    const updatedQuests = formData.quests.filter(q => q.id !== questId);
    handleLocalChange({ quests: updatedQuests });
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (active.id !== over?.id && over) {
      const oldIndex = formData.quests.findIndex((q) => q.id === active.id);
      const newIndex = formData.quests.findIndex((q) => q.id === over.id);
      
      const newQuestsOrder = arrayMove(formData.quests, oldIndex, newIndex);
      const updatedQuestsWithOrder = newQuestsOrder.map((q, index) => ({...q, order: index}));
      
      handleLocalChange({ quests: updatedQuestsWithOrder });
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLocalChange({ name: e.target.value });
  }

  const handleNameSave = () => {
    setIsEditingName(false);
  }

  const handleSuggestQuests = () => {
    startQuestSuggestion(async () => {
      try {
        const suggestedTexts = await suggestQuests({
          skillName: formData.name,
          stemName: stemName,
        });

        if (suggestedTexts && suggestedTexts.length > 0) {
          const existingQuests = formData.quests || [];
          const lastOrder = existingQuests.length > 0 ? Math.max(...existingQuests.map(q => q.order)) : -1;
          
          const newQuests: Quest[] = suggestedTexts.map((text, index) => ({
            id: uuidv4(),
            text,
            completed: false,
            order: lastOrder + 1 + index,
          }));

          const updatedQuests = [...existingQuests, ...newQuests];
          handleLocalChange({ quests: updatedQuests });
        }

      } catch (error) {
        console.error("Failed to suggest quests:", error);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col">
        <SheetHeader className="px-4 text-left">
          <div className="flex justify-between items-center">
            {isEditingName ? (
                <Input
                  value={formData.name}
                  onChange={handleNameChange}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="text-lg font-semibold h-auto p-0 border-none focus-visible:ring-0"
                />
            ) : (
              <SheetTitle className="font-heading text-lg flex items-center gap-2">
                  {formData.name}
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setIsEditingName(true)}>
                      <Pencil className="size-4" />
                  </Button>
              </SheetTitle>
            )}
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="size-4" />
            </Button>
          </div>
          <SheetDescription>
            Mastery: {masteryLevel}%
          </SheetDescription>
          <Progress value={masteryLevel} />
        </SheetHeader>
        
        <ScrollArea className="flex-grow mt-4">
            <div className="px-4 space-y-6 pb-6">
                {/* Quests */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm">Quests ({formData.quests.filter(q => q.completed).length}/{formData.quests.length})</h4>
                      <Button variant="ghost" size="sm" onClick={handleSuggestQuests} disabled={isSuggestingQuests}>
                          {isSuggestingQuests ? (
                              <Loader2 className="size-4 animate-spin mr-2" />
                          ) : (
                              <Wand2 className="size-4 mr-2" />
                          )}
                        Suggest
                      </Button>
                    </div>
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={formData.quests.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                          <div className="space-y-3">
                              {formData.quests.map((quest) => (
                                  <DraggableQuestItem
                                      key={quest.id}
                                      quest={quest}
                                      onTextChange={handleQuestChange}
                                      onCompletedChange={handleQuestChange}
                                      onDelete={handleDeleteQuest}
                                      onBlur={() => {}} 
                                  />
                              ))}
                          </div>
                      </SortableContext>
                    </DndContext>
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleAddQuest}>
                        <PlusCircle className="size-4" />
                        Add Quest
                    </Button>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes & Reflections</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleLocalChange({ notes: e.target.value })}
                    placeholder="What have you learned? What are your thoughts?"
                    className="min-h-[150px] text-base"
                  />
                </div>
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
