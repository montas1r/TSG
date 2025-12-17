import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LeafQuests } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMasteryLevel(quests: LeafQuests): number {
  const { learn, practice, prove } = quests;
  if (learn.completed && practice.completed && prove.completed) {
    return 100;
  }
  if (learn.completed && practice.completed) {
    return 70;
  }
  if (learn.completed) {
    return 30;
  }
  return 10;
}
