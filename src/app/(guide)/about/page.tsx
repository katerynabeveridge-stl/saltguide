import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";
import { siteDescription } from "@/lib/env";

export const metadata: Metadata = {
  title: "About — Saltguide",
  description: siteDescription,
};

export default function AboutPage() {
  return <GuideAppPage initialPage="about" />;
}
