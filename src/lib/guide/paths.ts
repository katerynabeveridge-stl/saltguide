export type GuidePageId =
  | "home"
  | "whatson"
  | "places"
  | "about"
  | "privacy";

/** Site-root paths for the guide (static export needs a page file per path). */
export const GUIDE_PATH: Record<GuidePageId, string> = {
  home: "/home",
  whatson: "/events",
  places: "/places",
  about: "/about",
  privacy: "/privacy",
};

export function guidePageFromPathname(pathname: string): GuidePageId | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  switch (normalized) {
    case "/home":
      return "home";
    case "/events":
      return "whatson";
    case "/places":
      return "places";
    case "/about":
      return "about";
    case "/privacy":
      return "privacy";
    default:
      return undefined;
  }
}
