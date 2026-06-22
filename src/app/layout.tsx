import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StagingBanner from "../components/StagingBanner";
import { isStaging, siteUrl } from "../lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: isStaging ? "Saltguide (Staging)" : "Saltguide",
  description: "Saltguide",
  robots: isStaging ? { index: false, follow: false } : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon.png?v=3", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/favicon.png?v=3",
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
