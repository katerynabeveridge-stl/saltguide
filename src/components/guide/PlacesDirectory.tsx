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

const EMPTY_CTX: CtxState = { catId: null, sub: null, tag: null, base: [] };

function venueSearchHaystack(v: Venue, catId: string | null): string {
  const typeLabels = v.types
    .map((t) => TYPE_LABEL[t] || t)
    .join(" ");
  const kind = kindLabel(v, catId);
  return `${v.n} ${v.a} ${v.b} ${typeLabels} ${kind} ${v.tags.join(" ")}`;
}

export default function PlacesDirectory({ venues, links }: Props) {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<CtxState>(EMPTY_CTX);
  const [title, setTitle] = useState("Results");
  const [soonMode, setSoonMode] = useState(false);
  const [soonMessage, setSoonMessage] = useState({ title: "", body: "" });
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => applyCtxFilter(ctx), [ctx]);
  const q = query.trim().toLowerCase();
  const listedItems = useMemo(() => {
    if (!q) return filteredItems;
    return filteredItems.filter((v) =>
      venueSearchHaystack(v, ctx.catId).toLowerCase().includes(q),
    );
  }, [filteredItems, q, ctx.catId]);

  const showSubtypes = Boolean(ctx.catId && SUBTYPES[ctx.catId] && !soonMode);
  const showGoodFor =
    presentTags(ctx).length > 0 && !soonMode && ctx.catId !== null;
  const gfLabel =
    ctx.catId === "eatdrink" ? "Good for" : ctx.catId ? "Filter" : "Filter";

  const anyFilter = Boolean(ctx.sub || ctx.tag || q);
  const summaryLabel = q
    ? "Matches"
    : ctx.tag
      ? GOOD_FOR[ctx.tag] || "Filtered"
      : ctx.sub
        ? (SUBTYPES[ctx.catId as string] || []).find((s) => s.id === ctx.sub)
            ?.short || "Filtered"
        : "All places";

  const close = useCallback(() => {
    setOpen(false);
    setSoonMode(false);
    setCtx(EMPTY_CTX);
    setQuery("");
  }, []);

  const openCat = useCallback(
    (id: string, label: string) => {
      const cat = CATS.find((c) => c.id === id);
      setQuery("");
      if (cat?.soon) {
        setTitle(label);
        setSoonMode(true);
        setSoonMessage({
          title: `${label} is coming`,
          body: `${cat.tagline ?? ""}. We're curating it now — reply to the newsletter with somewhere we should include.`,
        });
        setCtx({ catId: id, sub: null, tag: null, base: [] });
        setOpen(true);
        return;
      }
      const base = inSection(id, venues);
      setCtx({ catId: id, sub: null, tag: null, base });
      setTitle(label);
      setSoonMode(false);
      setOpen(true);
    },
    [venues],
  );

  const applyCtx = useCallback((next: CtxState) => {
    setCtx(next);
  }, []);

  const setSub = useCallback(
    (sub: string | null) => {
      applyCtx({ ...ctx, sub, tag: null });
    },
    [applyCtx, ctx],
  );

  const setTag = useCallback(
    (tag: string) => {
      applyCtx({ ...ctx, tag: ctx.tag === tag ? null : tag });
    },
    [applyCtx, ctx],
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    setCtx((prev) => ({ ...prev, sub: null, tag: null }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (open) {
    return (
      <div className="sg-detail">
        <div className="sg-detail-head">
          <div className="sg-detail-top">
            <button
              type="button"
              className="sg-back"
              onClick={close}
              aria-label="Back"
            >
              ←
            </button>
            <div className="sg-detail-title">{title}</div>
          </div>

          {!soonMode ? (
            <div className="sg-search-bar">
              <div className="sg-search">
                <span aria-hidden>🔍</span>
                <input
                  value={query}
                  onChange={(ev) => setQuery(ev.target.value)}
                  placeholder="Where do you want to go?"
                  aria-label="Search places"
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
          ) : null}

          {showSubtypes ? (
            <div className="sg-filt">
              <div className="lbl">Type</div>
              <div className="sg-seg">
                <button
                  type="button"
                  className={ctx.sub === null ? "on" : ""}
                  onClick={() => setSub(null)}
                >
                  All
                </button>
                {(SUBTYPES[ctx.catId as string] || []).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={ctx.sub === s.id ? "on" : ""}
                    onClick={() => setSub(s.id)}
                  >
                    {s.short}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {showGoodFor ? (
            <div className="sg-filt">
              <div className="lbl">{gfLabel}</div>
              <div className="sg-gf-row">
                {presentTags(ctx).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`sg-gf${ctx.tag === t ? " on" : ""}`}
                    onClick={() => setTag(t)}
                  >
                    {GOOD_FOR[t] || t}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {!soonMode ? (
          <div className="sg-summary">
            <strong>{summaryLabel}</strong>
            <span>
              {listedItems.length}{" "}
              {listedItems.length === 1 ? "place" : "places"}
              {q ? ` · “${query.trim()}”` : ""}
            </span>
            {anyFilter ? (
              <button type="button" className="clear-all" onClick={clearFilters}>
                Clear all
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="sg-detail-list">
          {soonMode ? (
            <div className="sg-places-empty">
              <h4>{soonMessage.title}</h4>
              <p>{soonMessage.body}</p>
            </div>
          ) : (
            <VenueList
              items={listedItems}
              links={links}
              catId={ctx.catId}
              showPebbles={ctx.catId === "family"}
              emptyFromSearch={Boolean(q)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sg-places-intro">
        <h1 className="sg-h1">Places.</h1>
        <p className="sg-lede">
          Our little black book of Hastings &amp; St Leonards — the cafés, pubs
          and spots we actually rate.
        </p>
      </div>
      <div className="sg-idx">
        {CATS.map((cat) => (
          <DirectoryRow
            key={cat.id}
            cat={cat}
            venues={venues}
            onOpen={openCat}
          />
        ))}
      </div>
    </>
  );
}

function DirectoryRow({
  cat,
  venues,
  onOpen,
}: {
  cat: Category;
  venues: Venue[];
  onOpen: (id: string, label: string) => void;
}) {
  if (cat.soon) {
    return (
      <button
        type="button"
        className="sg-idx-row soon"
        onClick={() => onOpen(cat.id, cat.label)}
      >
        <div className="col">
          <div className="nm">{cat.label}</div>
          <div className="feat">
            {cat.tagline} <span className="soon-badge">soon</span>
          </div>
        </div>
        <div className="arrow">→</div>
      </button>
    );
  }

  const count = inSection(cat.id, venues).length;
  return (
    <button
      type="button"
      className="sg-idx-row"
      onClick={() => onOpen(cat.id, cat.label)}
    >
      <div className="col">
        <div className="nm">{cat.label}</div>
        <div className="feat">
          {cat.desc} <span className="count">{count}</span>
        </div>
      </div>
      <div className="arrow">→</div>
    </button>
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
