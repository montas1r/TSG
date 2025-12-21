
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useTransition } from 'react';
import type { Stem } from '@/lib/types';
import { Loader2, Wand2, PlusCircle, Sparkles } from 'lucide-react';
import { suggestSkillsForStem } from '@/ai/flows/suggest-skills-for-stem';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SuggestSkillsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddSkills: (names: string[]) => void;
  stem: Stem | null;
}

export function SuggestSkillsDialog({ isOpen, onOpenChange, onAddSkills, stem }: SuggestSkillsDialogProps) {
  const [isSuggesting, startSuggestion] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, boolean>>({});

  const handleGetSuggestions = () => {
    if (!stem) return;
    startSuggestion(async () => {
      try {
        const existingSkills = stem.leaves.map(l => l.name);
        const result = await suggestSkillsForStem({
          stemName: stem.name,
          existingSkills: existingSkills,
        });
        setSuggestions(result);
      } catch (error) {
        console.error("Failed to get skill suggestions:", error);
      }
    });
  };
  
  useEffect(() => {
    if (isOpen) {
      handleGetSuggestions();
    } else {
      // Reset state when dialog closes
      setSuggestions([]);
      setSelectedSkills({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, stem]);

  const handleCheckboxChange = (skill: string, checked: boolean) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skill]: checked,
    }));
  };

  const handleAddSelected = () => {
    const skillsToAdd = Object.keys(selectedSkills).filter(skill => selectedSkills[skill]);
    if (skillsToAdd.length > 0) {
        onAddSkills(skillsToAdd);
        onOpenChange(false);
    }
  };

  const selectedCount = Object.values(selectedSkills).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Sparkles className="text-primary"/>
            Skill Suggestions for "{stem?.name}"
          </DialogTitle>
          <DialogDescription>
            AI has suggested these skills based on your current stem. Select the ones you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 min-h-[16rem]">
          {isSuggesting ? (
            <div className="flex h-full items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                AI is thinking...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors">
                        <Checkbox 
                            id={`skill-suggestion-${i}`}
                            checked={!!selectedSkills[suggestion]}
                            onCheckedChange={(checked) => handleCheckboxChange(suggestion, !!checked)}
                        />
                        <Label htmlFor={`skill-suggestion-${i}`} className="flex-1 cursor-pointer text-sm font-medium">
                            {suggestion}
                        </Label>
                    </div>
                ))}
            </div>
          ) : (
             <div className="flex h-full items-center justify-center text-muted-foreground">
                No suggestions found.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGetSuggestions} variant="ghost" className="mr-auto" disabled={isSuggesting}>
            <Wand2 className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleAddSelected} disabled={selectedCount === 0}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Plant Selected ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    