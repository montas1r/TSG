export interface Leaf {
  id: string;
  name: string;
  stemId: string;
  masteryLevel: number; // 0-100
  notes: string;
  link: string;
}

export interface Stem {
  id: string;
  name: string;
  leaves: Leaf[];
}

export type Garden = Stem[];
