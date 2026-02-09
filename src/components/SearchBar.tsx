"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export default function SearchBar({ value, onChange, onClear }: Props) {
  return (
    <div className="search-section">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="search places, cuisines, vibes..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className={`search-clear${value ? " show" : ""}`}
          onClick={onClear}
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
