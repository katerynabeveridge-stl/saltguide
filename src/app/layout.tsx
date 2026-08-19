import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StagingBanner from "../components/StagingBanner";
import { isStaging, siteDescription, siteUrl } from "../lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "salt guide",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: isStaging ? "Saltguide (Staging)" : "Saltguide",
  description: siteDescription,
  robots: isStaging ? { index: false, follow: false } : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon.png?v=3", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/favicon.png?v=3",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Salt Guide",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImage.url],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {isStaging ? <StagingBanner /> : null}
        {children}
      </body>
    </html>
  );
}
