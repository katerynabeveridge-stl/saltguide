import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";
import { siteDescription } from "@/lib/env";

export const metadata: Metadata = {
  title: "What's On — Saltguide",
  description: siteDescription,
};

export default function EventsPage() {
  return <GuideAppPage initialPage="whatson" />;
}
