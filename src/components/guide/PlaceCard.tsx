"use client";

import { placeTypeVisual, resolvePlaceMedia } from "../../lib/guide/placeMedia";
import type { Venue, VenueLinks } from "../../lib/guide/types";

type Props = {
  venue: Venue;
  links: VenueLinks;
  mapsUrl: string;
  label: string;
};

export default function PlaceCard({ venue, links, mapsUrl, label }: Props) {
  const media = resolvePlaceMedia(venue);
  const visual = placeTypeVisual(venue.types);

  return (
    <article className={`sg-place-card${venue.sp ? " pick" : ""}`}>
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

      {media.layout === "thumb" ? (
        <div className="sg-place-body-row">
          <div className="sg-place-thumb">
            <img
              src={media.leadUrl}
              alt={venue.coverImageAlt ?? venue.n}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="sg-place-copy">
            <PlaceCopy
              venue={venue}
              links={links}
              mapsUrl={mapsUrl}
              label={label}
            />
          </div>
        </div>
      ) : null}

      {media.layout === "icon" ? (
        <div className="sg-place-body-row">
          <div
            className="sg-place-icon-cell"
            style={{ background: visual.c }}
            aria-hidden
          >
            {visual.icon}
          </div>
          <div className="sg-place-copy">
            <PlaceCopy
              venue={venue}
              links={links}
              mapsUrl={mapsUrl}
              label={label}
            />
          </div>
        </div>
      ) : null}

      {media.layout === "hero" || media.layout === "hero4" ? (
        <div className="sg-place-copy sg-place-copy-pad">
          <PlaceCopy
            venue={venue}
            links={links}
            mapsUrl={mapsUrl}
            label={label}
          />
        </div>
      ) : null}
    </article>
  );
}

function PlaceCopy({
  venue,
  links,
  mapsUrl,
  label,
}: {
  venue: Venue;
  links: VenueLinks;
  mapsUrl: string;
  label: string;
}) {
  return (
    <>
      <div className="sg-venue-meta">
        {venue.sp ? <span className="sg-venue-pick">★ Salt pick</span> : null}
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
      {venue.b ? <div className="sg-venue-body">{venue.b}</div> : null}
      {venue.tip ? (
        <div className="sg-venue-tip">
          <span className="tip">Tip:</span> {venue.tip}
        </div>
      ) : null}
      <div className="sg-venue-links">
        {links.w ? (
          <a href={links.w} target="_blank" rel="noreferrer">
            Website →
          </a>
        ) : null}
        {links.ig ? (
          <a
            href={`https://instagram.com/${links.ig}`}
            target="_blank"
            rel="noreferrer"
          >
            @{links.ig}
          </a>
        ) : null}
        <a href={mapsUrl} target="_blank" rel="noreferrer">
          Maps →
        </a>
      </div>
    </>
  );
}
