"use client";

import { Place } from "../lib/types";
import PlaceCard from "./PlaceCard";

type Props = {
  places: Place[];
  hasFilters: boolean;
  onClearFilters: () => void;
  onSelectPlace: (place: Place) => void;
};

export default function PlaceGrid({
  places,
  hasFilters,
  onClearFilters,
  onSelectPlace,
}: Props) {
  const countLabel = `${places.length} place${places.length !== 1 ? "s" : ""}`;

  return (
    <div className="results-section">
      <div className="results-info" id="resultsInfo">
        <span className="results-count">{countLabel}</span>
        <button
          className={`results-clear${hasFilters ? " show" : ""}`}
          onClick={onClearFilters}
          type="button"
          id="resultsClear"
        >
          clear filters
        </button>
      </div>
      {places.length === 0 ? (
        <div className="no-results" id="noResults">
          <span className="emoji">🏖️</span>
          <div className="msg">nothing here yet</div>
          <div className="sub">Try a different search or filter</div>
        </div>
      ) : (
        <div className="grid-3" id="mainGrid">
          {places.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              index={index}
              onSelect={onSelectPlace}
            />
          ))}
        </div>
      )}
    </div>
  );
}
