"use client";

import { useMemo, useState } from "react";
import {
  EVENT_CATS,
  HOME_PLACE_TEASER_FALLBACK,
  PEBBLES_URL,
  SUBSTACK_ABOUT_URL,
  TYPE_LABEL,
} from "../../lib/guide/constants";
import {
  homeWeekPicks,
  homeWeekStrip,
  londonTodayISO,
  shortWeekdayDate,
} from "../../lib/guide/events";
import { placeImageUrls, placeTypeVisual } from "../../lib/guide/placeMedia";
import type { FeedEvent, Venue } from "../../lib/guide/types";

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

const PICK_BG = ["#F27BC0", "#C9B8F0", "#F5A54A"] as const;

export default function HomeLanding({ events, venues, onNavigate }: Props) {
  const todayISO = londonTodayISO();
  const [openPick, setOpenPick] = useState<FeedEvent | null>(null);

  const picks = useMemo(
    () => homeWeekPicks(events, todayISO, 3),
    [events, todayISO],
  );

  const weekStrip = useMemo(() => {
    const exclude = new Set(picks.map((p) => p.slug));
    return homeWeekStrip(events, todayISO, exclude, 5);
  }, [events, todayISO, picks]);

  const placeTeasers = useMemo((): PlaceTeaser[] => {
    const featured = venues.filter((v) => v.b).slice(0, 3);
    if (!featured.length) {
      return HOME_PLACE_TEASER_FALLBACK.map((pl) => ({
        name: pl.name,
        type: pl.type,
        area: "",
        icon: pl.icon,
        pick: false,
        line: pl.line,
      }));
    }
    return featured.map((v) => {
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
              className="sg-btn-primary"
              onClick={() => onNavigate("whatson")}
            >
              See what&apos;s on
            </button>
            <button
              type="button"
              className="sg-btn-secondary"
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
          <div className="sg-home-picks-rail">
            {picks.map((e, i) => {
              const c = EVENT_CATS[e.cat] ?? EVENT_CATS.art;
              const bg = PICK_BG[i % PICK_BG.length];
              return (
                <button
                  key={e.slug}
                  type="button"
                  className="sg-home-pick"
                  style={{ background: bg }}
                  onClick={() => setOpenPick(e)}
                >
                  <div className="sg-home-pick-top">
                    <span className="sg-home-pick-date">
                      {shortWeekdayDate(e.dateISO).toUpperCase()}
                    </span>
                    {e.pick ? (
                      <span className="sg-home-pick-tag">✳ PICK</span>
                    ) : (
                      <span className="sg-home-pick-tag muted">{c.label}</span>
                    )}
                  </div>
                  <div className="sg-home-pick-emoji" aria-hidden>
                    {c.icon}
                  </div>
                  <div className="sg-home-pick-title">{e.title}</div>
                  {e.venue ? (
                    <div className="sg-home-pick-venue">{e.venue}</div>
                  ) : null}
                  {e.description ? (
                    <div className="sg-home-pick-blurb">{e.description}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {weekStrip.length ? (
        <section className="sg-home-section">
          <div className="sg-home-week">
            <div className="sg-home-week-title">Also on this week</div>
            <div className="sg-home-week-sub">The quick version. No fluff.</div>
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
            <h2 className="sg-home-h2">Where we&apos;d send a friend</h2>
            <p className="sg-home-sub">
              Ninety-odd places, visited and vouched for.
            </p>
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
          The week ahead in Hastings &amp; St Leonards, every Sunday. Free, on
          Substack. Join 600+ locals.
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

      {openPick ? (
        <div
          className="sg-sheet-backdrop"
          onClick={() => setOpenPick(null)}
          role="presentation"
        >
          <div
            className="sg-sheet sg-home-pick-sheet"
            onClick={(ev) => ev.stopPropagation()}
            role="dialog"
            aria-label={openPick.title}
          >
            <div className="sg-sheet-handle" />
            <div className="sg-home-pick-sheet-badges">
              <span className="sg-home-pick-date">
                {shortWeekdayDate(openPick.dateISO).toUpperCase()}
              </span>
              {openPick.pick ? (
                <span className="sg-home-pick-tag">✳ SALT PICK</span>
              ) : null}
            </div>
            <div className="sg-home-pick-sheet-title">{openPick.title}</div>
            {openPick.venue ? (
              <div className="sg-home-pick-sheet-venue">{openPick.venue}</div>
            ) : null}
            <p className="sg-home-pick-sheet-body">
              {openPick.detail || openPick.description || "More details coming soon."}
            </p>
            <button
              type="button"
              className="sg-btn-primary sg-home-pick-sheet-close"
              onClick={() => setOpenPick(null)}
            >
              CLOSE
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
