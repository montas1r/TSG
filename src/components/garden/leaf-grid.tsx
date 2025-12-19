'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { Leaf } from './leaf';
import { AnimatePresence, motion } from 'framer-motion';

interface LeafGridProps {
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  searchQuery?: string;
}

export function LeafGrid({ leaves, onSelectLeaf, searchQuery = '' }: LeafGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
      <AnimatePresence>
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Leaf
              leaf={leaf}
              onClick={() => onSelectLeaf(leaf)}
              searchQuery={searchQuery}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
