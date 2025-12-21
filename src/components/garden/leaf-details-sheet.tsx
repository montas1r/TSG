
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Leaf, Quest } from '@/lib/types';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { Flower2, Link as LinkIcon, Trash2, PlusCircle, Pencil, Wand2, Loader2 } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
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
import { awardXPForQuestCompletion } from '@/lib/services/gamification-service';
import { useFirestore } from '@/firebase';

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
  const firestore = useFirestore();

  useEffect(() => {
    const questsWithOrder = (leaf.quests || []).map((q, index) => ({
      ...q,
      order: q.order ?? index,
    }));
    questsWithOrder.sort((a, b) => a.order - b.order);
    setFormData({ ...leaf, quests: questsWithOrder });
  }, [leaf]);

  const masteryLevel = useMemo(() => {
    return calculateMasteryLevel(formData.quests);
  }, [formData.quests]);

  const handleQuestChange = (questId: string, field: 'completed' | 'text', value: string | boolean) => {
    const originalQuest = formData.quests.find(q => q.id === questId);
    const questJustCompleted = field === 'completed' && value === true && originalQuest?.completed === false;

    setFormData(prevData => {
        const updatedQuests = prevData.quests.map(q => 
            q.id === questId ? { ...q, [field]: value } : q
        );
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        
        const newData = {
          ...prevData,
          quests: updatedQuests,
          masteryLevel: newMasteryLevel
        };

        if (questJustCompleted) {
            awardXPForQuestCompletion(firestore, leaf.userId);
            toast({
                title: "Quest Complete!",
                description: "+10 XP Earned!",
            });
        }
        
        return newData;
    });
  };

  const handleAddQuest = () => {
    setFormData(prevData => {
        const newQuest: Quest = {
            id: uuidv4(),
            text: '',
            completed: false,
            order: prevData.quests.length > 0 ? Math.max(...prevData.quests.map(q => q.order)) + 1 : 0,
        };
        const updatedQuests = [...(prevData.quests || []), newQuest];
        return { ...prevData, quests: updatedQuests };
    });
  }

  const handleDeleteQuest = (questId: string) => {
    setFormData(prevData => ({
        ...prevData,
        quests: prevData.quests.filter(q => q.id !== questId)
    }));
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
      setFormData(prevData => {
        const oldIndex = prevData.quests.findIndex((q) => q.id === active.id);
        const newIndex = prevData.quests.findIndex((q) => q.id === over.id);
        
        const newQuestsOrder = arrayMove(prevData.quests, oldIndex, newIndex);
        const updatedQuestsWithOrder = newQuestsOrder.map((q, index) => ({...q, order: index}));
        
        return { ...prevData, quests: updatedQuestsWithOrder };
      });
    }
  }

  const handleBlur = () => {
    if (JSON.stringify(formData) !== JSON.stringify(leaf)) {
      onSave(formData);
       toast({
          title: "Skill Saved",
          description: `Changes to "${formData.name}" have been saved.`,
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, name: e.target.value}));
  }

  const handleNameSave = () => {
    setIsEditingName(false);
    handleBlur(); // Use the central save function
  }

  const handleSuggestQuests = () => {
    startQuestSuggestion(async () => {
      try {
        const suggestedTexts = await suggestQuests({
          skillName: formData.name,
          stemName: stemName,
        });

        if (suggestedTexts && suggestedTexts.length > 0) {
          setFormData(prevData => {
            const existingQuests = prevData.quests || [];
            const lastOrder = existingQuests.length > 0 ? Math.max(...existingQuests.map(q => q.order)) : -1;
            
            const newQuests: Quest[] = suggestedTexts.map((text, index) => ({
              id: uuidv4(),
              text,
              completed: false,
              order: lastOrder + 1 + index,
            }));

            const updatedQuests = [...existingQuests, ...newQuests];
            return { ...prevData, quests: updatedQuests };
          });
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
          <CardDescription>Nurture your skill. Add quests, notes, and track your progress.</CardDescription>
        </div>
         <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
            <Trash2 className="size-5" />
        </Button>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-lg">Quests</h3>
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
                                onBlur={handleBlur}
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
          <div className="space-y-2">
              <Label htmlFor="mastery-slider" className="flex items-center gap-2 text-base">
                <Flower2 className="size-5 text-primary" />
                Mastery Level: {masteryLevel}%
              </Label>
              <Progress value={masteryLevel} />
            </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Reflections</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              onBlur={handleBlur}
              placeholder="What have you learned? What are your thoughts?"
              className="min-h-[150px] text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link" className="flex items-center gap-2">
              <LinkIcon className="size-4" />
              Resource Link
            </Label>
            <Input
              id="link"
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              onBlur={handleBlur}
              placeholder="https://example.com"
              className="text-base"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
