"use client";

import { useMemo, useState } from "react";
import {
  EVENT_CATS,
  HOME_PLACE_TEASER_FALLBACK,
  PEBBLES_URL,
  TYPE_LABEL,
} from "../../lib/guide/constants";
import {
  addDaysISO,
  eventBadgeLabel,
  londonTodayISO,
} from "../../lib/guide/events";
import { tint } from "../../lib/guide/images";
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

const SECTION_COLORS: Record<string, string> = {
  bar: "#FF6B57",
  pub: "#FF6B57",
  cinema: "#6FD5FF",
  cafe: "#FFA13D",
  restaurant: "#FFA13D",
  museum: "#B9A8FF",
  gallery: "#B9A8FF",
};

export default function HomeLanding({ events, venues, onNavigate }: Props) {
  const [email, setEmail] = useState("");
  const [signed, setSigned] = useState(false);

  const todayISO = londonTodayISO();
  const tomorrowISO = addDaysISO(todayISO, 1);

  const picks = useMemo(
    () => events.filter((e) => e.pick).slice(0, 3),
    [events],
  );

  const placeTeasers = useMemo((): PlaceTeaser[] => {
    const salty = venues.filter((v) => v.sp).slice(0, 3);
    if (!salty.length) return [...HOME_PLACE_TEASER_FALLBACK];
    return salty.map((v) => {
      const primaryType = v.types[0] ?? "";
      return {
        name: v.n,
        type: TYPE_LABEL[primaryType] || "Place",
        icon: "📍",
        c: SECTION_COLORS[primaryType] ?? "#C8F135",
        line: v.b,
      };
    });
  }, [venues]);

  return (
    <>
      <section className="sg-home-hero">
        <h1 className="sg-home-h1">
          Your guide to Hastings
          <br />
          &amp; <span className="hl">St Leonards.</span>
        </h1>
        <p className="sg-home-lede">
          What&apos;s on, where to go and what&apos;s actually worth your time.
          Written by locals, in your inbox every Sunday.
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
              document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            GET THE NEWSLETTER
          </button>
        </div>
      </section>

      {picks.length > 0 ? (
        <section className="sg-home-section">
          <div className="sg-home-section-head">
            <h2 className="sg-home-h2">This week&apos;s picks</h2>
            <button
              type="button"
              className="sg-home-link"
              onClick={() => onNavigate("whatson")}
            >
              All events →
            </button>
          </div>
          {picks.map((e) => {
            const c = EVENT_CATS[e.cat] ?? EVENT_CATS.art;
            const dLabel = eventBadgeLabel(e, todayISO, tomorrowISO);
            return (
              <div
                key={e.slug}
                className="sg-pick-card"
                style={{ background: tint(c.c, 0.9) }}
                onClick={() => onNavigate("whatson")}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") onNavigate("whatson");
                }}
                role="button"
                tabIndex={0}
              >
                <div className="sg-pick-thumb" aria-hidden>
                  {c.icon}
                </div>
                <div className="sg-pick-body">
                  <div className="sg-pick-meta">
                    <span className="sg-pick-date">{dLabel}</span>
                    <span className="sg-pick-cat">{c.label}</span>
                  </div>
                  <div className="sg-pick-title">{e.title}</div>
                  <div className="sg-pick-venue">
                    {[e.venue, e.time].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span className="sg-pick-arrow" aria-hidden>
                  →
                </span>
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="sg-home-section">
        <h2 className="sg-home-h2">Places we rate</h2>
        <p className="sg-home-sub">A taste of the full guide.</p>
        <div className="sg-place-grid">
          {placeTeasers.map((pl) => (
            <div
              key={pl.name}
              className="sg-place-teaser"
              style={{ background: tint(pl.c, 0.9) }}
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
        {signed ? (
          <div className="sg-nl-ok">You&apos;re in. See you Sunday. ✳</div>
        ) : (
          <div className="sg-nl-form">
            <input
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="you@email.com"
            />
            <button
              type="button"
              onClick={() => email.includes("@") && setSigned(true)}
            >
              SIGN UP
            </button>
          </div>
        )}
      </section>

      <section
        className="sg-pebbles-home"
        style={{ background: tint("#FF6B57", 0.9) }}
      >
        <div className="sg-pebbles-home-title">Got kids? 👋</div>
        <p>
          Our sister site{" "}
          <strong>
            <a href={PEBBLES_URL} target="_blank" rel="noreferrer">
              Pebbles List
            </a>
          </strong>{" "}
          has baby groups, classes and days out, bump to age 11.
        </p>
      </section>

      <p className="sg-home-footer">SALTGUIDE ✳ Made in St Leonards</p>
    </>
  );
}
