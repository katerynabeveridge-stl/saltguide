"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { placeTypeVisual, resolvePlaceMedia } from "../../lib/guide/placeMedia";
import type { Venue, VenueLinks } from "../../lib/guide/types";

type Props = {
  venue: Venue;
  links: VenueLinks;
  mapsUrl: string;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
};

export default function PlaceCard({
  venue,
  links,
  mapsUrl,
  label,
  isOpen,
  onToggle,
}: Props) {
  const media = resolvePlaceMedia(venue);
  const visual = placeTypeVisual(venue.types);

  const toggleKey = (ev: KeyboardEvent) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      onToggle();
    }
  };

  return (
    <article
      className={`sg-place-card${isOpen ? " open" : ""}`}
      onClick={onToggle}
      onKeyDown={toggleKey}
      role="button"
      tabIndex={0}
    >
      {media.layout === "hero4" ? (
        <div className="sg-place-media sg-place-media-hero4">
          <div className="sg-place-hero">
            <img
              src={media.leadUrl}
              alt={venue.coverImageAlt ?? venue.n}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="sg-place-gallery">
            {media.galleryUrls.map((url, i) => (
              <div className="sg-place-tile" key={`${venue.slug}-g-${i}`}>
                <img src={url} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {media.layout === "hero" ? (
        <div className="sg-place-media sg-place-media-hero">
          <div className="sg-place-hero">
            <img
              src={media.leadUrl}
              alt={venue.coverImageAlt ?? venue.n}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      ) : null}

      <div className="sg-place-inner">
        <div className="sg-place-body-row">
          {media.layout === "thumb" ? (
            <div className="sg-place-thumb">
              <img
                src={media.leadUrl}
                alt={venue.coverImageAlt ?? venue.n}
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}

          {media.layout === "icon" ? (
            <div
              className="sg-place-icon-cell"
              style={{ background: visual.c }}
              aria-hidden
            >
              {visual.icon}
            </div>
          ) : null}

          <div className="sg-place-copy">
            <div className="sg-venue-meta">
              {venue.isFeatured ? (
                <span className="sg-venue-featured">Featured</span>
              ) : null}
              {label ? <span className="sg-venue-kind">{label}</span> : null}
              {venue.isFree ? <span className="sg-venue-free">Free</span> : null}
            </div>
            <div className="sg-venue-name">{venue.n}</div>
            <div className="sg-venue-area">
              {venue.a}
              {venue.booking === "book-ahead" ? " · Book ahead" : ""}
            </div>
            {!isOpen && venue.b ? (
              <div className="sg-venue-body clamp2">{venue.b}</div>
            ) : null}
          </div>
          <span
            className={`sg-card-plus${isOpen ? " open" : ""}`}
            aria-hidden
          >
            +
          </span>
        </div>

        {isOpen ? (
          <div className="sg-card-expand">
            {venue.b ? <p>{venue.b}</p> : null}
            <PlaceLinks links={links} mapsUrl={mapsUrl} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function PlaceLinks({
  links,
  mapsUrl,
}: {
  links: VenueLinks;
  mapsUrl?: string;
}) {
  const stop = (ev: MouseEvent) => ev.stopPropagation();
  if (!links.w && !links.ig && !mapsUrl) return null;

  return (
    <div className="sg-venue-links">
      {links.w ? (
        <a href={links.w} target="_blank" rel="noreferrer" onClick={stop}>
          Website →
        </a>
      ) : null}
      {links.ig ? (
        <a
          href={`https://instagram.com/${links.ig}`}
          target="_blank"
          rel="noreferrer"
          onClick={stop}
        >
          @{links.ig}
        </a>
      ) : null}
      {mapsUrl ? (
        <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={stop}>
          Maps →
        </a>
      ) : null}
    </div>
  );
}
