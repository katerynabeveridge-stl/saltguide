"use client";

type Props = {
  onSearch: (query: string) => void;
  onSetVibe: (vibe: string) => void;
};

export default function Footer({ onSearch, onSetVibe }: Props) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            saltguide<span className="neon-dot">.</span>
          </div>
          <div className="footer-tagline">a pocket guide to the coast</div>
          <p className="footer-desc">
            Honest recommendations from people who actually live here.
          </p>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">eat & drink</div>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSearch("restaurant");
            }}
          >
            restaurants
          </a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSearch("café");
            }}
          >
            cafés
          </a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSearch("bar");
            }}
          >
            bars
          </a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSearch("bakery");
            }}
          >
            bakeries
          </a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">vibes</div>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSetVibe("date night");
            }}
          >
            date night
          </a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSetVibe("breakfast");
            }}
          >
            breakfast
          </a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSetVibe("family friendly");
            }}
          >
            family friendly
          </a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSetVibe("dog friendly");
            }}
          >
            dog friendly
          </a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">saltguide</div>
          <a href="#">about</a>
          <a href="#">partner with us</a>
          <a href="#">suggest a place</a>
          <a href="#">contact</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 saltguide. an independent guide.</span>
        <span>🌊</span>
      </div>
    </footer>
  );
}
