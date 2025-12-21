
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Leaf, Quest } from '@/lib/types';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { Trash2, PlusCircle, Pencil, Wand2, Loader2 } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { v4 as uuidv4 } from 'uuid';
import { suggestQuests } from '@/ai/flows/suggest-quests';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';


interface LeafDetailsProps {
  leaf: Leaf;
  onSave: (updatedLeaf: Leaf) => void;
  onDelete: () => void;
  searchQuery?: string;
  className?: string;
  stemName?: string;
}

export function LeafDetails({
  leaf,
  onSave,
  onDelete,
  searchQuery = '',
  className,
  stemName,
}: LeafDetailsProps) {
  const [formData, setFormData] = useState<Leaf>(leaf);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSuggestingQuests, startQuestSuggestion] = useTransition();
  const { toast } = useToast();
  
  // Debounce the onSave callback
  const debouncedSave = useDebouncedCallback((data: Leaf) => {
    onSave(data);
  }, 500); // 500ms delay

  useEffect(() => {
    const questsWithOrder = (leaf.quests || []).map((q, index) => ({
      ...q,
      order: q.order ?? index,
    })).sort((a, b) => a.order - b.order);

    setFormData({ ...leaf, quests: questsWithOrder });
  }, [leaf]);

  // This effect listens for changes in formData and calls the debounced save function.
  useEffect(() => {
    // We don't save if the form data is the same as the initial prop to avoid writes on component load.
    // A deep comparison is needed here.
    if (JSON.stringify(formData) !== JSON.stringify(leaf)) {
      debouncedSave(formData);
    }
    // We cancel any pending saves when the component unmounts
    return () => debouncedSave.cancel();
  }, [formData, leaf, debouncedSave]);


  const masteryLevel = useMemo(() => {
    return calculateMasteryLevel(formData.quests);
  }, [formData.quests]);

  const handleLocalChange = (newFormData: Partial<Leaf>) => {
    setFormData(prevData => {
      const updatedData = { ...prevData, ...newFormData };
      
      // If quests changed, recalculate mastery
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
    // Autosave will handle the update, no explicit save needed
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
        toast({
          title: "Quests Suggested!",
          description: `${suggestedTexts.length} new quests have been added for "${formData.name}".`,
        });

      } catch (error) {
        console.error("Failed to suggest quests:", error);
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: "Could not generate quests. Please try again.",
        });
      }
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-grow space-y-1.5">
           {isEditingName ? (
              <Input
                value={formData.name}
                onChange={handleNameChange}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                autoFocus
                className="text-2xl font-semibold h-auto p-0 border-none focus-visible:ring-0"
              />
           ) : (
             <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Highlight text={formData.name} query={searchQuery} />
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setIsEditingName(true)}>
                    <Pencil className="size-4" />
                </Button>
            </CardTitle>
           )}
          <CardDescription>Nurture your skill. Add quests and notes to track your progress.</CardDescription>
        </div>
         <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
            <Trash2 className="size-5" />
        </Button>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-lg">Quests ({formData.quests.filter(q => q.completed).length}/{formData.quests.length})</h3>
                <Button variant="ghost" size="sm" onClick={handleSuggestQuests} disabled={isSuggestingQuests}>
                    {isSuggestingQuests ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                        <Wand2 className="size-4 mr-2" />
                    )}
                  Suggest Quests
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
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
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
              <Button variant="outline" size="sm" className="mt-4 w-full gap-2" onClick={handleAddQuest}>
                  <PlusCircle className="size-4" />
                  Add Quest
              </Button>
          </div>
        </div>

        <div className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
