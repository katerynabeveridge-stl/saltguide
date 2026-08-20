import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";
import { siteDescription } from "@/lib/env";

export const metadata: Metadata = {
  title: "Saltguide — Hastings & St Leonards",
  description: siteDescription,
};

export default function HomePage() {
  return <GuideAppPage initialPage="home" />;
}
