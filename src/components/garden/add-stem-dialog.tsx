
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
import { IconPicker, ColorPicker, colorPalette } from './icon-picker';

interface AddStemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddStem: (name: string, description: string, icon: string, color: string) => void;
}

export function AddStemDialog({ isOpen, onOpenChange, onAddStem }: AddStemDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sprout');
  const [color, setColor] = useState(colorPalette[Math.floor(Math.random() * colorPalette.length)]);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setIcon('Sprout');
      setColor(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddStem(name.trim(), description.trim(), icon, color);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Plant a New Stem</DialogTitle>
          <DialogDescription>
            A stem is a category for your skills. Give it a name and choose an icon and color to represent it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className="z-10">
              <IconPicker value={icon} onChange={setIcon} />
            </div>
            <div className="z-10">
              <ColorPicker value={color} onChange={setColor} />
            </div>
            <div className="flex-grow space-y-2">
              <Label htmlFor="stem-name">Stem Name</Label>
              <Input
                id="stem-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Creative Writing"
                autoFocus
              />
            </div>
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
          <Button onClick={handleAdd}>Plant Stem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
