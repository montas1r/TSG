
import type { FuseResult } from "fuse.js";

export interface Quest {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface Leaf {
  id: string;
  name: string;
  stemId: string;
  userId: string;
  masteryLevel: number; // This will now be calculated
  notes: string;
  link: string;
  quests: Quest[];
}

export interface Stem {
  id:string;
  userId: string;
  name: string;
  leaves: Leaf[];
  createdAt: string;
  icon: string;
  color: string;
  description: string;
}

export type Garden = Stem[];

export interface UserStats {
    userId: string;
    totalXP: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string; 
}


// --- Searchable Types ---

export type SearchableStem = Omit<Stem, 'leaves'> & {
    type: 'stem';
}

export type SearchableLeaf = Leaf & {
    type: 'leaf';
    stemName: string; // denormalized for search display
}

export type SearchableQuest = Quest & {
    type: 'quest';
    leafName: string; // denormalized
    stemId: string; // denormalized
}

export type SearchableItem = SearchableStem | SearchableLeaf | SearchableQuest;

export type SearchResult = FuseResult<SearchableItem>;
