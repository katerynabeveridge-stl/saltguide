const INSTAGRAM_URL = "[INSERT URL]";
const SUBSTACK_URL = "[INSERT URL]";

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
          <source src="/ocean.mp4" type="video/mp4" />
        </video>
        <div className="background-fallback" />
        <div className="background-overlay" />
      </div>

      <section className="coming-soon-content">
        <p className="small-label">Coming Soon</p>

        <h1 className="wordmark" aria-label="saltguide">
          <span>salt</span>
          <span>guide</span>
        </h1>

        <p className="location">St Leonards &amp; Hastings</p>

        <div className="wave-divider" aria-hidden="true" />

        <p className="description">
          Your pocket guide
          <br />
          to what&apos;s on, where to eat,
          <br />
          and where to go by the sea.
        </p>

        <div className="cta-group">
          <a
            className="button button-secondary"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
          >
            Follow on Instagram
          </a>
          <a
            className="button button-primary"
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
          >
            Subscribe to Substack
          </a>
        </div>

        <p className="footer-copy">
          New newsletter coming soon on 10th May
          <br />
          then every Sunday after so you can plan your weekend.
        </p>
      </section>
    </main>
  );
}
