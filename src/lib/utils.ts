import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Quest } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMasteryLevel(quests: Quest[]): number {
  if (quests.length === 0) {
    return 0;
  }
  const completedQuests = quests.filter((q) => q.completed).length;
  return Math.round((completedQuests / quests.length) * 100);
}
