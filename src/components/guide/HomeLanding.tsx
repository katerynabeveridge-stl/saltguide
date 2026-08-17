"use client";

import { useMemo, useState } from "react";
import {
  EVENT_CATS,
  HOME_PLACE_TEASER_FALLBACK,
  PEBBLES_URL,
  SUBSTACK_ABOUT_URL,
  SUBSTACK_URL,
  TYPE_LABEL,
} from "../../lib/guide/constants";
import {
  addDaysISO,
  eventBadgeLabel,
  homeWeekPicks,
  homeWeekStrip,
  londonTodayISO,
  shortWeekdayDate,
} from "../../lib/guide/events";
import { tint } from "../../lib/guide/images";
import { placeImageUrls, placeTypeVisual } from "../../lib/guide/placeMedia";
import type { FeedEvent, Venue } from "../../lib/guide/types";
import ListingThumb from "./ListingThumb";

type Page = "whatson" | "places";

type Props = {
  events: FeedEvent[];
  venues: Venue[];
  onNavigate: (page: Page) => void;
};

type PlaceTeaser = {
  name: string;
  type: string;
  area: string;
  icon: string;
  imageUrl?: string;
  pick: boolean;
  line: string;
};

/** Places shown in the home "Where we'd send a friend" section, in order. */
const HOME_PLACE_SLUGS = [
  "goat-ledge",
  "hastings-castle-1066-story",
  "the-crown-hastings",
] as const;

export default function HomeLanding({ events, venues, onNavigate }: Props) {
  const todayISO = londonTodayISO();
  const tomorrowISO = addDaysISO(todayISO, 1);
  const [openPick, setOpenPick] = useState<string | null>(null);

  const picks = useMemo(
    () => homeWeekPicks(events, todayISO, 3),
    [events, todayISO],
  );

  const weekStrip = useMemo(() => {
    const exclude = new Set(picks.map((p) => p.slug));
    return homeWeekStrip(events, todayISO, exclude, 5);
  }, [events, todayISO, picks]);

  const placeTeasers = useMemo((): PlaceTeaser[] => {
    const bySlug = new Map(venues.map((v) => [v.slug, v]));
    const selected = HOME_PLACE_SLUGS.map((slug) => bySlug.get(slug)).filter(
      (v): v is Venue => Boolean(v),
    );
    if (!selected.length) {
      return HOME_PLACE_TEASER_FALLBACK.map((pl) => ({
        name: pl.name,
        type: pl.type,
        area: "",
        icon: pl.icon,
        pick: false,
        line: pl.line,
      }));
    }
    return selected.map((v) => {
      const primaryType = v.types[0] ?? "";
      return {
        name: v.n,
        type: TYPE_LABEL[primaryType] || "Place",
        area: v.a,
        icon: placeTypeVisual(v.types).icon,
        imageUrl: placeImageUrls(v)[0],
        pick: v.sp,
        line: v.b,
      };
    });
  }, [venues]);

  return (
    <>
      <section className="sg-home-hero">
        <div className="sg-home-hero-photo" aria-hidden />
        <div className="sg-home-hero-scrim" aria-hidden />
        <div className="sg-home-hero-inner">
          <h1 className="sg-home-h1">
            Your guide to
            <br />
            Hastings &amp; St Leonards.
          </h1>
          <p className="sg-home-lede">
            What&apos;s on, local guides, and a Sunday email with the best of it.
          </p>
          <div className="sg-home-ctas">
            <button
              type="button"
              className="sg-hero-cta sg-hero-cta-primary"
              onClick={() => onNavigate("whatson")}
            >
              See what&apos;s on
            </button>
            <button
              type="button"
              className="sg-hero-cta sg-hero-cta-secondary"
              onClick={() =>
                document
                  .getElementById("signup")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get the Sunday email
            </button>
          </div>
        </div>
      </section>

      {picks.length ? (
        <section className="sg-home-section">
          <div className="sg-home-section-copy">
            <h2 className="sg-home-h2">This week&apos;s picks</h2>
            <p className="sg-home-sub">Three things worth planning around.</p>
          </div>
          {picks.map((e) => {
            const c = EVENT_CATS[e.cat] ?? EVENT_CATS.art;
            const dLabel = eventBadgeLabel(e, todayISO, tomorrowISO);
            const isOpen = openPick === e.slug;
            return (
              <div
                key={e.slug}
                className="sg-card"
                style={{ background: tint(c.c, 0.9) }}
                onClick={() => setOpenPick(isOpen ? null : e.slug)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setOpenPick(isOpen ? null : e.slug);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="sg-card-inner">
                  <ListingThumb
                    imageUrl={e.imageUrl}
                    imageAlt={e.imageAlt}
                    fallbackColor={c.c}
                    fallbackIcon={c.icon}
                  />
                  <div className="sg-card-body">
                    <div className="sg-badges">
                      <span className="sg-badge-date">{dLabel}</span>
                      <span className="sg-badge-cat">
                        <i style={{ background: c.c }} />
                        {c.label}
                      </span>
                      {e.pick ? (
                        <span className="sg-badge-pick">✳ PICK</span>
                      ) : null}
                      {e.family ? (
                        <span className="sg-badge-family">
                          👨‍👩‍👧 Family friendly
                        </span>
                      ) : null}
                    </div>
                    <div className="sg-card-title">{e.title}</div>
                    {e.venue || e.time || e.price ? (
                      <div className="sg-card-meta">
                        {e.venue}
                        {e.venue && e.time ? " · " : null}
                        {e.time}
                        {(e.venue || e.time) && e.price ? " · " : null}
                        {e.price ? <strong>{e.price}</strong> : null}
                      </div>
                    ) : null}
                    {!isOpen && e.description ? (
                      <div className="sg-card-desc clamp2">{e.description}</div>
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
                    <p>
                      {e.detail || e.description || "More details coming soon."}
                    </p>
                    <a
                      className="sg-more"
                      href={e.bookingUrl || SUBSTACK_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(ev) => ev.stopPropagation()}
                      style={{ background: c.c }}
                    >
                      MORE INFO ↗
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {weekStrip.length ? (
        <section className="sg-home-section">
          <div className="sg-home-week">
            <div className="sg-home-week-title">Also on this week</div>
            {weekStrip.map((e) => (
              <div key={e.slug} className="sg-home-week-row">
                <span className="d">{shortWeekdayDate(e.dateISO)}</span>
                <span className="sep"> · </span>
                <span className="v">{e.venue || "TBC"}</span>
                <span className="sep"> · </span>
                <span className="n">{e.title}</span>
              </div>
            ))}
            <button
              type="button"
              className="sg-home-link sg-home-week-link"
              onClick={() => onNavigate("whatson")}
            >
              See all events →
            </button>
          </div>
        </section>
      ) : null}

      <section className="sg-home-section">
        <div className="sg-home-places-head">
          <div className="sg-home-section-copy">
            <h2 className="sg-home-h2">Some of our favourite places</h2>
          </div>
          <button
            type="button"
            className="sg-home-alllink"
            onClick={() => onNavigate("places")}
          >
            All places →
          </button>
        </div>
        <div className="sg-home-place-grid">
          {placeTeasers.map((pl) => (
            <button
              key={pl.name}
              type="button"
              className="sg-home-place-card"
              onClick={() => onNavigate("places")}
            >
              <div className="sg-home-place-img">
                {pl.imageUrl ? (
                  <img src={pl.imageUrl} alt={pl.name} loading="lazy" decoding="async" />
                ) : (
                  <span className="sg-home-place-emoji" aria-hidden>
                    {pl.icon}
                  </span>
                )}
                {pl.pick ? (
                  <span className="sg-home-place-pick">✳ SALT PICK</span>
                ) : null}
              </div>
              <div className="sg-home-place-body">
                <div className="sg-home-place-kind">
                  {pl.type}
                  {pl.area ? ` · ${pl.area}` : ""}
                </div>
                <h3 className="sg-home-place-name">{pl.name}</h3>
                <p className="sg-home-place-line">{pl.line}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="sg-home-link sg-home-link-block sg-home-alllink-mobile"
          onClick={() => onNavigate("places")}
        >
          All places →
        </button>
      </section>

      <section id="signup" className="sg-nl sg-nl-home">
        <div className="t">The Sunday Email.</div>
        <p>
          What&apos;s worth doing in the week ahead, here and just beyond, plus
          new openings and bite-sized local news. Free, every Sunday at 7pm,
          join 740+ subscribers.
        </p>
        <a
          className="sg-nl-cta"
          href={SUBSTACK_ABOUT_URL}
          target="_blank"
          rel="noreferrer"
        >
          SUBSCRIBE ↗
        </a>
      </section>

      <section className="sg-pebbles-home">
        <div className="sg-pebbles-home-title">Got kids? 👋</div>
        <p>
          Our sister site{" "}
          <a href={PEBBLES_URL} target="_blank" rel="noreferrer">
            Pebbles List
          </a>{" "}
          has baby groups, classes and days out, bump to age 11.
        </p>
      </section>

      <p className="sg-home-footer">
        SALTGUIDE <span className="star">✳</span> MADE IN ST LEONARDS
      </p>

    </>
  );
}
