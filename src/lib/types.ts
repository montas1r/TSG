
export interface Quest {
  text: string;
  completed: boolean;
}

export interface LeafQuests {
  learn: Quest;
  practice: Quest;
  prove: Quest;
}

export interface Leaf {
  id: string;
  name: string;
  stemId: string;
  masteryLevel: number; // This will now be calculated
  notes: string;
  link: string;
  quests: LeafQuests;
}

export interface Stem {
  id: string;
  name: string;
  leaves: Leaf[];
}

export type Garden = Stem[];
