"use client";

import { useState } from "react";
import type { GuideData } from "../../lib/guide/types";
import PlacesDirectory from "./PlacesDirectory";
import WhatsOnFeed from "./WhatsOnFeed";

type Page = "whatson" | "places" | "about";

type Props = {
  data: GuideData;
};

const NAV: [Page, string][] = [
  ["whatson", "What's On"],
  ["places", "Places"],
  ["about", "About"],
];

export default function SaltGuideApp({ data }: Props) {
  const [page, setPage] = useState<Page>("whatson");
  const { venues, links, events } = data;

  return (
    <div className="sg-wrap">
      <header className="sg-header">
        <div className="sg-header-top">
          <button
            type="button"
            className="sg-brand"
            onClick={() => setPage("whatson")}
          >
            SALT<mark>GUIDE</mark>
          </button>
          <nav className="sg-nav" aria-label="Main">
            {NAV.map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={page === k ? "on" : ""}
                onClick={() => setPage(k)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

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
