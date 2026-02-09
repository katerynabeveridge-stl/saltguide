"use client";

import { Place } from "../lib/types";

type Props = {
  places: Place[];
  onSelectArea: (area: string) => void;
};

const areas = [
  {
    name: "st leonards",
    tagline: "Norman Road cafés, antiques, galleries. The creative bit.",
    ph: "ph-2",
  },
  {
    name: "old town",
    tagline: "Net huts, cobblestones, funicular. The soul of it all.",
    ph: "ph-1",
  },
  {
    name: "new town",
    tagline: "Bakeries, ramen bars, and the up-and-coming food scene.",
    ph: "ph-5",
  },
];

export default function Neighbourhoods({ places, onSelectArea }: Props) {
  return (
    <section className="section" style={{ background: "var(--cream)" }}>
      <div className="section-header r">
        <div>
          <p className="section-label">know the area</p>
          <h2 className="section-title">
            the <span className="it">neighbourhoods</span>
          </h2>
        </div>
      </div>
      <div className="hoods" id="hoodsGrid">
        {areas.map((area, index) => {
          const count = places.filter((p) => p.area === area.name).length;
          return (
            <div
              key={area.name}
              className={`hood r d${index + 1}`}
              onClick={() => onSelectArea(area.name)}
            >
              <div className={`hood-bg ${area.ph}`} />
              <div className="hood-info">
                <div className="hood-name">{area.name}</div>
                <div className="hood-tagline">{area.tagline}</div>
                <div className="hood-count">{count} places</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
