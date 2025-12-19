
'use client';

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
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


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

  useEffect(() => {
    setFormData(leaf);
  }, [leaf]);
  
  const masteryLevel = useMemo(() => {
    if (!formData) return 0;
    return calculateMasteryLevel(formData.quests);
  }, [formData]);

  const updateFormData = (updatedData: Partial<Leaf>) => {
    if (formData) {
        const newFormData = { ...formData, ...updatedData };
        setFormData(newFormData);
        onSave(newFormData);
    }
  }

  const handleQuestChange = (questId: string, field: 'completed' | 'text', value: string | boolean) => {
    if (formData) {
        const updatedQuests = formData.quests.map(q => 
            q.id === questId ? { ...q, [field]: value } : q
        );
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        updateFormData({ quests: updatedQuests, masteryLevel: newMasteryLevel });
    }
  };

  const handleAddQuest = () => {
    if(formData) {
        const newQuest: Quest = {
            id: uuidv4(),
            text: '',
            completed: false,
        };
        const updatedQuests = [...(formData.quests || []), newQuest];
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        updateFormData({ quests: updatedQuests, masteryLevel: newMasteryLevel });
    }
  }

  const handleDeleteQuest = (questId: string) => {
    if(formData) {
        const updatedQuests = formData.quests.filter(q => q.id !== questId);
        const newMasteryLevel = calculateMasteryLevel(updatedQuests);
        updateFormData({ quests: updatedQuests, masteryLevel: newMasteryLevel });
    }
  }

  if (!formData) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          <Highlight text={formData.name} query={searchQuery} />
        </CardTitle>
        <CardDescription>Nurture your skill. Add quests, notes, and track your progress. Changes save automatically.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-heading text-lg">Quests</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {(formData.quests || []).map((quest) => (
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
              value={formData.notes}
              onChange={(e) => updateFormData({ notes: e.target.value })}
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
              onChange={(e) => updateFormData({ link: e.target.value })}
              placeholder="https://example.com"
              className="text-base"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-2 size-4" /> Remove Skill
        </Button>
      </CardFooter>
    </Card>
  );
}

    