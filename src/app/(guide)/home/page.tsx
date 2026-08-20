import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

/** Old /home URL: Cloudflare `_redirects` 301s this in production; this page covers static HTML. */
export default function LegacyHomeRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/" />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace("/");`,
        }}
      />
      <p>
        <a href="/">Continue to Salt Guide</a>
      </p>
    </>
  );
}
