"use client";

import { Place } from "../lib/types";

type Props = {
  place: Place;
  index: number;
  onSelect: (place: Place) => void;
};

export default function PlaceCard({ place, index, onSelect }: Props) {
  const badge = place.is_new
    ? "🌊 new"
    : place.pick
      ? "🌊 salty pick"
      : null;
  const badgeClass = place.is_new ? "card-new" : "card-salt";
  const catLabel =
    place.cat === "café"
      ? "Café"
      : place.cat.charAt(0).toUpperCase() + place.cat.slice(1);
  const vibeHtml = place.vibes.slice(0, 2);
  const desc =
    place.desc.length > 80 ? `${place.desc.substring(0, 80)}...` : place.desc;

  return (
    <div
      className={`card r d${(index % 4) + 1}`}
      onClick={() => onSelect(place)}
    >
      <div className="card-img">
        <div className={`card-img-fill ${place.ph}`} />
        <span className="card-badge">{catLabel}</span>
        {badge ? <span className={badgeClass}>{badge}</span> : null}
      </div>
      <div className="card-meta">
        <span>{place.area}</span>
        <span className="sep">●</span>
        <span>{place.price}</span>
      </div>
      <div className="card-name">{place.name}</div>
      <div className="card-desc">{desc}</div>
      <div className="card-vibes">
        {vibeHtml.map((vibe) => (
          <span key={vibe} className="card-vibe">
            {vibe}
          </span>
        ))}
      </div>
    </div>
  );
}
