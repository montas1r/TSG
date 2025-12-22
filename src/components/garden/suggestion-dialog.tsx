
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Wand2, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SkillBundle {
    stem: string;
    leaves: string[];
}

interface SuggestionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentSkills: string[];
  onAddSkillBundle: (stemName: string, leafNames: string[]) => void;
}

export function SuggestionDialog({ isOpen, onOpenChange, currentSkills, onAddSkillBundle }: SuggestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillBundle[]>([]);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
        const response = await fetch('/api/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'relatedSkillBundles',
                payload: { currentSkills },
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to get skill suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBundle = (stem: string, leaves: string[]) => {
    onAddSkillBundle(stem, leaves);
    onOpenChange(false);
  }

  useEffect(() => {
    if (isOpen) {
      handleGetSuggestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Sparkles className="text-primary" />
            Discover New Skills
          </DialogTitle>
          <DialogDescription>
            Here are some skill bundles suggested by AI. Plant a bundle to add a new stem and its related skills to your garden.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[16rem] flex flex-col justify-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p>AI is thinking...</p>
            </div>
          )}
          {!isLoading && suggestions.length > 0 && (
             <Accordion type="single" collapsible className="w-full">
                {suggestions.map((bundle, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="font-heading text-lg">{bundle.stem}</AccordionTrigger>
                        <AccordionContent>
                           <div className="flex flex-col items-start gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {bundle.leaves.map((leaf, leafIndex) => (
                                    <Badge key={leafIndex} variant="secondary" className="px-3 py-1 text-sm">
                                        {leaf}
                                    </Badge>
                                    ))}
                                </div>
                                <Button size="sm" onClick={() => handleAddBundle(bundle.stem, bundle.leaves)}>
                                    <PlusCircle className="mr-2" />
                                    Plant this Bundle
                                </Button>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
             </Accordion>
          )}
           {!isLoading && suggestions.length === 0 && (
             <div className="text-center text-muted-foreground p-8">
                Click the button to get personalized skill suggestions.
             </div>
           )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleGetSuggestions} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Wand2 className="mr-2 size-4" />
            )}
            {isLoading ? 'Thinking...' : 'Refresh Suggestions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
