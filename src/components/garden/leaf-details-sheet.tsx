'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Leaf, Quest } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Flower2, Link as LinkIcon, Trash2, PlusCircle, Pencil } from 'lucide-react';
import { calculateMasteryLevel, sanitizeForFirestore } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Highlight } from '@/components/ui/highlight';
import { v4 as uuidv4 } from 'uuid';
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

interface LeafDetailsProps {
  leaf: Leaf;
  onSave: (updatedLeaf: Leaf) => void;
  onDelete: () => void;
  searchQuery?: string;
  className?: string;
}

export function LeafDetails({
  leaf,
  onSave,
  onDelete,
  searchQuery = '',
  className
}: LeafDetailsProps) {
  const [formData, setFormData] = useState<Leaf>(leaf);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const questsWithOrder = (leaf.quests || []).map((q, index) => ({
      ...q,
      order: q.order ?? index,
    }));
    questsWithOrder.sort((a, b) => a.order - b.order);
    setFormData({ ...leaf, quests: questsWithOrder });
  }, [leaf]);
  
  const masteryLevel = useMemo(() => {
    if (!formData) return 0;
    return calculateMasteryLevel(formData.quests);
  }, [formData?.quests]);

  const handleQuestChange = (questId: string, field: 'completed' | 'text', value: string | boolean) => {
    setFormData(prevData => {
        if (!prevData) return prevData;
        
        const updatedQuests = prevData.quests.map(q => 
            q.id === questId ? { ...q, [field]: value } : q
        );
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        
        const newFormData = {
          ...prevData,
          quests: updatedQuests,
          masteryLevel: newMasteryLevel
        };
        
        // For checkboxes, save immediately. For text, save on blur.
        if (field === 'completed') {
            onSave(sanitizeForFirestore(newFormData));
        }
        
        return newFormData;
    });
  };

  const handleAddQuest = () => {
    setFormData(prevData => {
        if(!prevData) return prevData;

        const newQuest: Quest = {
            id: uuidv4(),
            text: '',
            completed: false,
            order: prevData.quests.length > 0 ? Math.max(...prevData.quests.map(q => q.order)) + 1 : 0,
        };
        const updatedQuests = [...(prevData.quests || []), newQuest];
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        const newFormData = { ...prevData, quests: updatedQuests, masteryLevel: newMasteryLevel };
        
        // Save immediately after adding the new quest structure
        onSave(sanitizeForFirestore(newFormData));
        return newFormData;
    });
  }

  const handleDeleteQuest = (questId: string) => {
    setFormData(prevData => {
        if(!prevData) return prevData;

        const updatedQuests = prevData.quests.filter(q => q.id !== questId);
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        const newFormData = { ...prevData, quests: updatedQuests, masteryLevel: newMasteryLevel };
        
        onSave(sanitizeForFirestore(newFormData));
        return newFormData;
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (active.id !== over?.id && formData && over) {
      const oldIndex = formData.quests.findIndex((q) => q.id === active.id);
      const newIndex = formData.quests.findIndex((q) => q.id === over.id);
      
      const newQuestsOrder = arrayMove(formData.quests, oldIndex, newIndex);
      const updatedQuestsWithOrder = newQuestsOrder.map((q, index) => ({...q, order: index}));
      
      const newFormData = { ...formData, quests: updatedQuestsWithOrder };
      setFormData(newFormData);
      
      onSave(sanitizeForFirestore(newFormData));
    }
  }

  const handleBlur = () => {
    onSave(sanitizeForFirestore(formData));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, name: e.target.value}));
  }

  const handleNameSave = () => {
    setIsEditingName(false);
    onSave(sanitizeForFirestore(formData));
  }


  if (!formData) return null;

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
          <CardDescription>Nurture your skill. Add quests, notes, and track your progress. Changes save automatically.</CardDescription>
        </div>
         <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
            <Trash2 className="size-5" />
        </Button>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-heading text-lg">Quests</h3>
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
