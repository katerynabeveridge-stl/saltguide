"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  GUIDE_PATH,
  guidePageFromPathname,
  type GuidePageId,
} from "../../lib/guide/paths";
import { EMPTY_GUIDE_DATA } from "../../lib/guide/queries";
import type { GuideData } from "../../lib/guide/types";
import { useGuideData } from "../../lib/guide/useGuideData";
import GuideFooter from "./GuideFooter";
import HomeLanding from "./HomeLanding";
import PlacesDirectory from "./PlacesDirectory";
import WhatsOnFeed from "./WhatsOnFeed";

type Props = {
  data?: GuideData;
  initialPage?: GuidePageId;
};

const NAV: [GuidePageId, string][] = [
  ["whatson", "What's On"],
  ["places", "Places"],
  ["about", "About"],
];

export default function SaltGuideApp({
  data: initialData = EMPTY_GUIDE_DATA,
  initialPage = "home",
}: Props) {
  const pathname = usePathname();
  const page = guidePageFromPathname(pathname) ?? initialPage;
  const { data, loading } = useGuideData(initialData);
  const { venues, links, events } = data;

  const needsList = page === "home" || page === "whatson" || page === "places";
  const showLoading = loading && needsList;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className={page === "whatson" ? "sg-wrap sg-whatson" : "sg-wrap"}>
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
              What&apos;s <span className="hl">On</span>.
            </h1>
            <p className="sg-lede">
              This week and beyond in Hastings &amp; St Leonards.
            </p>
          </>
        ) : null}
        {page === "places" ? (
          <>
            <h1 className="sg-h1">Places.</h1>
            <p className="sg-lede">
              A guide to Hastings &amp; St Leonards.
            </p>
          </>
        ) : null}
      </header>

      {showLoading ? (
        <div className="sg-empty" role="status" aria-live="polite">
          Loading…
        </div>
      ) : null}

      {page === "home" && !showLoading ? (
        <HomeLanding events={events} venues={venues} links={links} />
      ) : null}

      {page === "whatson" && !showLoading ? (
        <WhatsOnFeed events={events} />
      ) : null}

      {page === "places" && !showLoading ? (
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

      {page === "privacy" ? (
        <div className="sg-policy">
          <h2 className="sg-h2">Privacy policy.</h2>
          <p>
            This site is Salt Guide. If you need to get in touch, email{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>
          <p>
            Salt Guide is hosted by Cloudflare. We do not use Google Analytics.
          </p>
          <p>
            Listings and other information on this site are gathered from public
            sources. We are not responsible for third-party venues or events. We
            do not endorse them, and we do not have partnerships with them unless
            we specifically say that we do.
          </p>
          <p>
            To remove or amend a listing, email{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>
        </div>
      ) : null}

      <GuideFooter />
    </div>
  );
}
