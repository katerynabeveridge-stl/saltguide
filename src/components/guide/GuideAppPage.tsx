import type { GuidePageId } from "../../lib/guide/paths";
import SaltGuideApp from "./SaltGuideApp";

export default function GuideAppPage({
  initialPage,
}: {
  initialPage: GuidePageId;
}) {
  return <SaltGuideApp key={initialPage} initialPage={initialPage} />;
}
