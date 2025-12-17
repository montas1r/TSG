'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Leaf } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Flower2, Link as LinkIcon, Trash2 } from 'lucide-react';

interface LeafDetailsSheetProps {
  leaf: Leaf | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedLeaf: Leaf) => void;
  onDelete: (leafId: string) => void;
}

export function LeafDetailsSheet({
  leaf,
  isOpen,
  onOpenChange,
  onSave,
  onDelete,
}: LeafDetailsSheetProps) {
  const [formData, setFormData] = useState<Leaf | null>(leaf);

  useEffect(() => {
    setFormData(leaf);
  }, [leaf]);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };
  
  const handleDelete = () => {
    if (formData) {
        onDelete(formData.id);
        onOpenChange(false);
    }
  }

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">{formData.name}</SheetTitle>
          <SheetDescription>Nurture your skill. Add notes, links, and track your progress.</SheetDescription>
        </SheetHeader>
        <div className="flex-grow space-y-6 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="bloomed-switch" className="flex items-center gap-2 text-base">
                <Flower2 className="size-5 text-primary" />
                Skill Bloomed
              </Label>
              <p className="text-sm text-muted-foreground">
                Mark this skill as learned or mastered.
              </p>
            </div>
            <Switch
              id="bloomed-switch"
              checked={formData.isBloomed}
              onCheckedChange={(checked) => setFormData({ ...formData, isBloomed: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Reflections</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
              className="text-base"
            />
          </div>
        </div>
        <SheetFooter className="mt-auto flex-row justify-between">
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" /> Remove
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
