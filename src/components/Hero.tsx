"use client";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-sunburst" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="line" />
          hastings & st leonards
          <span className="line" />
        </div>
        <h1>
          a pocket guide to
          <br />
          where to <span className="it">eat, drink</span>
          <br />& <span className="it">wander</span>
          <span className="neon-dot hero-dot">.</span>
        </h1>
        <div className="hero-towns">
          <div className="hero-towns-label">along the coast</div>
          <div className="hero-town-pills">
            <button className="town-pill active">
              🌊 hastings & st leonards
            </button>
            <button className="town-pill soon">rye — soon</button>
            <button className="town-pill soon">folkestone — soon</button>
            <button className="town-pill soon">margate — soon</button>
          </div>
        </div>
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path
            d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,50 1440,45 L1440,60 L0,60 Z"
            fill="var(--white)"
          />
        </svg>
      </div>
    </section>
  );
}
