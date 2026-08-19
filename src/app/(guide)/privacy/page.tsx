import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";
import { siteDescription } from "@/lib/env";

export const metadata: Metadata = {
  title: "Privacy policy — Saltguide",
  description: siteDescription,
};

export default function PrivacyPage() {
  return <GuideAppPage initialPage="privacy" />;
}
