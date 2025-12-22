
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
import { useState, useEffect } from 'react';
import { Textarea } from '../ui/textarea';

interface AddStemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddStem: (name: string, description: string) => void;
}

export function AddStemDialog({ isOpen, onOpenChange, onAddStem }: AddStemDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddStem(name.trim(), description.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Plant a New Stem</DialogTitle>
          <DialogDescription>
            A stem is a category for your skills. Just give it a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stem-name">Stem Name</Label>
            <Input
              id="stem-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Creative Writing"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stem-description">Description (Optional)</Label>
            <Textarea
              id="stem-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this skill category about?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>Plant Stem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
