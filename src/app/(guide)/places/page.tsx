import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";
import { siteDescription } from "@/lib/env";

export const metadata: Metadata = {
  title: "Places — Saltguide",
  description: siteDescription,
};

export default function PlacesPage() {
  return <GuideAppPage initialPage="places" />;
}
