"use client";

import { Vibe } from "../lib/types";

type Props = {
  vibes: Vibe[];
  activeVibe: string;
  onSelect: (vibe: string) => void;
};

export default function VibeFilter({ vibes, activeVibe, onSelect }: Props) {
  return (
    <div className="vibes-section">
      <div className="vibes-row" id="vibeRow">
        {vibes.map((vibe) => (
          <button
            key={vibe.name}
            className={`vibe-chip${vibe.name === activeVibe ? " on" : ""}`}
            type="button"
            onClick={() => onSelect(vibe.name)}
          >
            {vibe.emoji ? `${vibe.emoji} ` : ""}
            {vibe.name}
          </button>
        ))}
      </div>
    </div>
  );
}
