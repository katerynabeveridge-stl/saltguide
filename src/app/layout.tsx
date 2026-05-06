import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

/** Production: www.saltguide.co.uk (main). Override on staging with NEXT_PUBLIC_SITE_URL. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.saltguide.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Saltguide",
  description: "Saltguide",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
