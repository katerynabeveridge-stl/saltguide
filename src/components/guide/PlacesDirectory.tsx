"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATS,
  GOOD_FOR,
  PEBBLES_URL,
  SUBTYPES,
  TYPE_LABEL,
} from "../../lib/guide/constants";
import {
  applyCtxFilter,
  inSection,
  kindLabel,
  presentTags,
} from "../../lib/guide/filters";
import type { Category, CtxState, Venue, VenueLinks } from "../../lib/guide/types";
import PlaceCard from "./PlaceCard";

type Props = {
  venues: Venue[];
  links: Record<string, VenueLinks>;
};

const DEFAULT_CAT = CATS.find((c) => !c.soon)?.id ?? "eatdrink";

function venueSearchHaystack(v: Venue, catId: string | null): string {
  const typeLabels = v.types.map((t) => TYPE_LABEL[t] || t).join(" ");
  const kind = kindLabel(v, catId);
  return `${v.n} ${v.a} ${v.b} ${typeLabels} ${kind} ${v.tags.join(" ")}`;
}

function buildCtx(
  catId: string,
  venues: Venue[],
  sub: string | null = null,
  tags: string[] = [],
): CtxState {
  return {
    catId,
    sub,
    tags,
    base: inSection(catId, venues),
  };
}

export default function PlacesDirectory({ venues, links }: Props) {
  const [ctx, setCtx] = useState<CtxState>(() =>
    buildCtx(DEFAULT_CAT, venues),
  );
  const [query, setQuery] = useState("");
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [draftSub, setDraftSub] = useState<string | null>(null);
  const [draftTags, setDraftTags] = useState<string[]>([]);

  const activeCat = CATS.find((c) => c.id === ctx.catId) ?? CATS[0];
  const soonMode = Boolean(activeCat?.soon);
  const subtypes = ctx.catId ? SUBTYPES[ctx.catId] || [] : [];

  // Keep section base in sync if venues data changes (build remounts usually).
  useEffect(() => {
    if (!ctx.catId || soonMode) return;
    setCtx((prev) => ({
      ...prev,
      base: inSection(prev.catId as string, venues),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues]);

  const filteredItems = useMemo(() => applyCtxFilter(ctx), [ctx]);
  const q = query.trim().toLowerCase();
  const listedItems = useMemo(() => {
    if (!q) return filteredItems;
    return filteredItems.filter((v) =>
      venueSearchHaystack(v, ctx.catId).toLowerCase().includes(q),
    );
  }, [filteredItems, q, ctx.catId]);

  const sheetCtx = useMemo(
    (): CtxState => ({
      ...ctx,
      sub: draftSub,
      tags: draftTags,
    }),
    [ctx, draftSub, draftTags],
  );
  const sheetTags = useMemo(() => presentTags(sheetCtx), [sheetCtx]);
  const draftPreviewCount = useMemo(
    () => applyCtxFilter(sheetCtx).length,
    [sheetCtx],
  );

  const filterCount = (ctx.sub ? 1 : 0) + ctx.tags.length;
  const anyFilter = filterCount > 0 || q.length > 0;

  const summaryLabel = q
    ? "Matches"
    : ctx.tags.length === 1
      ? GOOD_FOR[ctx.tags[0]] || "Filtered"
      : ctx.tags.length > 1
        ? "Filtered"
        : ctx.sub
          ? subtypes.find((s) => s.id === ctx.sub)?.short || "Filtered"
          : "All places";

  const selectCategory = useCallback(
    (cat: Category) => {
      setShowCatMenu(false);
      setQuery("");
      setCtx(buildCtx(cat.id, venues));
    },
    [venues],
  );

  const openSheet = useCallback(() => {
    setDraftSub(ctx.sub);
    setDraftTags([...ctx.tags]);
    setShowSheet(true);
    setShowCatMenu(false);
  }, [ctx.sub, ctx.tags]);

  const applySheet = useCallback(() => {
    setCtx((prev) => ({ ...prev, sub: draftSub, tags: draftTags }));
    setShowSheet(false);
  }, [draftSub, draftTags]);

  const clearDraft = useCallback(() => {
    setDraftSub(null);
    setDraftTags([]);
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setCtx((prev) => ({ ...prev, sub: null, tags: [] }));
  }, []);

  const toggleDraftTag = useCallback((tag: string) => {
    setDraftTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSheet(false);
        setShowCatMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="sg-places-intro">
        <h1 className="sg-h1">Places.</h1>
        <p className="sg-lede">
          Our little black book of Hastings &amp; St Leonards.
        </p>
      </div>

      <div className="sg-search-bar">
        <div className="sg-search">
          <span aria-hidden>🔍</span>
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Where do you want to go?"
            aria-label="Search places"
            disabled={soonMode}
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

      <div className="sg-places-toolbar">
        <div className="sg-cat-picker">
          <button
            type="button"
            className="sg-cat-select"
            aria-expanded={showCatMenu}
            aria-haspopup="listbox"
            onClick={() => setShowCatMenu((v) => !v)}
          >
            <span>{activeCat.label}</span>
            <span className="chev" aria-hidden>
              ▾
            </span>
          </button>
          {showCatMenu ? (
            <ul className="sg-cat-menu" role="listbox">
              {CATS.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={cat.id === ctx.catId}
                    className={cat.id === ctx.catId ? "on" : ""}
                    onClick={() => selectCategory(cat)}
                  >
                    {cat.label}
                    {cat.soon ? <span className="soon-badge">soon</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="button"
          className={`sg-filter-btn${filterCount > 0 ? " on" : ""}`}
          onClick={openSheet}
          disabled={soonMode}
        >
          <FilterIcon active={filterCount > 0} />
          Filters{filterCount > 0 ? ` · ${filterCount}` : ""}
        </button>
      </div>

      {soonMode ? (
        <div className="sg-places-empty" style={{ marginTop: 28 }}>
          <h4>{activeCat.label} is coming</h4>
          <p>
            {activeCat.tagline ?? ""}. We&apos;re curating it now — reply to the
            newsletter with somewhere we should include.
          </p>
        </div>
      ) : (
        <>
          <div className="sg-summary">
            <strong>{summaryLabel}</strong>
            <span>
              {listedItems.length}{" "}
              {listedItems.length === 1 ? "place" : "places"}
              {q ? ` · “${query.trim()}”` : ""}
            </span>
            {anyFilter ? (
              <button type="button" className="clear-all" onClick={clearAll}>
                Clear all
              </button>
            ) : null}
          </div>

          <VenueList
            items={listedItems}
            links={links}
            catId={ctx.catId}
            showPebbles={ctx.catId === "family"}
            emptyFromSearch={Boolean(q) || anyFilter}
          />
        </>
      )}

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
              <h3>Filters</h3>
            </div>

            {subtypes.length ? (
              <>
                <div className="sg-narrow-lbl">TYPE · pick one</div>
                <div className="sg-pill-wrap">
                  {subtypes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`sg-pill${draftSub === s.id ? " on" : ""}`}
                      onClick={() =>
                        setDraftSub(draftSub === s.id ? null : s.id)
                      }
                    >
                      {s.short}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {sheetTags.length ? (
              <>
                <div className="sg-narrow-lbl">
                  {ctx.catId === "eatdrink" ? "GOOD FOR" : "FILTER"} · pick any
                </div>
                <div className="sg-pill-wrap">
                  {sheetTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`sg-pill${draftTags.includes(t) ? " on" : ""}`}
                      onClick={() => toggleDraftTag(t)}
                    >
                      {GOOD_FOR[t] || t}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {!subtypes.length && !sheetTags.length ? (
              <p className="sg-sheet-empty">
                No filters for this section yet.
              </p>
            ) : null}

            <div className="sg-sheet-foot">
              <button
                type="button"
                className="sg-sheet-clear"
                onClick={clearDraft}
              >
                Clear
              </button>
              <button
                type="button"
                className="sg-sheet-apply"
                onClick={applySheet}
              >
                Show places
                {draftSub || draftTags.length
                  ? ` · ${draftPreviewCount}`
                  : ""}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCatMenu ? (
        <button
          type="button"
          className="sg-cat-menu-scrim"
          aria-label="Close category menu"
          onClick={() => setShowCatMenu(false)}
        />
      ) : null}
    </>
  );
}

function VenueList({
  items,
  links,
  catId,
  showPebbles,
  emptyFromSearch,
}: {
  items: Venue[];
  links: Record<string, VenueLinks>;
  catId: string | null;
  showPebbles: boolean;
  emptyFromSearch?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);

  if (!items.length) {
    return (
      <>
        {showPebbles ? <PebblesCta /> : null}
        <div className="sg-places-empty">
          <h4>{emptyFromSearch ? "No matches" : "Nothing here yet"}</h4>
          <p>
            {emptyFromSearch
              ? "Try a different search, or clear filters."
              : "We'd rather show nothing than guess. This one's still being tagged."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {showPebbles ? <PebblesCta /> : null}
      {items.map((v) => {
        const lnk = links[v.slug] || {};
        const mapsQ = encodeURIComponent(`${v.n}, ${v.a}, East Sussex`);
        const mapsUrl = `https://maps.google.com/?q=${mapsQ}`;
        return (
          <PlaceCard
            key={v.slug}
            venue={v}
            links={lnk}
            mapsUrl={mapsUrl}
            label={kindLabel(v, catId)}
            isOpen={open === v.slug}
            onToggle={() => setOpen(open === v.slug ? null : v.slug)}
          />
        );
      })}
    </>
  );
}

function PebblesCta() {
  return (
    <div className="sg-pebbles-cta">
      <div>
        <div className="kicker">Also on Pebbles List</div>
        <p>Classes, baby groups and local activities — the full family picture.</p>
      </div>
      <a href={PEBBLES_URL} target="_blank" rel="noreferrer">
        Visit →
      </a>
    </div>
  );
}

function FilterIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line
        x1="1"
        y1="3.5"
        x2="14"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="1"
        y1="11.5"
        x2="14"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="2"
      />
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
