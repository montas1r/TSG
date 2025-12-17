
export interface Quest {
  id: string;
  text: string;
  completed: boolean;
}

export interface Leaf {
  id: string;
  name: string;
  stemId: string;
  masteryLevel: number; // This will now be calculated
  notes: string;
  link: string;
  quests: Quest[];
}

export interface Stem {
  id: string;
  name: string;
  leaves: Leaf[];
}

export type Garden = Stem[];
