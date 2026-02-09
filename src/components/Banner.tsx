"use client";

export default function Banner() {
  return (
    <div className="banner r">
      <div>
        <div className="banner-title">know a place we're missing?</div>
        <div className="banner-sub">
          We're always on the lookout. Send us a tip.
        </div>
      </div>
      <button className="banner-btn" type="button">
        suggest a place →
      </button>
    </div>
  );
}
