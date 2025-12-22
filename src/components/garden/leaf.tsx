
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
    const p = Math.max(0, Math.min(100, mastery));

    // A rich, multi-stop gradient from gray through a rainbow to vibrant green
    const stops: { percent: number, color: HSL }[] = [
        { percent: 0,   color: parseToHsl('#E5E7EB') },   // gray-200
        { percent: 10,  color: parseToHsl('#FCD34D') },   // yellow-300
        { percent: 25,  color: parseToHsl('#FBBF24') },   // amber-400
        { percent: 40,  color: parseToHsl('#F97316') },   // orange-500
        { percent: 55,  color: parseToHsl('#EF4444') },   // red-500
        { percent: 70,  color: parseToHsl('#8B5CF6') },   // violet-500
        { percent: 85,  color: parseToHsl('#3B82F6') },   // blue-500
        { percent: 100, color: parseToHsl('#22C55E') },   // green-500
    ];

    if (p === 0) return toColorString(stops[0].color);
    if (p === 100) return toColorString(stops[stops.length - 1].color);

    // Find the two stops the percentage falls between
    const endStopIndex = stops.findIndex(stop => stop.percent >= p);
    const startStop = stops[endStopIndex - 1];
    const endStop = stops[endStopIndex];

    // Calculate how far between the two stops our percentage is
    const range = endStop.percent - startStop.percent;
    const progressInRange = (p - startStop.percent) / range;

    // HSL Interpolation for smoother, more natural color transitions
    const h = startStop.color.hue + (endStop.color.hue - startStop.color.hue) * progressInRange;
    const s = startStop.color.saturation + (endStop.color.saturation - startStop.color.saturation) * progressInRange;
    const l = startStop.color.lightness + (endStop.color.lightness - startStop.color.lightness) * progressInRange;

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
                  transition: 'color 400ms ease-in-out, fill 400ms ease-in-out'
              }}
          />
      </div>
      <p className="w-24 text-center text-xs font-medium text-foreground truncate">
          <Highlight text={leaf.name} query={searchQuery} />
      </p>
    </div>
  );
}
