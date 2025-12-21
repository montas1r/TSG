
'use client';

import { icons } from 'lucide-react';
import { cn, calculateMasteryLevel } from '@/lib/utils';
import type { Stem, Leaf } from '@/lib/types';
import { AnimatedStemProgress } from './animated-stem-progress';
import { AnimatePresence, motion } from 'framer-motion';

interface StemItemProps {
  stem: Stem & { leaves: Leaf[] };
  isSelected: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

export function StemItem({ stem, isSelected, onClick, isCollapsed }: StemItemProps) {

  const mastery = stem.leaves.length > 0 
    ? stem.leaves.reduce((sum, leaf) => sum + calculateMasteryLevel(leaf.quests), 0) / stem.leaves.length
    : 0;

  const LucideIcon = icons[stem.icon as keyof typeof icons] || icons['Sprout'];

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
              <div className="flex w-full items-center justify-between gap-2">
                <p className={cn(
                    "font-medium truncate",
                    isSelected ? 'text-primary' : 'text-foreground'
                )} style={isSelected ? { color: stem.color } : {}}>{stem.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                  {stem.leaves.length} {stem.leaves.length === 1 ? 'skill' : 'skills'}
              </p>
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
