export type Place = {
  id: string;
  name: string;
  cat: string;
  cuisine: string[] | null;
  area: string;
  price: string;
  vibes: string[];
  desc: string;
  tip: string | null;
  booking: string;
  dog: string;
  kids: string;
  open?: string[];
  pick: boolean;
  is_new: boolean;
  ph: string;
};

export type Vibe = {
  name: string;
  emoji: string;
};
