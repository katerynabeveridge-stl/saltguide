import {
  GOOD_FOR,
  KIND_ORDER,
  SECTION_GOODFOR,
  SUBTYPES,
  TYPE_LABEL,
  TYPE_SECTION,
} from "./constants";
import type { CtxState, Venue } from "./types";

export function inSection(id: string, venues: Venue[]): Venue[] {
  let items = venues.filter((v) =>
    v.types.some((t) => (TYPE_SECTION[t] || []).includes(id)),
  );

  if (id === "family") {
    venues.forEach((v) => {
      if (!items.includes(v) && v.tags.includes("child-friendly")) {
        items.push(v);
      }
    });
  }

  return items;
}

export function kindLabel(v: Venue, catId: string | null): string {
  const order = (catId && KIND_ORDER[catId]) || [];
  const t = order.find((x) => v.types.includes(x)) || v.types[0];
  return TYPE_LABEL[t] || "";
}

export function okTag(t: string, catId: string | null): boolean {
  const allow = catId ? SECTION_GOODFOR[catId] : undefined;
  if (allow) {
    return allow.includes(t) && Boolean(GOOD_FOR[t]);
  }
  return Boolean(GOOD_FOR[t]) && t !== "child-friendly";
}

export function applyCtxFilter(ctx: CtxState): Venue[] {
  let items = ctx.base;

  if (ctx.sub && ctx.catId && SUBTYPES[ctx.catId]) {
    const types =
      (SUBTYPES[ctx.catId].find((s) => s.id === ctx.sub) || {}).types || [];
    items = items.filter((v) => v.types.some((t) => types.includes(t)));
  }

  if (ctx.tag) {
    items = items.filter((v) => v.tags.includes(ctx.tag as string));
  }

  return items;
}

export function presentTags(ctx: CtxState): string[] {
  let pool = ctx.base;

  if (ctx.sub && ctx.catId && SUBTYPES[ctx.catId]) {
    const types =
      (SUBTYPES[ctx.catId].find((s) => s.id === ctx.sub) || {}).types || [];
    pool = pool.filter((v) => v.types.some((t) => types.includes(t)));
  }

  return [...new Set(pool.flatMap((v) => v.tags))].filter((t) =>
    okTag(t, ctx.catId),
  );
}

export function searchVenues(venues: Venue[], query: string): Venue[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return [];
  }

  return venues.filter(
    (v) =>
      v.n.toLowerCase().includes(q) ||
      v.a.toLowerCase().includes(q) ||
      (v.b || "").toLowerCase().includes(q) ||
      v.types.some((t) => t.includes(q)) ||
      v.tags.some(
        (t) => t.includes(q) || (GOOD_FOR[t] || "").toLowerCase().includes(q),
      ),
  );
}
