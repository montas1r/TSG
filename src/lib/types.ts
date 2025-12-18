
export interface Quest {
  id: string;
  text: string;
  completed: boolean;
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
  id: string;
  userId: string;
  name: string;
  leaves: Leaf[];
  createdAt: string;
}

export type Garden = Stem[];
