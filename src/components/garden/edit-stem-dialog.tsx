
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
import { IconPicker, ColorPicker } from './icon-picker';
import type { Stem } from '@/lib/types';

interface EditStemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  stem: Omit<Stem, 'leaves'>;
  onEditStem: (updatedStem: Omit<Stem, 'leaves'>) => void;
}

export function EditStemDialog({ isOpen, onOpenChange, stem, onEditStem }: EditStemDialogProps) {
  const [name, setName] = useState(stem.name);
  const [description, setDescription] = useState(stem.description || '');
  const [icon, setIcon] = useState(stem.icon || 'Sprout');
  const [color, setColor] = useState(stem.color || '#8b5cf6');

  // This effect ensures that if a new stem is passed in while the dialog is already open,
  // the dialog's internal state updates to reflect the new stem's data.
  // It also resets the state when the dialog is opened.
  useEffect(() => {
    if (isOpen) {
      setName(stem.name);
      setDescription(stem.description || '');
      setIcon(stem.icon || 'Sprout');
      setColor(stem.color || '#8b5cf6');
    }
  }, [isOpen, stem]);

  const handleSave = () => {
    if (name.trim()) {
      onEditStem({
        ...stem,
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Stem</DialogTitle>
          <DialogDescription>
            Update the details for your skill category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <IconPicker value={icon} onChange={setIcon} />
            <ColorPicker value={color} onChange={setColor} />
            <div className="flex-grow space-y-2">
              <Label htmlFor="stem-name-edit">Stem Name</Label>
              <Input
                id="stem-name-edit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Creative Writing"
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stem-description-edit">Description (Optional)</Label>
            <Textarea
              id="stem-description-edit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this skill category about?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
