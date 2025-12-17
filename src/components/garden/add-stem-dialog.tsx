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
import { useState } from 'react';

interface AddStemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddStem: (name: string) => void;
}

export function AddStemDialog({ isOpen, onOpenChange, onAddStem }: AddStemDialogProps) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAddStem(name.trim());
      setName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Plant a New Stem</DialogTitle>
          <DialogDescription>
            A stem is a category for your skills, like 'Programming' or 'Design'.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="stem-name">Stem Name</Label>
          <Input
            id="stem-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Creative Writing"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Plant Stem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
