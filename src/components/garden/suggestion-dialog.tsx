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
import { useState } from 'react';
import { suggestRelatedSkills } from '@/ai/flows/suggest-related-skills';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SuggestionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentSkills: string[];
}

export function SuggestionDialog({ isOpen, onOpenChange, currentSkills }: SuggestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      if (currentSkills.length === 0) {
        toast({
          title: 'Your garden is empty',
          description: 'Add some skills first to get suggestions.',
        });
        return;
      }
      const result = await suggestRelatedSkills(currentSkills);
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to get skill suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch suggestions. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary" />
            Discover New Skills
          </DialogTitle>
          <DialogDescription>
            Let AI suggest new skills based on what's already in your garden.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[10rem] flex flex-col justify-center">
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Here are some suggestions:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
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
            {isLoading ? 'Thinking...' : 'Get Suggestions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
