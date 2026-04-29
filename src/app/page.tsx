const INSTAGRAM_URL = "https://www.instagram.com/salt.guide/";
const SUBSTACK_URL = "https://saltguide.substack.com/";

export default function Home() {
  return (
    <main className="coming-soon-page">
      <div className="background-media" aria-hidden="true">
        <video
          className="background-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/ocean-fallback.png"
        >
          <source src="/gentle_ocean.mp4" type="video/mp4" />
        </video>
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
          Your pocket guide
          <br />
          to what&apos;s on, where to eat,
          <br />
          and where to go by the sea.
        </p>

        <div className="cta-group">
          <a
            className="button button-primary"
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span className="button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Zm2.75-1.25c-.69 0-1.25.56-1.25 1.25v.2l6.5 4.05 6.5-4.05v-.2c0-.69-.56-1.25-1.25-1.25H6.75Zm11.25 3.22-5.6 3.49a.75.75 0 0 1-.79 0L6 8.72v8.53c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V8.72Z" />
              </svg>
            </span>
            <span>Subscribe to Substack</span>
          </a>
        </div>

        <p className="footer-copy">
          New newsletter coming soon on 10th May
          <br />
          then every Sunday after so you can plan your weekend.
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
