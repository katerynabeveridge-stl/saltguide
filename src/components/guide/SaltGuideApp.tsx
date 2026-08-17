"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  GUIDE_PATH,
  guidePageFromPathname,
  type GuidePageId,
} from "../../lib/guide/paths";
import type { GuideData } from "../../lib/guide/types";
import HomeLanding from "./HomeLanding";
import PlacesDirectory from "./PlacesDirectory";
import WhatsOnFeed from "./WhatsOnFeed";

type Props = {
  data: GuideData;
  initialPage?: GuidePageId;
};

const NAV: [GuidePageId, string][] = [
  ["whatson", "What's On"],
  ["places", "Places"],
  ["about", "About"],
];

export default function SaltGuideApp({ data, initialPage = "home" }: Props) {
  const pathname = usePathname();
  const page = guidePageFromPathname(pathname) ?? initialPage;
  const { venues, links, events } = data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="sg-wrap">
      <header className="sg-header">
        <div className="sg-header-top">
          <Link href={GUIDE_PATH.home} className="sg-brand">
            SALT<mark>GUIDE</mark>
          </Link>
          <nav className="sg-nav" aria-label="Main">
            {NAV.map(([k, label]) => (
              <Link
                key={k}
                href={GUIDE_PATH[k]}
                className={page === k ? "on" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {page === "whatson" ? (
          <>
            <h1 className="sg-h1">
              What&apos;s <span className="hl">on</span>
            </h1>
            <p className="sg-lede" style={{ marginBottom: 22 }}>
              This week and beyond in Hastings &amp; St Leonards.
            </p>
          </>
        ) : null}
      </header>

      {page === "home" ? (
        <HomeLanding events={events} venues={venues} links={links} />
      ) : null}

      {page === "whatson" ? <WhatsOnFeed events={events} /> : null}

      {page === "places" ? (
        <PlacesDirectory venues={venues} links={links} />
      ) : null}

      {page === "about" ? (
        <div className="sg-soon-page">
          <div className="emoji" aria-hidden>
            👋
          </div>
          <h2 className="sg-h2">About.</h2>
          <p>Who&apos;s behind Saltguide, and why we started it.</p>
          <span className="sg-coming">COMING SOON ✳</span>
        </div>
      ) : null}
    </div>
  );
}
