
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

const getMasteryColor = (mastery: number, leafId: string): string => {
    const p = Math.max(0, Math.min(100, mastery));

    // A rich, multi-stop gradient from gray through a rainbow to vibrant green
    // Each stop now has three variants for more visual diversity.
    const stops: { percent: number, colors: [string, string, string] }[] = [
        { percent: 0,   colors: ['#F3F4F6', '#E5E7EB', '#D1D5DB'] }, // gray-100, 200, 300
        { percent: 10,  colors: ['#FDE68A', '#FCD34D', '#FBBF24'] }, // amber-200, 300, 400
        { percent: 25,  colors: ['#FBBF24', '#F59E0B', '#D97706'] }, // amber-400, 500, 600
        { percent: 40,  colors: ['#F97316', '#EA580C', '#C2410C'] }, // orange-500, 600, 700
        { percent: 55,  colors: ['#EF4444', '#DC2626', '#B91C1C'] }, // red-500, 600, 700
        { percent: 70,  colors: ['#8B5CF6', '#7C3AED', '#6D28D9'] }, // violet-500, 600, 700
        { percent: 85,  colors: ['#3B82F6', '#2563EB', '#1D4ED8'] }, // blue-500, 600, 700
        { percent: 100, colors: ['#4ADE80', '#22C55E', '#16A34A'] }, // green-400, 500, 600
    ];

    // Simple hash function to get a deterministic index from the leafId
    const getVariantIndex = (id: string): number => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            const char = id.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash) % 3; // Get an index 0, 1, or 2
    };

    const variantIndex = getVariantIndex(leafId);

    const getVariantColor = (stop: typeof stops[0]) => parseToHsl(stop.colors[variantIndex]);

    if (p === 0) return toColorString(getVariantColor(stops[0]));
    if (p === 100) return toColorString(getVariantColor(stops[stops.length - 1]));

    const endStopIndex = stops.findIndex(stop => stop.percent >= p);
    const startStop = stops[endStopIndex - 1];
    const endStop = stops[endStopIndex];

    const range = endStop.percent - startStop.percent;
    const progressInRange = (p - startStop.percent) / range;

    const startColor = getVariantColor(startStop);
    const endColor = getVariantColor(endStop);

    const h = startColor.hue + (endColor.hue - startColor.hue) * progressInRange;
    const s = startColor.saturation + (endColor.saturation - startColor.saturation) * progressInRange;
    const l = startColor.lightness + (endColor.lightness - startColor.lightness) * progressInRange;

    return toColorString({ hue: h, saturation: s, lightness: l });
};

export function Leaf({ leaf, onClick, searchQuery = '', isSelected }: LeafProps) {
  const color = getMasteryColor(leaf.masteryLevel, leaf.id);

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
