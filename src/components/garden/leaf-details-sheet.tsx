'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Leaf, Quest } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Flower2, Link as LinkIcon, Trash2, PlusCircle } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Highlight } from '@/components/ui/highlight';


interface LeafDetailsSheetProps {
  leaf: Leaf | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedLeaf: Leaf) => void;
  onDelete: (leafId: string) => void;
  searchQuery?: string;
}

export function LeafDetailsSheet({
  leaf,
  isOpen,
  onOpenChange,
  onSave,
  onDelete,
  searchQuery = '',
}: LeafDetailsSheetProps) {
  const [formData, setFormData] = useState<Leaf | null>(leaf);

  useEffect(() => {
    setFormData(leaf);
  }, [leaf]);

  const masteryLevel = useMemo(() => {
    if (!formData) return 0;
    return calculateMasteryLevel(formData.quests);
  }, [formData]);

  const handleQuestChange = (questId: string, field: 'completed' | 'text', value: string | boolean) => {
    if (formData) {
        setFormData({
            ...formData,
            quests: formData.quests.map(q => 
                q.id === questId ? { ...q, [field]: value } : q
            )
        })
    }
  };

  const handleAddQuest = () => {
    if(formData) {
        const newQuest: Quest = {
            id: `quest-${Date.now()}`,
            text: '',
            completed: false,
        };
        setFormData({
            ...formData,
            quests: [...formData.quests, newQuest]
        });
    }
  }

  const handleDeleteQuest = (questId: string) => {
    if(formData) {
        setFormData({
            ...formData,
            quests: formData.quests.filter(q => q.id !== questId)
        });
    }
  }

  const handleSave = () => {
    if (formData) {
      const newMasteryLevel = calculateMasteryLevel(formData.quests);
      onSave({ ...formData, masteryLevel: newMasteryLevel });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (formData) {
      onDelete(formData.id);
      onOpenChange(false);
    }
  };

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">
            <Highlight text={formData.name} query={searchQuery} />
          </SheetTitle>
          <SheetDescription>Nurture your skill. Add quests, notes, and track your progress.</SheetDescription>
        </SheetHeader>
        <div className="flex-grow space-y-6 overflow-y-auto py-4 pr-4">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="mastery-slider" className="flex items-center gap-2 text-base">
                <Flower2 className="size-5 text-primary" />
                Mastery Level: {masteryLevel}%
              </Label>
              <p className="text-sm text-muted-foreground">
                Complete quests to increase your mastery.
              </p>
            </div>
            <Progress value={masteryLevel} />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-headline text-lg">Quests</h3>
            <div className="space-y-3">
                {formData.quests.map((quest) => (
                    <div key={quest.id} className="flex items-center gap-2">
                        <Checkbox 
                            id={`quest-check-${quest.id}`}
                            checked={quest.completed}
                            onCheckedChange={(checked) => handleQuestChange(quest.id, 'completed', !!checked)}
                        />
                        <Input 
                            value={quest.text}
                            onChange={(e) => handleQuestChange(quest.id, 'text', e.target.value)}
                            placeholder="Define your quest..."
                            className="flex-grow"
                        />
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleDeleteQuest(quest.id)}>
                            <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full gap-2" onClick={handleAddQuest}>
                <PlusCircle className="size-4" />
                Add Quest
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Reflections</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
              className="text-base"
            />
          </div>
        </div>
        <SheetFooter className="mt-auto flex-row justify-between pt-4">
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" /> Remove
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
