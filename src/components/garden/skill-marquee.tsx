'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { Leaf } from './leaf';

interface SkillMarqueeProps {
  leaves: LeafType[];
  onSelectLeaf: (leaf: LeafType) => void;
  searchQuery?: string;
}

export function SkillMarquee({ leaves, onSelectLeaf, searchQuery = '' }: SkillMarqueeProps) {
  const marqueeContent = leaves.map((leaf) => (
    <Leaf
      key={leaf.id}
      leaf={leaf}
      onClick={() => onSelectLeaf(leaf)}
      searchQuery={searchQuery}
    />
  ));

  return (
    <div className="group relative flex w-full overflow-hidden">
      <div className="flex animate-marquee motion-safe:group-hover:[animation-play-state:paused]">
        <div className="flex min-w-full flex-shrink-0 items-center justify-around gap-4 py-4">
          {marqueeContent}
        </div>
        <div className="flex min-w-full flex-shrink-0 items-center justify-around gap-4 py-4" aria-hidden="true">
          {marqueeContent}
        </div>
      </div>
    </div>
  );
}
