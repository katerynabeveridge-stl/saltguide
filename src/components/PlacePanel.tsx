"use client";

import { useEffect } from "react";
import { Place } from "../lib/types";

type Props = {
  place: Place | null;
  onClose: () => void;
};

export default function PlacePanel({ place, onClose }: Props) {
  const isOpen = Boolean(place);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [isOpen]);

  if (!place) {
    return (
      <div className="overlay" id="ov">
        <div className="panel" />
      </div>
    );
  }

  const catLabel =
    place.cat === "café"
      ? "Café"
      : place.cat.charAt(0).toUpperCase() + place.cat.slice(1);
  const cuisineStr = place.cuisine ? place.cuisine.join(", ") : "";
  const sub = [cuisineStr, place.area].filter(Boolean).join(" · ");

  return (
    <div
      className={`overlay${isOpen ? " on" : ""}`}
      id="ov"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-close">
          <button className="panel-x" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <div className={`panel-hero ${place.ph}`} id="pH" />
        <div className="panel-body">
          <div className="panel-tag" id="pTag">
            {catLabel}
          </div>
          <h2 className="panel-title" id="pTitle">
            {place.name}
          </h2>
          <div className="panel-sub" id="pSub">
            {sub}
          </div>
          <div className="panel-vibes" id="pVibes">
            {place.vibes.map((vibe) => (
              <span key={vibe} className="panel-vibe">
                {vibe}
              </span>
            ))}
          </div>
          <p className="panel-blurb" id="pBlurb">
            {place.desc}
          </p>
          {place.tip ? (
            <div className="panel-tip" id="pTip">
              💡 {place.tip}
            </div>
          ) : null}
          <div className="panel-info">
            <div className="panel-row">
              <span className="panel-label">price</span>
              <span className="panel-val" id="pPrice">
                {place.price}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">area</span>
              <span className="panel-val" id="pArea">
                {place.area}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">good for</span>
              <span className="panel-val" id="pGood">
                {place.vibes.join(", ")}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">booking</span>
              <span className="panel-val" id="pBook">
                {place.booking}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">dog friendly</span>
              <span className="panel-val" id="pDog">
                {place.dog}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">kids</span>
              <span className="panel-val" id="pKids">
                {place.kids}
              </span>
            </div>
            {place.open ? (
              <div className="panel-row" id="pOpenRow">
                <span className="panel-label">open</span>
                <span className="panel-val" id="pOpen">
                  {place.open.join(", ")}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
