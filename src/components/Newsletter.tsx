"use client";

export default function Newsletter() {
  return (
    <div className="newsletter">
      <div className="newsletter-title">a pinch of the good stuff 🌊</div>
      <div className="newsletter-sub">
        New picks, seasonal finds and local tips — straight to your inbox.
      </div>
      <div className="newsletter-form">
        <input
          type="email"
          className="newsletter-input"
          placeholder="your email"
        />
        <button className="newsletter-btn" type="button">
          subscribe
        </button>
      </div>
    </div>
  );
}
