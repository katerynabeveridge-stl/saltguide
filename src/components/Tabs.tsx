"use client";

export default function Tabs() {
  return (
    <div className="tabs-section">
      <div className="tabs-row">
        <button className="tab-btn active" type="button">
          eat & drink
        </button>
        <button className="tab-btn disabled" type="button">
          explore<span className="tab-soon"> — soon</span>
        </button>
      </div>
    </div>
  );
}
