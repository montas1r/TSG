export interface Leaf {
  id: string;
  name: string;
  stemId: string;
  isBloomed: boolean;
  notes: string;
  link: string;
}

export interface Stem {
  id: string;
  name: string;
  leaves: Leaf[];
}

export type Garden = Stem[];
