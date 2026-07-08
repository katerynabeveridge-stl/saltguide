"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATS,
  GOOD_FOR,
  PEBBLES_URL,
  SUBTYPES,
} from "../../lib/guide/constants";
import {
  applyCtxFilter,
  inSection,
  kindLabel,
  presentTags,
} from "../../lib/guide/filters";
import type { Category, CtxState, Venue, VenueLinks } from "../../lib/guide/types";
import ListingThumb from "./ListingThumb";

type Props = {
  venues: Venue[];
  links: Record<string, VenueLinks>;
};

const EMPTY_CTX: CtxState = { catId: null, sub: null, tag: null, base: [] };

export default function PlacesDirectory({ venues, links }: Props) {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<CtxState>(EMPTY_CTX);
  const [title, setTitle] = useState("Results");
  const [subtitle, setSubtitle] = useState("");
  const [soonMode, setSoonMode] = useState(false);
  const [soonMessage, setSoonMessage] = useState({ title: "", body: "" });

  const filteredItems = useMemo(() => applyCtxFilter(ctx), [ctx]);
  const showSubtypes = Boolean(ctx.catId && SUBTYPES[ctx.catId] && !soonMode);
  const showGoodFor =
    presentTags(ctx).length > 0 && !soonMode && ctx.catId !== null;
  const gfLabel =
    ctx.catId === "eatdrink" ? "Good for" : ctx.catId ? "Filter" : "Filter";

  const close = useCallback(() => {
    setOpen(false);
    setSoonMode(false);
    setCtx(EMPTY_CTX);
  }, []);

  const openCat = useCallback(
    (id: string, label: string) => {
      const cat = CATS.find((c) => c.id === id);
      if (cat?.soon) {
        setTitle(label);
        setSubtitle("Coming soon");
        setSoonMode(true);
        setSoonMessage({
          title: `${label} is coming`,
          body: `${cat.tagline ?? ""}. We're curating it now — reply to the newsletter with somewhere we should include.`,
        });
        setOpen(true);
        return;
      }
      const base = inSection(id, venues);
      setCtx({ catId: id, sub: null, tag: null, base });
      setTitle(label);
      setSubtitle(`${base.length} place${base.length !== 1 ? "s" : ""}`);
      setSoonMode(false);
      setOpen(true);
    },
    [venues],
  );

  const applyCtx = useCallback((next: CtxState) => {
    const items = applyCtxFilter(next);
    setCtx(next);
    setSubtitle(`${items.length} place${items.length !== 1 ? "s" : ""}`);
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
            <button type="button" className="sg-back" onClick={close} aria-label="Back">
              ←
            </button>
            <div className="sg-detail-title">
              {title}
              <span>{subtitle}</span>
            </div>
          </div>
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
        <div className="sg-detail-list">
          {soonMode ? (
            <div className="sg-places-empty">
              <h4>{soonMessage.title}</h4>
              <p>{soonMessage.body}</p>
            </div>
          ) : (
            <VenueList
              items={filteredItems}
              links={links}
              catId={ctx.catId}
              showPebbles={ctx.catId === "family"}
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
}: {
  items: Venue[];
  links: Record<string, VenueLinks>;
  catId: string | null;
  showPebbles: boolean;
}) {
  if (!items.length) {
    return (
      <>
        {showPebbles ? <PebblesCta /> : null}
        <div className="sg-places-empty">
          <h4>Nothing here yet</h4>
          <p>
            We&apos;d rather show nothing than guess. This one&apos;s still being
            tagged.
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
        const label = kindLabel(v, catId);
        return (
          <div className={`sg-venue${v.sp ? " pick" : ""}`} key={v.slug}>
            {v.coverImageUrl ? (
              <div className="sg-venue-row">
                <ListingThumb
                  imageUrl={v.coverImageUrl}
                  imageAlt={v.coverImageAlt ?? v.n}
                  fallbackColor="var(--sg-green)"
                  fallbackIcon="📍"
                  className="sg-venue-thumb"
                />
                <div className="sg-venue-main">
                  <VenueBody
                    v={v}
                    lnk={lnk}
                    mapsUrl={mapsUrl}
                    label={label}
                  />
                </div>
              </div>
            ) : (
              <VenueBody v={v} lnk={lnk} mapsUrl={mapsUrl} label={label} />
            )}
          </div>
        );
      })}
    </>
  );
}

function VenueBody({
  v,
  lnk,
  mapsUrl,
  label,
}: {
  v: Venue;
  lnk: VenueLinks;
  mapsUrl: string;
  label: string;
}) {
  return (
    <>
      <div className="sg-venue-meta">
        {v.sp ? <span className="sg-venue-pick">★ Salt pick</span> : null}
        {label ? <span className="sg-venue-kind">{label}</span> : null}
        {v.isFree ? <span className="sg-venue-free">Free</span> : null}
      </div>
      <div className="sg-venue-name">{v.n}</div>
      <div className="sg-venue-area">
        {v.a}
        {v.booking === "book-ahead" ? " · Book ahead" : ""}
      </div>
      <div className="sg-venue-body">
        {v.b}
        {v.tip ? (
          <>
            <br />
            <span className="tip">Tip:</span> {v.tip}
          </>
        ) : null}
      </div>
      <div className="sg-venue-links">
        {lnk.w ? (
          <a href={lnk.w} target="_blank" rel="noreferrer">
            Website →
          </a>
        ) : null}
        {lnk.ig ? (
          <a
            href={`https://instagram.com/${lnk.ig}`}
            target="_blank"
            rel="noreferrer"
          >
            @{lnk.ig}
          </a>
        ) : null}
        <a href={mapsUrl} target="_blank" rel="noreferrer">
          Maps →
        </a>
      </div>
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
