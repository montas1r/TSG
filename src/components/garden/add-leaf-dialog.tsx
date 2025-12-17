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

interface AddLeafDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddLeaf: (name: string, stemId: string) => void;
  stemId: string | null;
}

export function AddLeafDialog({ isOpen, onOpenChange, onAddLeaf, stemId }: AddLeafDialogProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (name.trim() && stemId) {
      onAddLeaf(name.trim(), stemId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Plant a New Skill</DialogTitle>
          <DialogDescription>
            Add a new skill leaf to your garden stem. What do you want to learn?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>Plant Skill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
