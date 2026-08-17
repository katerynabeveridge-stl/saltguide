import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";

export const metadata: Metadata = {
  title: "Saltguide — Hastings & St Leonards",
  description:
    "Your pocket guide to what's on, where to eat and where to go by the sea.",
};

export default function HomePage() {
  return <GuideAppPage initialPage="home" />;
}
