"use client";

const essentials = [
  {
    icon: "🚂",
    title: "getting here",
    text: "London St Pancras — 1hr 30 direct. A21 from the M25 by car.",
  },
  {
    icon: "🅿️",
    title: "parking",
    text: "Rock-a-Nore for Old Town. Warrior Square for St Leonards.",
  },
  {
    icon: "🌊",
    title: "tides",
    text: "Check before beach walks. Breezier than you think — bring layers.",
  },
  {
    icon: "🐕",
    title: "dogs",
    text: "Welcome on most beaches and at many cafés and pubs.",
  },
];

export default function Essentials() {
  return (
    <section className="section" style={{ background: "var(--white)" }}>
      <div className="section-header r">
        <div>
          <p className="section-label">before you go</p>
          <h2 className="section-title">
            the <span className="it">essentials</span>
          </h2>
        </div>
      </div>
      <div className="prac-grid">
        {essentials.map((item, index) => (
          <div key={item.title} className={`prac r d${index + 1}`}>
            <span className="icon">{item.icon}</span>
            <div className="title">{item.title}</div>
            <div className="text">{item.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
