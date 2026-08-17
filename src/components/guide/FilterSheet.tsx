"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  onClose: () => void;
  onClearAll: () => void;
  onApply: () => void;
  applyLabel: string;
  children: ReactNode;
};

export default function FilterSheet({
  onClose,
  onClearAll,
  onApply,
  applyLabel,
  children,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="sg-sheet-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="sg-sheet"
        onClick={(ev) => ev.stopPropagation()}
        role="dialog"
        aria-label="Filters"
      >
        <div className="sg-sheet-handle" />
        <div className="sg-sheet-head">
          <h3>Filters</h3>
          <button
            type="button"
            className="clear"
            onClick={onClose}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        {children}
        <div className="sg-sheet-foot">
          <button
            type="button"
            className="sg-sheet-clear"
            onClick={onClearAll}
          >
            Clear all
          </button>
          <button
            type="button"
            className="sg-sheet-apply"
            onClick={onApply}
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
