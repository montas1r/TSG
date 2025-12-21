'use client';

import { icons } from 'lucide-react';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import type { Stem, Leaf } from '@/lib/types';
import { AnimatedStemProgress } from './animated-stem-progress';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Edit, Save, X } from 'lucide-react';
import { Input } from '../ui/input';
import { IconPicker, ColorPicker } from './icon-picker';
import { AnimatePresence, motion } from 'framer-motion';

interface StemItemProps {
  stem: Stem & { leaves: Leaf[] };
  isSelected: boolean;
  onClick: () => void;
  onEdit: (updatedStem: Omit<Stem, 'leaves'>) => void;
  isCollapsed: boolean;
}

export function StemItem({ stem, isSelected, onClick, onEdit, isCollapsed }: StemItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStem, setEditedStem] = useState<Omit<Stem, 'leaves'>>(stem);

  useEffect(() => {
    // Reset local state if the main stem prop changes (e.g., from parent re-render)
    setEditedStem(stem);
  }, [stem]);

  const mastery = stem.leaves.length > 0 
    ? stem.leaves.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0) / stem.leaves.length
    : 0;

  const LucideIcon = icons[editedStem.icon as keyof typeof icons] || icons['Sprout'];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedStem(stem); // Revert changes
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(editedStem);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStem({ ...editedStem, name: e.target.value });
  };
  
  const handleIconChange = (icon: string) => {
    setEditedStem({ ...editedStem, icon });
  }

  const handleColorChange = (color: string) => {
    setEditedStem({ ...editedStem, color });
  }


  if (isEditing) {
    return (
      <div className="w-full p-3 rounded-lg bg-accent/10 border border-primary/50 flex flex-col gap-3">
        {/* Name Input and Actions */}
        <div className='flex items-center gap-2'>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: editedStem.color }}>
                <LucideIcon className="size-5 text-white" />
            </div>
            <Input 
                value={editedStem.name}
                onChange={handleInputChange}
                className="h-8 flex-grow"
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(e as any);
                    if (e.key === 'Escape') handleCancel(e as any);
                }}
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSave}><Save className="size-4 text-primary" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCancel}><X className="size-4 text-muted-foreground" /></Button>
        </div>
        {/* Color and Icon Pickers */}
        <div className='flex items-center justify-center gap-4 z-10'>
            <IconPicker value={editedStem.icon} onChange={handleIconChange} />
            <ColorPicker value={editedStem.color} onChange={handleColorChange} isInline/>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-2 group relative cursor-pointer',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent/5'
      )}
      style={isSelected ? { '--stem-color': stem.color } as React.CSSProperties : {}}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
          }
      }}
    >
      <div className={cn('flex items-start gap-3', isCollapsed && 'justify-center')}>
        <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground'
        )}
        style={isSelected ? { backgroundColor: stem.color } : {}}>
          <LucideIcon className="size-5" />
        </div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              className="flex-grow overflow-hidden"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className={cn(
                  "font-medium truncate",
                  isSelected ? 'text-primary' : 'text-foreground'
              )} style={isSelected ? { color: stem.color } : {}}>{stem.name}</p>
              <p className="text-xs text-muted-foreground">
                  {stem.leaves.length} {stem.leaves.length === 1 ? 'skill' : 'skills'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
        {!isCollapsed && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={handleEditClick}
                >
                    <Edit className="size-4" />
                </Button>
            </motion.div>
        )}
        </AnimatePresence>

      </div>
      <AnimatePresence>
        {!isCollapsed && (
             <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
            >
                <AnimatedStemProgress value={mastery} />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
