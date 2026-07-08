"use client";

import { Fragment, useMemo, useState } from "react";
import { EVENT_CATS, PEBBLES_URL, SUBSTACK_URL } from "../../lib/guide/constants";
import {
  addDaysISO,
  badgeDateLabel,
  londonTodayISO,
  longDayName,
  shortDateLabel,
  weekendISODates,
} from "../../lib/guide/events";
import type { EventCat, FeedEvent } from "../../lib/guide/types";
import ListingThumb from "./ListingThumb";

type Props = {
  events: FeedEvent[];
};

type WhenFilter = "all" | "today" | "tomorrow" | "weekend" | string;

export default function WhatsOnFeed({ events }: Props) {
  const [query, setQuery] = useState("");
  const [when, setWhen] = useState<WhenFilter>("all");
  const [cats, setCats] = useState<Set<EventCat>>(new Set());
  const [freeOnly, setFreeOnly] = useState(false);
  const [familyOnly, setFamilyOnly] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [signed, setSigned] = useState(false);

  const todayISO = londonTodayISO();
  const tomorrowISO = addDaysISO(todayISO, 1);
  const weekend = weekendISODates();
  const eventDates = useMemo(
    () => new Set(events.map((e) => e.dateISO)),
    [events],
  );

  const matchWhen = (e: FeedEvent) => {
    if (when === "all") return true;
    if (when === "today") return e.dateISO === todayISO;
    if (when === "tomorrow") return e.dateISO === tomorrowISO;
    if (when === "weekend") return weekend.includes(e.dateISO);
    return e.dateISO === when;
  };

  const q = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      events
        .filter(
          (e) =>
            matchWhen(e) &&
            (cats.size === 0 || cats.has(e.cat)) &&
            (!freeOnly || e.free) &&
            (!familyOnly || e.family) &&
            (!q ||
              `${e.title} ${e.venue ?? ""} ${e.description ?? ""} ${EVENT_CATS[e.cat]?.label ?? ""}`
                .toLowerCase()
                .includes(q)),
        )
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, when, cats, freeOnly, familyOnly, q, todayISO, tomorrowISO],
  );

  const kindCount = cats.size + (freeOnly ? 1 : 0) + (familyOnly ? 1 : 0);
  const isCustomDate =
    when !== "all" &&
    when !== "today" &&
    when !== "tomorrow" &&
    when !== "weekend";
  const anyFilter = when !== "all" || kindCount > 0 || q.length > 0;

  const clearAll = () => {
    setWhen("all");
    setCats(new Set());
    setFreeOnly(false);
    setFamilyOnly(false);
    setShowCal(false);
    setQuery("");
  };

  const toggleCat = (k: EventCat) => {
    const next = new Set(cats);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setCats(next);
  };

  const whenLabel =
    when === "all"
      ? "All upcoming"
      : when === "today"
        ? "Today"
        : when === "tomorrow"
          ? "Tomorrow"
          : when === "weekend"
            ? "This weekend"
            : `${longDayName(when)} ${parseInt(when.slice(-2), 10)} ${monthWord(when)}`;

  return (
    <>
      <h1 className="sg-h1">
        What&apos;s <span className="hl">on</span>
      </h1>
      <p className="sg-lede" style={{ marginBottom: 22 }}>
        This week and beyond in Hastings &amp; St Leonards.
      </p>

      <div className="sg-search-bar">
        <div className="sg-search">
          <span aria-hidden>🔍</span>
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="What would you like to do?"
          />
          {query ? (
            <button
              type="button"
              className="clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className={`sg-filter-btn${kindCount > 0 ? " on" : ""}`}
          onClick={() => setShowSheet(true)}
        >
          <FilterIcon active={kindCount > 0} />
          FILTERS{kindCount > 0 ? ` · ${kindCount}` : ""}
        </button>
      </div>

      <div className="sg-row">
        {(
          [
            ["today", "Today"],
            ["tomorrow", "Tomorrow"],
            ["weekend", "This weekend"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`sg-pill${when === k ? " on" : ""}`}
            onClick={() => {
              setWhen(when === k ? "all" : k);
              setShowCal(false);
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`sg-pill${isCustomDate || showCal ? " on" : ""}`}
          onClick={() => {
            if (isCustomDate) {
              setWhen("all");
              setShowCal(false);
            } else {
              setShowCal(!showCal);
            }
          }}
        >
          📅 {isCustomDate ? shortDateLabel(when) : "Pick a date"}
          {isCustomDate ? " ✕" : ""}
        </button>
      </div>

      {showCal ? (
        <MonthCalendar
          selected={isCustomDate ? when : null}
          todayISO={todayISO}
          eventDates={eventDates}
          onSelect={(d) => {
            setWhen(isCustomDate && when === d ? "all" : d);
            setShowCal(false);
          }}
        />
      ) : null}

      <div className="sg-summary">
        <strong>{whenLabel}</strong>
        <span>
          {list.length} {list.length === 1 ? "event" : "events"}
          {cats.size > 0 &&
            ` · ${[...cats].map((k) => EVENT_CATS[k]?.label).join(", ")}`}
          {freeOnly && " · free"}
          {familyOnly && " · family friendly"}
          {q && ` · “${query.trim()}”`}
        </span>
        {anyFilter ? (
          <button type="button" className="clear-all" onClick={clearAll}>
            Clear all
          </button>
        ) : null}
      </div>

      {familyOnly ? (
        <div className="sg-pebbles-note">
          Looking for kids&apos; classes and days out? Our sister site{" "}
          <a href={PEBBLES_URL} target="_blank" rel="noreferrer">
            <strong>Pebbles List ↗</strong>
          </a>{" "}
          has the lot.
        </div>
      ) : null}

      {list.length === 0 ? (
        <div className="sg-empty">
          <h3>Nothing matches</h3>
          Try another date or clear a filter.
        </div>
      ) : null}

      {list.map((e, i) => {
        const c = EVENT_CATS[e.cat] ?? EVENT_CATS.art;
        const dLabel = badgeDateLabel(e.dateISO, todayISO, tomorrowISO);
        const isOpen = open === e.slug;
        const meta = [e.venue, e.time].filter(Boolean).join(" · ");
        return (
          <Fragment key={e.slug}>
            <div
              className="sg-card"
              onClick={() => setOpen(isOpen ? null : e.slug)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  setOpen(isOpen ? null : e.slug);
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
                      <span className="sg-badge-family">👨‍👩‍👧 Family friendly</span>
                    ) : null}
                    {e.free ? (
                      <span className="sg-badge-family">Free</span>
                    ) : null}
                  </div>
                  <div className="sg-card-title">{e.title}</div>
                  {meta ? <div className="sg-card-meta">{meta}</div> : null}
                  {e.description ? (
                    <div className="sg-card-take">&ldquo;{e.description}&rdquo;</div>
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
                  <p>{e.detail || e.description || "More details coming soon."}</p>
                  {e.bookingUrl ? (
                    <a
                      className="sg-more"
                      href={e.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(ev) => ev.stopPropagation()}
                      style={{ background: c.c }}
                    >
                      MORE INFO ↗
                    </a>
                  ) : (
                    <a
                      className="sg-more"
                      href={SUBSTACK_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(ev) => ev.stopPropagation()}
                      style={{ background: c.c }}
                    >
                      MORE INFO ↗
                    </a>
                  )}
                </div>
              ) : null}
            </div>

            {i === 3 ? (
              <div className="sg-nl-inline">
                <div className="t">Never miss a week.</div>
                <p>All of this in your inbox, every Sunday. Free.</p>
                {signed ? (
                  <div className="sg-nl-ok">You&apos;re in. See you Sunday. ✳</div>
                ) : (
                  <div className="sg-nl-form">
                    <input
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      placeholder="you@email.com"
                      onClick={(ev) => ev.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={() => email.includes("@") && setSigned(true)}
                    >
                      SIGN UP
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </Fragment>
        );
      })}

      <div className="sg-nl">
        <div className="t">Get this in your inbox.</div>
        <p>The Sunday Email — the week ahead, every Sunday, free.</p>
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
      </div>

      {showSheet ? (
        <div
          className="sg-sheet-backdrop"
          onClick={() => setShowSheet(false)}
          role="presentation"
        >
          <div
            className="sg-sheet"
            onClick={(ev) => ev.stopPropagation()}
            role="dialog"
            aria-label="Filters"
          >
            <div className="sg-sheet-handle" />
            <div className="sg-sheet-head">
              <h3>What kind of thing?</h3>
              {kindCount > 0 ? (
                <button
                  type="button"
                  className="clear"
                  onClick={() => {
                    setCats(new Set());
                    setFreeOnly(false);
                    setFamilyOnly(false);
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="sg-cat-grid">
              {(Object.entries(EVENT_CATS) as [EventCat, (typeof EVENT_CATS)[string]][]).map(
                ([k, v]) => {
                  const on = cats.has(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      className={`sg-cat-btn${on ? " on" : ""}`}
                      style={{ background: on ? v.c : undefined }}
                      onClick={() => toggleCat(k)}
                    >
                      <span
                        className="dot"
                        style={{ background: v.c }}
                        aria-hidden
                      />
                      {v.label}
                      {on ? <span style={{ marginLeft: "auto" }}>✓</span> : null}
                    </button>
                  );
                },
              )}
            </div>

            <div className="sg-narrow-lbl">NARROW IT DOWN</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`sg-pill${freeOnly ? " on" : ""}`}
                onClick={() => setFreeOnly(!freeOnly)}
              >
                🏷️ Free only{freeOnly ? " ✓" : ""}
              </button>
              <button
                type="button"
                className={`sg-pill${familyOnly ? " on" : ""}`}
                onClick={() => setFamilyOnly(!familyOnly)}
              >
                👨‍👩‍👧 Family friendly{familyOnly ? " ✓" : ""}
              </button>
            </div>

            <button
              type="button"
              className="sg-show-btn"
              onClick={() => setShowSheet(false)}
            >
              SHOW {list.length} {list.length === 1 ? "EVENT" : "EVENTS"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function monthWord(dateISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    month: "long",
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

function FilterIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line x1="1" y1="3.5" x2="14" y2="3.5" stroke="currentColor" strokeWidth="2" />
      <line x1="1" y1="11.5" x2="14" y2="11.5" stroke="currentColor" strokeWidth="2" />
      <circle
        cx="10"
        cy="3.5"
        r="2.6"
        fill={active ? "var(--sg-green)" : "var(--sg-card)"}
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="5"
        cy="11.5"
        r="2.6"
        fill={active ? "var(--sg-green)" : "var(--sg-card)"}
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MonthCalendar({
  selected,
  todayISO,
  eventDates,
  onSelect,
}: {
  selected: string | null;
  todayISO: string;
  eventDates: Set<string>;
  onSelect: (d: string) => void;
}) {
  const [y, m] = todayISO.split("-").map(Number);
  const monthStart = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  // Monday-first: UTC day 0=Sun → lead days
  const firstDow = monthStart.getUTCDay();
  const lead = firstDow === 0 ? 6 : firstDow - 1;
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const todayDay = parseInt(todayISO.slice(-2), 10);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthStart);

  const isoFor = (n: number) =>
    `${y}-${String(m).padStart(2, "0")}-${String(n).padStart(2, "0")}`;

  return (
    <div className="sg-cal">
      <div className="sg-cal-title">{monthLabel}</div>
      <div className="sg-cal-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={`${d}-${i}`} className="sg-cal-dow">
            {d}
          </div>
        ))}
        {cells.map((n, i) => {
          if (!n) return <div key={`b${i}`} />;
          const dIso = isoFor(n);
          const has = eventDates.has(dIso);
          const past = n < todayDay;
          const sel = selected === dIso;
          return (
            <button
              key={n}
              type="button"
              disabled={past}
              className={`sg-cal-day${has ? " has" : ""}${sel ? " sel" : ""}${past ? " past" : ""}`}
              onClick={() => onSelect(dIso)}
            >
              {n}
              {has && !sel ? <span className="dot" /> : null}
            </button>
          );
        })}
      </div>
      <div className="sg-cal-legend">
        <i />
        = events listed
      </div>
    </div>
  );
}
