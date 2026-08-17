import { fetchGuideData } from "../../lib/guide/queries";
import type { GuidePageId } from "../../lib/guide/paths";
import SaltGuideApp from "./SaltGuideApp";

export default async function GuideAppPage({
  initialPage,
}: {
  initialPage: GuidePageId;
}) {
  const data = await fetchGuideData();
  return <SaltGuideApp key={initialPage} data={data} initialPage={initialPage} />;
}
