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
import type { Leaf, LeafQuests } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Flower2, Link as LinkIcon, Trash2, BrainCircuit, Target, Star } from 'lucide-react';
import { calculateMasteryLevel } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


interface LeafDetailsSheetProps {
  leaf: Leaf | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedLeaf: Leaf) => void;
  onDelete: (leafId: string) => void;
}

export function LeafDetailsSheet({
  leaf,
  isOpen,
  onOpenChange,
  onSave,
  onDelete,
}: LeafDetailsSheetProps) {
  const [formData, setFormData] = useState<Leaf | null>(leaf);

  useEffect(() => {
    setFormData(leaf);
  }, [leaf]);

  const masteryLevel = useMemo(() => {
    if (!formData) return 0;
    return calculateMasteryLevel(formData.quests);
  }, [formData]);

  const handleQuestChange = (questType: keyof LeafQuests, field: 'completed' | 'text', value: string | boolean) => {
    if (formData) {
      setFormData({
        ...formData,
        quests: {
          ...formData.quests,
          [questType]: {
            ...formData.quests[questType],
            [field]: value,
          },
        },
      });
    }
  };


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
          <SheetTitle className="font-headline text-2xl">{formData.name}</SheetTitle>
          <SheetDescription>Nurture your skill. Add notes, links, and track your progress.</SheetDescription>
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
            <div className="space-y-4">
                {/* Learn Quest */}
                <div className="flex items-start gap-4">
                    <Checkbox 
                        id="learn-check" 
                        className="mt-1"
                        checked={formData.quests.learn.completed}
                        onCheckedChange={(checked) => handleQuestChange('learn', 'completed', !!checked)}
                    />
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="learn-check" className="flex items-center gap-2 text-base">
                           <BrainCircuit className="size-5 text-primary/80" /> Learn
                        </Label>
                        <Input 
                            value={formData.quests.learn.text}
                            onChange={(e) => handleQuestChange('learn', 'text', e.target.value)}
                            placeholder="e.g., Read a book, watch a tutorial"
                        />
                    </div>
                </div>
                 {/* Practice Quest */}
                 <div className="flex items-start gap-4">
                    <Checkbox 
                        id="practice-check" 
                        className="mt-1"
                        checked={formData.quests.practice.completed}
                        onCheckedChange={(checked) => handleQuestChange('practice', 'completed', !!checked)}
                    />
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="practice-check" className="flex items-center gap-2 text-base">
                           <Target className="size-5 text-primary/80" /> Practice
                        </Label>
                        <Input 
                            value={formData.quests.practice.text}
                            onChange={(e) => handleQuestChange('practice', 'text', e.target.value)}
                            placeholder="e.g., Build a small project"
                        />
                    </div>
                </div>
                 {/* Prove Quest */}
                 <div className="flex items-start gap-4">
                    <Checkbox 
                        id="prove-check" 
                        className="mt-1"
                        checked={formData.quests.prove.completed}
                        onCheckedChange={(checked) => handleQuestChange('prove', 'completed', !!checked)}
                    />
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="prove-check" className="flex items-center gap-2 text-base">
                           <Star className="size-5 text-primary/80" /> Prove
                        </Label>
                        <Input 
                            value={formData.quests.prove.text}
                            onChange={(e) => handleQuestChange('prove', 'text', e.target.value)}
                            placeholder="e.g., Get certified, teach someone"
                        />
                    </div>
                </div>
            </div>
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
