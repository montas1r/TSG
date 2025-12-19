
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Quest } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMasteryLevel(quests?: Quest[]): number {
  if (!quests || quests.length === 0) {
    return 0;
  }
  const completedQuests = quests.filter((q) => q.completed).length;
  return Math.round((completedQuests / quests.length) * 100);
}

/**
 * Recursively removes keys with `undefined` values from an object.
 * This is essential before sending data to Firestore, which does not
 * support `undefined` field values.
 * @param data The object to sanitize.
 * @returns A new object with `undefined` values removed.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(data: T): Partial<T> {
  const sanitized: any = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      
      // Skip undefined values entirely
      if (value === undefined) {
        continue;
      }
      
      // Firestore does not support custom objects with private properties,
      // so we should be careful about deep sanitization.
      // For this app's data structures, a one-level deep check is safe.
      // If we had deeply nested custom objects, we would need a more robust recursive solution.
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value.constructor.name !== 'Object')) {
         sanitized[key] = sanitizeForFirestore(value);
      } else {
         sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}
