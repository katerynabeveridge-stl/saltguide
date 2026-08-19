import type { Metadata } from "next";
import GuideAppPage from "@/components/guide/GuideAppPage";
import { siteDescription } from "@/lib/env";

export const metadata: Metadata = {
  title: "Terms of Use — Saltguide",
  description: siteDescription,
};

export default function TermsPage() {
  return <GuideAppPage initialPage="terms" />;
}
