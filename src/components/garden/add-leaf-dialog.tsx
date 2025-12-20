
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useTransition } from 'react';
import type { Stem } from '@/lib/types';
import { Loader2, Wand2 } from 'lucide-react';
import { suggestSkillsForStem } from '@/ai/flows/suggest-skills-for-stem';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AddLeafDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddLeaf: (name: string, stemId: string) => void;
  stem: Stem | null;
}

export function AddLeafDialog({ isOpen, onOpenChange, onAddLeaf, stem }: AddLeafDialogProps) {
  const [name, setName] = useState('');
  const [isSuggesting, startSuggestion] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSuggestions([]);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (name.trim() && stem) {
      onAddLeaf(name.trim(), stem.id);
      onOpenChange(false);
    }
  };

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
        if (result.length === 0) {
          toast({
            title: "No new suggestions",
            description: "You've explored a lot of this stem already!",
          });
        }
      } catch (error) {
        console.error("Failed to get skill suggestions:", error);
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: "Could not fetch suggestions. Please try again.",
        });
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Plant a New Skill</DialogTitle>
          <DialogDescription>
            Add a new skill leaf to your garden stem. What do you want to learn?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="leaf-name">Skill Name</Label>
            <Input
              id="leaf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'Learn React Portals'"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
          </div>
          
          <div className="space-y-3">
             <Button variant="outline" size="sm" onClick={handleGetSuggestions} disabled={isSuggesting}>
                {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Suggest Skills
              </Button>

              {isSuggesting && (
                  <div className="text-sm text-muted-foreground">AI is thinking...</div>
              )}

              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                     <Badge 
                        key={i} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSuggestionClick(suggestion)}
                     >
                        {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim() || !stem}>Plant Skill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
