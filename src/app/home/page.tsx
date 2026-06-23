import type { Metadata } from "next";
import SaltGuideApp from "../../components/guide/SaltGuideApp";
import { fetchGuideData } from "../../lib/guide/queries";

export const metadata: Metadata = {
  title: "Saltguide — Hastings & St Leonards",
  description:
    "Your pocket guide to what's on, where to eat and where to go by the sea.",
};

export default async function HomePage() {
  const data = await fetchGuideData();
  return <SaltGuideApp data={data} />;
}
