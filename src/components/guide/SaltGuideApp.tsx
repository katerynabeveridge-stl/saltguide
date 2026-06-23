"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATS,
  GOOD_FOR,
  GUIDES,
  PEBBLES_URL,
  SUBSTACK_ABOUT_URL,
  SUBSTACK_URL,
  SUBTYPES,
} from "../../lib/guide/constants";
import {
  applyCtxFilter,
  inSection,
  kindLabel,
  presentTags,
  searchVenues,
} from "../../lib/guide/filters";
import type { Category, CtxState, GuideData, Venue, VenueLinks } from "../../lib/guide/types";

type Props = {
  data: GuideData;
};

const EMPTY_CTX: CtxState = { catId: null, sub: null, tag: null, base: [] };

export default function SaltGuideApp({ data }: Props) {
  const { venues, links, weekCount, teasers, soon } = data;
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [ctx, setCtx] = useState<CtxState>(EMPTY_CTX);
  const [ovTitle, setOvTitle] = useState("Results");
  const [ovSub, setOvSub] = useState("");
  const [soonOverlay, setSoonOverlay] = useState(false);
  const [soonMessage, setSoonMessage] = useState({ title: "", body: "" });
  const [openGuides, setOpenGuides] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredItems = useMemo(() => applyCtxFilter(ctx), [ctx]);
  const showSubtypes = Boolean(ctx.catId && SUBTYPES[ctx.catId] && !soonOverlay);
  const showGoodFor = presentTags(ctx).length > 0 && !soonOverlay && ctx.catId !== null;
  const gfLabel =
    ctx.catId === "eatdrink" ? "Good for" : ctx.catId ? "Filter" : "Filter";

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    setSoonOverlay(false);
    setCtx(EMPTY_CTX);
  }, []);

  const openCat = useCallback(
    (id: string, label: string) => {
      const cat = CATS.find((c) => c.id === id);
      if (cat?.soon) {
        setOvTitle(label);
        setOvSub("Coming soon");
        setSoonOverlay(true);
        setSoonMessage({
          title: `${label} is coming`,
          body: `${cat.tagline ?? ""}. We're curating it now — reply to the newsletter with somewhere we should include.`,
        });
        setOverlayOpen(true);
        return;
      }
      const base = inSection(id, venues);
      setCtx({ catId: id, sub: null, tag: null, base });
      setOvTitle(label);
      setOvSub(`${base.length} place${base.length !== 1 ? "s" : ""}`);
      setSoonOverlay(false);
      setOverlayOpen(true);
    },
    [venues],
  );

  const applyCtx = useCallback((next: CtxState) => {
    const items = applyCtxFilter(next);
    setCtx(next);
    setOvSub(`${items.length} place${items.length !== 1 ? "s" : ""}`);
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

  const toggleGuide = (index: number) => {
    setOpenGuides((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeOverlay]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = search.trim();
    if (q.length < 2) {
      return;
    }
    searchTimer.current = setTimeout(() => {
      const items = searchVenues(venues, q);
      setCtx({ catId: null, sub: null, tag: null, base: items });
      setOvTitle(`"${q}"`);
      setOvSub(`${items.length} place${items.length !== 1 ? "s" : ""}`);
      setSoonOverlay(false);
      setOverlayOpen(true);
    }, 180);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, venues]);

  useEffect(() => {
    if (overlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  return (
    <>
      <div className="app">
        <div className="top">
          <span className="wm">salt guide</span>
          <a
            className="sub-link"
            href={SUBSTACK_ABOUT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Subscribe
          </a>
        </div>

        <div className="hero">
          <h1>
            Your pocket guide to <em>Hastings &amp; St Leonards.</em>
          </h1>
          <p>What&apos;s on, where to eat and where to go by the sea.</p>
          <div className="ask">
            <label htmlFor="search">What are you after?</label>
            <div className="field">
              <span className="ico" aria-hidden="true">
                ⌕
              </span>
              <input
                id="search"
                type="text"
                placeholder="A coffee, a roast, somewhere for date night…"
                autoComplete="off"
                value={search}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearch(val);
                  if (val.trim().length < 2) closeOverlay();
                }}
              />
            </div>
          </div>
          <svg className="tear" viewBox="0 0 430 40" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 40 L0 18 Q 26 4 54 16 T 108 16 T 162 14 T 216 18 T 270 12 T 324 18 T 378 14 T 430 18 L430 40 Z"
              fill="#F1EBDE"
            />
          </svg>
        </div>

        <section>
          <div className="eyebrow">Where to go</div>
          <div className="idx">
            {CATS.map((cat) => (
              <DirectoryRow key={cat.id} cat={cat} venues={venues} onOpen={openCat} />
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow">What&apos;s on</div>
          <div className="week">
            <div className="week-count">{weekCount}</div>
            <h3>
              A few things
              <br />
              <em>worth knowing about.</em>
            </h3>
            <div>
              {teasers.map((t, i) => (
                <div className="tz" key={`${t.d}-${i}`}>
                  <div className="d">{t.d}</div>
                  <div className="body">
                    <div className="t" dangerouslySetInnerHTML={{ __html: t.t }} />
                    {t.chips?.length ? (
                      <div className="chips">
                        {t.chips.map((c) => (
                          <span key={c.x} className={`chip${c.hot ? " hot" : ""}`}>
                            {c.x}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <p className="week-note">
              And that&apos;s just the half of it — the full list lands every Sunday
              evening. Free, and written by someone who actually goes to these things.
            </p>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noreferrer"
              className="week-btn"
            >
              Get the Sunday edit →
            </a>
            <div className="soon-strip">
              <div className="lbl">Coming up</div>
              <div>
                {soon.map((s) => (
                  <div className="soon-row" key={s.mo}>
                    <div className="mo">{s.mo}</div>
                    <div className="tx" dangerouslySetInnerHTML={{ __html: s.t }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="eyebrow">Edited lists</div>
          <div id="guides">
            {GUIDES.map((guide, i) => {
              const items = venues.filter(guide.match);
              const count = items.length
                ? `${items.length} place${items.length > 1 ? "s" : ""}`
                : "Still building this one";
              return (
                <div className={`guide${openGuides.has(i) ? " open" : ""}`} key={guide.title}>
                  <div className="guide-head" onClick={() => toggleGuide(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && toggleGuide(i)}>
                    <div>
                      <div className="t">{guide.title}</div>
                      <div className="c">{count}</div>
                    </div>
                    <div className="arr">+</div>
                  </div>
                  <div className="guide-body">
                    {items.length
                      ? items.map((v) => (
                          <div className="gv" key={v.slug}>
                            <div className="gn">
                              {v.n}
                              {v.isFree ? <span className="free-badge">Free</span> : null}
                            </div>
                            <div className="gm">
                              {v.a}
                              {v.tip ? ` — ${v.tip}` : ""}
                            </div>
                          </div>
                        ))
                      : (
                        <div className="gv">
                          <div
                            className="gm"
                            style={{
                              textTransform: "none",
                              letterSpacing: 0,
                              padding: "4px 0 8px",
                            }}
                          >
                            We&apos;re still putting this one together — reply to the
                            newsletter with a tip.
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer>
          <div className="fm">salt guide</div>
          <p>
            PART OF SALT &amp; PEBBLES
            <br />
            HASTINGS &amp; ST LEONARDS-ON-SEA
            <br />
            PROTOTYPE · PHOTOS ARE PLACEHOLDERS
          </p>
        </footer>
      </div>

      <div className={`overlay${overlayOpen ? " show" : ""}`}>
        <div className="ov-head">
          <div className="ov-top">
            <button type="button" className="back" onClick={closeOverlay} aria-label="Back">
              ←
            </button>
            <div className="title">
              {ovTitle}
              <span>{ovSub}</span>
            </div>
          </div>
          {showSubtypes ? (
            <div className="goodfor">
              <div className="lbl">Type</div>
              <div className="seg">
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
            <div className="goodfor">
              <div className="lbl">{gfLabel}</div>
              <div className="gf-row">
                {presentTags(ctx).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`gf${ctx.tag === t ? " on" : ""}`}
                    onClick={() => setTag(t)}
                  >
                    {GOOD_FOR[t]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="ov-list">
          {soonOverlay ? (
            <div className="empty">
              <div className="bar" />
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
        className="idx-row soon"
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
      className="idx-row"
      onClick={() => onOpen(cat.id, cat.label)}
    >
      <div className="col">
        <div className="nm">{cat.label}</div>
        <div className="feat">
          {cat.desc} <span className="idx-count">{count}</span>
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
        <div className="empty">
          <div className="bar" />
          <h4>Nothing here yet</h4>
          <p>We&apos;d rather show nothing than guess. This one&apos;s still being tagged.</p>
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
          <div className={`rv${v.sp ? " pick" : ""}`} key={v.slug}>
            <div className="rv-meta">
              {v.sp ? <span className="rv-pick">★ Salt pick</span> : null}
              {label ? <span className="rv-kind">{label}</span> : null}
              {v.isFree ? <span className="free-badge">Free</span> : null}
            </div>
            <div className="rn">{v.n}</div>
            <div className="rm">
              {v.a}
              {v.booking === "book-ahead" ? " · Book ahead" : ""}
            </div>
            <div className="rb">
              {v.b}
              {v.tip ? (
                <>
                  <br />
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>Tip:</span> {v.tip}
                </>
              ) : null}
            </div>
            <div className="links">
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
                  className="ig"
                >
                  @{lnk.ig}
                </a>
              ) : null}
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="dir">
                Maps →
              </a>
            </div>
          </div>
        );
      })}
    </>
  );
}

function PebblesCta() {
  return (
    <div className="pebbles-cta">
      <div className="txt">
        <div className="kicker">Also on Pebbles List</div>
        <p>Classes, baby groups and local activities — the full family picture.</p>
      </div>
      <a href={PEBBLES_URL} target="_blank" rel="noreferrer">
        Visit →
      </a>
    </div>
  );
}
