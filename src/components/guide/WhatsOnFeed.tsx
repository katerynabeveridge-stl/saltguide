"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  EVENT_CATS,
  PEBBLES_URL,
  SUBSTACK_ABOUT_URL,
  SUBSTACK_URL,
} from "../../lib/guide/constants";
import {
  addDaysISO,
  compareFeedEventsByDate,
  eventBadgeLabel,
  eventCardStyle,
  eventCoversDate,
  eventIsUpcoming,
  isExhibitionOrFestivalEvent,
  londonTodayISO,
  longDayName,
  matchesWhatsOnKind,
  shortDateLabel,
  weekendISODates,
} from "../../lib/guide/events";
import { tint } from "../../lib/guide/images";
import type { EventCat, FeedEvent } from "../../lib/guide/types";
import FilterSheet from "./FilterSheet";
import ListingThumb from "./ListingThumb";

type Props = {
  events: FeedEvent[];
};

type WhenFilter = "all" | "today" | "tomorrow" | "weekend" | string;

const EVENT_CAT_LIST = Object.entries(EVENT_CATS) as [
  EventCat,
  (typeof EVENT_CATS)[string],
][];

function eventSearchText(e: FeedEvent): string {
  const { visual, showCategoryBadge } = eventCardStyle(e);
  const catLabel = showCategoryBadge ? visual.label : "";
  return `${e.title} ${e.venue ?? ""} ${e.description ?? ""} ${catLabel}`;
}

export default function WhatsOnFeed({ events }: Props) {
  const [query, setQuery] = useState("");
  const [when, setWhen] = useState<WhenFilter>("all");
  const [cats, setCats] = useState<Set<EventCat>>(new Set());
  const [freeOnly, setFreeOnly] = useState(false);
  const [familyOnly, setFamilyOnly] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showSheetCal, setShowSheetCal] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [draftWhen, setDraftWhen] = useState<WhenFilter>("all");
  const [draftFreeOnly, setDraftFreeOnly] = useState(false);
  const [draftFamilyOnly, setDraftFamilyOnly] = useState(false);

  const todayISO = londonTodayISO();
  const tomorrowISO = addDaysISO(todayISO, 1);
  const weekend = weekendISODates();
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    for (const e of events) {
      dates.add(e.dateISO);
      if (
        e.endISO &&
        e.endISO > e.dateISO &&
        eventCoversDate(e, e.endISO)
      ) {
        let d = e.dateISO;
        for (let i = 0; i < 366 && d <= e.endISO; i += 1) {
          dates.add(d);
          d = addDaysISO(d, 1);
        }
      }
    }
    return dates;
  }, [events]);

  const matchWhen = (e: FeedEvent, w: WhenFilter = when) => {
    // Never list past events (client clock; covers days after a static build).
    if (!eventIsUpcoming(e, todayISO)) return false;
    if (w === "all") return true;
    if (w === "today") return eventCoversDate(e, todayISO);
    if (w === "tomorrow") return eventCoversDate(e, tomorrowISO);
    if (w === "weekend") return weekend.some((d) => eventCoversDate(e, d));
    return eventCoversDate(e, w);
  };

  const q = query.trim().toLowerCase();
  const allTypesSelected =
    cats.size === 0 || cats.size === EVENT_CAT_LIST.length;
  const filtered = useMemo(
    () =>
      events
        .filter(
          (e) =>
            matchWhen(e) &&
            matchesWhatsOnKind(
              e,
              cats,
              allTypesSelected,
              familyOnly,
              freeOnly,
            ) &&
            (!q || eventSearchText(e).toLowerCase().includes(q)),
        )
        .sort(compareFeedEventsByDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, when, cats, allTypesSelected, freeOnly, familyOnly, q, todayISO, tomorrowISO],
  );
  const exhibitionsAndFestivals = useMemo(
    () => filtered.filter(isExhibitionOrFestivalEvent),
    [filtered],
  );
  const list = useMemo(
    () => filtered.filter((e) => !isExhibitionOrFestivalEvent(e)),
    [filtered],
  );

  const typeCount = allTypesSelected ? 0 : cats.size;
  const filterCount =
    (when !== "all" ? 1 : 0) + (freeOnly ? 1 : 0) + (familyOnly ? 1 : 0);
  const isCustomDate =
    when !== "all" &&
    when !== "today" &&
    when !== "tomorrow" &&
    when !== "weekend";
  const draftIsCustomDate =
    draftWhen !== "all" &&
    draftWhen !== "today" &&
    draftWhen !== "tomorrow" &&
    draftWhen !== "weekend";
  const anyFilter = typeCount > 0 || filterCount > 0 || q.length > 0;
  const draftPreviewCount = useMemo(
    () =>
      events.filter(
        (e) =>
          matchWhen(e, draftWhen) &&
          matchesWhatsOnKind(
            e,
            cats,
            allTypesSelected,
            draftFamilyOnly,
            draftFreeOnly,
          ) &&
          (!q || eventSearchText(e).toLowerCase().includes(q)),
      ).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      events,
      draftWhen,
      cats,
      allTypesSelected,
      draftFreeOnly,
      draftFamilyOnly,
      q,
      todayISO,
      tomorrowISO,
    ],
  );

  const closeSheet = useCallback(() => {
    setShowSheet(false);
    setShowSheetCal(false);
  }, []);

  const openSheet = useCallback(() => {
    setDraftWhen(when);
    setDraftFreeOnly(freeOnly);
    setDraftFamilyOnly(familyOnly);
    setShowSheetCal(false);
    setShowCatMenu(false);
    setShowSheet(true);
  }, [when, freeOnly, familyOnly]);

  const applySheet = useCallback(() => {
    setWhen(draftWhen);
    setFreeOnly(draftFreeOnly);
    setFamilyOnly(draftFamilyOnly);
    setShowCal(false);
    setShowSheet(false);
    setShowSheetCal(false);
  }, [draftWhen, draftFreeOnly, draftFamilyOnly]);

  const clearSheet = useCallback(() => {
    setDraftWhen("all");
    setDraftFreeOnly(false);
    setDraftFamilyOnly(false);
    setShowSheetCal(false);
    setWhen("all");
    setFreeOnly(false);
    setFamilyOnly(false);
    setShowCal(false);
  }, []);

  const clearAll = () => {
    setWhen("all");
    setCats(new Set());
    setFreeOnly(false);
    setFamilyOnly(false);
    setShowCal(false);
    setShowCatMenu(false);
    setQuery("");
  };

  const toggleCat = (k: EventCat) => {
    if (allTypesSelected) {
      setCats(new Set([k]));
      return;
    }
    const next = new Set(cats);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setCats(next.size === EVENT_CAT_LIST.length ? new Set() : next);
  };

  const selectAllTypes = () => {
    setCats(new Set());
  };

  const typeTriggerLabel = (() => {
    if (allTypesSelected) return "All types";
    const parts: string[] = [];
    for (const [k, v] of EVENT_CAT_LIST) {
      if (cats.has(k)) parts.push(v.label);
    }
    return parts.join(", ") || "All types";
  })();

  useEffect(() => {
    if (!showCatMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCatMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCatMenu]);

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

      <div className="sg-places-toolbar">
        <div className="sg-cat-picker">
          <button
            type="button"
            className="sg-cat-select"
            aria-expanded={showCatMenu}
            aria-haspopup="listbox"
            aria-label="Filter by event type"
            onClick={() => setShowCatMenu((v) => !v)}
          >
            <span className="sg-cat-select-label">{typeTriggerLabel}</span>
            <span className="chev" aria-hidden>
              ▾
            </span>
          </button>
          {showCatMenu ? (
            <ul
              className="sg-cat-menu sg-cat-menu-multi"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Event types"
            >
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={allTypesSelected}
                  className={allTypesSelected ? "on" : ""}
                  onClick={selectAllTypes}
                >
                  All types
                </button>
              </li>
              {EVENT_CAT_LIST.map(([k, v]) => {
                const on = !allTypesSelected && cats.has(k);
                return (
                  <li key={k}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={on ? "on" : ""}
                      onClick={() => toggleCat(k)}
                    >
                      {v.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <button
          type="button"
          className={`sg-filter-btn${filterCount > 0 ? " on" : ""}`}
          onClick={openSheet}
        >
          <FilterIcon active={filterCount > 0} />
          Filters{filterCount > 0 ? ` · ${filterCount}` : ""}
        </button>
      </div>

      <div className="sg-summary">
        <strong>{whenLabel}</strong>
        <span>
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
          {!allTypesSelected &&
            ` · ${EVENT_CAT_LIST.filter(([k]) => cats.has(k))
              .map(([, v]) => v.label)
              .join(", ")}`}
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

      {filtered.length === 0 ? (
        <div className="sg-empty">
          <h3>Nothing matches</h3>
          Try another date or clear a filter.
        </div>
      ) : null}

      {exhibitionsAndFestivals.length ? (
        <section
          className="sg-feed-section"
          aria-label="Upcoming exhibitions and festivals"
        >
          <h2 className="sg-feed-h2">Upcoming exhibitions and festivals</h2>
          <div className="sg-exh-list">
            {exhibitionsAndFestivals.map((e) => (
              <FeedEventCard
                key={e.slug}
                event={e}
                todayISO={todayISO}
                tomorrowISO={tomorrowISO}
                open={open}
                setOpen={setOpen}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}

      {list.length ? (
        <section className="sg-feed-section" aria-label="All upcoming events">
          <h2 className="sg-feed-h2">All upcoming events</h2>
          {list.map((e, i) => {
            return (
              <Fragment key={e.slug}>
                <FeedEventCard
                  event={e}
                  todayISO={todayISO}
                  tomorrowISO={tomorrowISO}
                  open={open}
                  setOpen={setOpen}
                />

                {i === 3 ? (
                  <div className="sg-nl-inline">
                    <div className="t">Never miss a week.</div>
                    <p>All of this in your inbox, every Sunday. Free.</p>
                    <a
                      className="sg-nl-cta"
                      href={SUBSTACK_ABOUT_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      SUBSCRIBE ↗
                    </a>
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </section>
      ) : null}

      <div className="sg-nl">
        <div className="t">Get this in your inbox.</div>
        <p>The Sunday Email — the week ahead, every Sunday, free.</p>
        <a
          className="sg-nl-cta"
          href={SUBSTACK_ABOUT_URL}
          target="_blank"
          rel="noreferrer"
        >
          SUBSCRIBE ↗
        </a>
      </div>

      {showSheet ? (
        <FilterSheet
          onClose={closeSheet}
          onClearAll={clearSheet}
          onApply={applySheet}
          applyLabel={`Show results · ${draftPreviewCount}`}
        >
          <div className="sg-narrow-lbl">WHEN</div>
          <div className="sg-row sg-sheet-when">
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
                className={`sg-pill${draftWhen === k ? " on" : ""}`}
                onClick={() => {
                  setDraftWhen(draftWhen === k ? "all" : k);
                  setShowSheetCal(false);
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className={`sg-pill${draftIsCustomDate || showSheetCal ? " on" : ""}`}
              onClick={() => {
                if (draftIsCustomDate) {
                  setDraftWhen("all");
                  setShowSheetCal(false);
                } else {
                  setShowSheetCal(!showSheetCal);
                }
              }}
            >
              📅{" "}
              {draftIsCustomDate ? shortDateLabel(draftWhen) : "Pick a date"}
              {draftIsCustomDate ? " ✕" : ""}
            </button>
          </div>

          {showSheetCal ? (
            <MonthCalendar
              selected={draftIsCustomDate ? draftWhen : null}
              todayISO={todayISO}
              eventDates={eventDates}
              onSelect={(d) => {
                setDraftWhen(draftIsCustomDate && draftWhen === d ? "all" : d);
                setShowSheetCal(false);
              }}
            />
          ) : null}

          <div className="sg-narrow-lbl">NARROW IT DOWN</div>
          <div className="sg-pill-wrap">
            <button
              type="button"
              className={`sg-pill${draftFreeOnly ? " on" : ""}`}
              onClick={() => setDraftFreeOnly(!draftFreeOnly)}
            >
              🏷️ Free only{draftFreeOnly ? " ✓" : ""}
            </button>
            <button
              type="button"
              className={`sg-pill${draftFamilyOnly ? " on" : ""}`}
              onClick={() => setDraftFamilyOnly(!draftFamilyOnly)}
            >
              👨‍👩‍👧 Family friendly{draftFamilyOnly ? " ✓" : ""}
            </button>
          </div>
        </FilterSheet>
      ) : null}

      {showCatMenu ? (
        <button
          type="button"
          className="sg-cat-menu-scrim"
          aria-label="Close type menu"
          onClick={() => setShowCatMenu(false)}
        />
      ) : null}
    </>
  );
}

function FeedEventCard({
  event: e,
  todayISO,
  tomorrowISO,
  open,
  setOpen,
  compact = false,
}: {
  event: FeedEvent;
  todayISO: string;
  tomorrowISO: string;
  open: string | null;
  setOpen: (slug: string | null) => void;
  compact?: boolean;
}) {
  const { visual: c, showCategoryBadge } = eventCardStyle(e);
  const dLabel = eventBadgeLabel(e, todayISO, tomorrowISO);
  const isOpen = open === e.slug;
  return (
    <div
      className={`sg-card${compact ? " sg-exh-card" : ""}`}
      style={{ background: tint(c.c, 0.9) }}
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
            {(!compact || isOpen) && showCategoryBadge ? (
              <span className="sg-badge-cat">
                <i style={{ background: c.c }} />
                {c.label}
              </span>
            ) : null}
            {(!compact || isOpen) && e.pick ? (
              <span className="sg-badge-pick">✳ PICK</span>
            ) : null}
            {(!compact || isOpen) && e.family ? (
              <span className="sg-badge-family">👨‍👩‍👧 Family friendly</span>
            ) : null}
          </div>
          <div className="sg-card-title">{e.title}</div>
          {(!compact || isOpen) && (e.venue || e.time || e.price) ? (
            <div className="sg-card-meta">
              {e.venue}
              {e.venue && e.time ? " · " : null}
              {e.time}
              {(e.venue || e.time) && e.price ? " · " : null}
              {e.price ? <strong>{e.price}</strong> : null}
            </div>
          ) : null}
          {!compact && !isOpen && e.description ? (
            <div className="sg-card-desc clamp2">{e.description}</div>
          ) : null}
        </div>
        <span className={`sg-card-plus${isOpen ? " open" : ""}`} aria-hidden>
          +
        </span>
      </div>
      {isOpen ? (
        <div className="sg-card-expand">
          <p>{e.detail || e.description || "More details coming soon."}</p>
          <a
            className="sg-more"
            href={e.bookingUrl || SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
            onClick={(ev) => ev.stopPropagation()}
          >
            MORE INFO
          </a>
        </div>
      ) : null}
    </div>
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
