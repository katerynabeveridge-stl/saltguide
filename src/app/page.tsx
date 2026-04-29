const INSTAGRAM_URL = "https://www.instagram.com/salt.guide/";
const SUBSTACK_URL = "https://saltguide.substack.com/";

export default function Home() {
  return (
    <main className="coming-soon-page">
      <div className="background-media" aria-hidden="true">
        <img
          className="background-video"
          src="/salt-background.png"
          alt=""
        />
        <div className="background-overlay" />
      </div>

      <section className="coming-soon-content">
        <p className="small-label">Coming Soon</p>

        <h1 className="wordmark" aria-label="saltguide">
          <span>salt</span>
          <span>guide</span>
        </h1>

        <p className="location">Hastings &amp; St Leonards</p>

        <div className="location-wave" aria-hidden="true" />

        <p className="description">
          Your pocket guide to what&apos;s on, where to eat, and where to go by
          the sea. In your inbox each week.
        </p>

        <div className="cta-group">
          <a
            className="button button-primary"
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span className="button-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M8 6h48v7H8V6Zm0 14h48v7H8v-7Zm0 13h48v25.5L32 44 8 58.5V33Z" />
              </svg>
            </span>
            <span>Get the Newsletter</span>
          </a>
        </div>

        <p className="footer-copy">
          Every Sunday from 10th May.
        </p>

        <a
          className="instagram-link"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Follow Saltguide on Instagram"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.25 3h9.5A4.25 4.25 0 0 1 21 7.25v9.5A4.25 4.25 0 0 1 16.75 21h-9.5A4.25 4.25 0 0 1 3 16.75v-9.5A4.25 4.25 0 0 1 7.25 3Zm0 1.5A2.75 2.75 0 0 0 4.5 7.25v9.5a2.75 2.75 0 0 0 2.75 2.75h9.5a2.75 2.75 0 0 0 2.75-2.75v-9.5a2.75 2.75 0 0 0-2.75-2.75h-9.5Zm9.75 1.62a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76ZM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          </svg>
        </a>
      </section>
    </main>
  );
}
