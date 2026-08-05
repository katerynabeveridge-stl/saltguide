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
  icon: string;
  c: string;
  line: string;
};

const PICK_BG = ["#F27BC0", "#C9B8F0", "#F5A54A"] as const;
const PLACE_BG = ["#F5A54A", "#C9B8F0", "#F27BC0"] as const;

const SECTION_COLORS: Record<string, string> = {
  bar: "#F0785C",
  pub: "#F0785C",
  cinema: "#C9B8F0",
  cafe: "#F5A54A",
  restaurant: "#F5A54A",
  museum: "#C9B8F0",
  gallery: "#C9B8F0",
};

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
    const salty = venues.filter((v) => v.sp).slice(0, 3);
    if (!salty.length) {
      return HOME_PLACE_TEASER_FALLBACK.map((pl, i) => ({
        ...pl,
        c: PLACE_BG[i % PLACE_BG.length],
      }));
    }
    return salty.map((v, i) => {
      const primaryType = v.types[0] ?? "";
      return {
        name: v.n,
        type: TYPE_LABEL[primaryType] || "Place",
        icon: "📍",
        c: SECTION_COLORS[primaryType] ?? PLACE_BG[i % PLACE_BG.length],
        line: v.b,
      };
    });
  }, [venues]);

  return (
    <>
      <section className="sg-home-hero">
        <h1 className="sg-home-h1">
          Your guide to Hastings{" "}
          <span className="sg-home-h1-inline">
            &amp; <span className="hl">St Leonards.</span>
          </span>
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
            SEE WHAT&apos;S ON
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
            GET THE SUNDAY EMAIL
          </button>
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
        <div className="sg-home-section-copy">
          <h2 className="sg-home-h2">Places we rate</h2>
          <p className="sg-home-sub">A taste of the full guide.</p>
        </div>
        <div className="sg-place-stack">
          {placeTeasers.map((pl) => (
            <div
              key={pl.name}
              className="sg-place-teaser"
              style={{ background: pl.c }}
            >
              <div className="sg-place-icon" aria-hidden>
                {pl.icon}
              </div>
              <div className="sg-place-name">{pl.name}</div>
              <div className="sg-place-type">{pl.type}</div>
              <div className="sg-place-line">{pl.line}</div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="sg-home-link sg-home-link-block"
          onClick={() => onNavigate("places")}
        >
          Explore all places →
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
