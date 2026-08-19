import Link from "next/link";
import { INSTAGRAM_URL } from "../../lib/guide/constants";
import { GUIDE_PATH } from "../../lib/guide/paths";

function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.5" cy="6.5" r="1.15" fill="currentColor" />
    </svg>
  );
}

export default function GuideFooter() {
  return (
    <footer className="sg-footer">
      <p className="sg-footer-made">Made in Hastings</p>
      <nav className="sg-footer-nav" aria-label="Footer">
        <Link href={GUIDE_PATH.privacy}>Privacy policy</Link>
        <Link href={GUIDE_PATH.terms}>Terms of Use</Link>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="sg-footer-ig"
          aria-label="Instagram"
        >
          <InstagramGlyph />
        </a>
      </nav>
    </footer>
  );
}
