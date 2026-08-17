import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";

export const metadata: Metadata = {
  title: "Privacy policy — Saltguide",
  description:
    "Your pocket guide to what's on, where to eat and where to go by the sea.",
};

export default function PrivacyPage() {
  return <GuideAppPage initialPage="privacy" />;
}
