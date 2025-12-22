
'use client';

import type { Leaf as LeafType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Highlight } from '@/components/ui/highlight';
import { Leaf as LeafIcon } from 'lucide-react';
import { HSL, parseToHsl, toColorString } from 'polished';

interface LeafProps {
  leaf: LeafType;
  onClick: () => void;
  searchQuery?: string;
  isSelected?: boolean;
}

const getMasteryColor = (mastery: number): string => {
    const p = mastery / 100;

    // Define HSL color stops based on your hex codes
    const stops: HSL[] = [
        parseToHsl('#D1D5DB'), // 0% gray-300
        parseToHsl('#FBBF24'), // 25% amber-400
        parseToHsl('#F59E0B'), // 50% amber-500
        parseToHsl('#10B981'), // 75% green-500
        parseToHsl('#34D399'), // 100% green-400
    ];

    if (p <= 0) return toColorString(stops[0]);
    if (p >= 1) return toColorString(stops[4]);

    const numStops = stops.length - 1;
    const stopIndex = Math.floor(p * numStops);
    const localP = (p * numStops) % 1;

    const startColor = stops[stopIndex];
    const endColor = stops[stopIndex + 1];

    const h = startColor.hue + (endColor.hue - startColor.hue) * localP;
    const s = startColor.saturation + (endColor.saturation - startColor.saturation) * localP;
    const l = startColor.lightness + (endColor.lightness - startColor.lightness) * localP;

    return toColorString({ hue: h, saturation: s, lightness: l });
};

export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {
  const color = getMasteryColor(leaf.masteryLevel);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent/5'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`View details for ${leaf.name}`}
    >
      <div className="relative flex items-center justify-center">
          <LeafIcon
              className={cn(
                  'size-16 transition-all duration-300 group-hover:scale-110',
                  isSelected && 'scale-110'
              )}
              style={{ 
                  color, 
                  fill: isSelected ? `${color}4D` : `${color}26`,
                  transition: 'color 300ms ease-in-out, fill 300ms ease-in-out'
              }}
          />
      </div>
      <p className="w-24 text-center text-xs font-medium text-foreground truncate">
          <Highlight text={leaf.name} query={searchQuery} />
      </p>
    </div>
  );
}
