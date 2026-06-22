const productionUrl = "https://www.saltguide.co.uk";
const stagingUrl = "https://staging.saltguide.co.uk";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? productionUrl;

export const isStaging =
  process.env.NEXT_PUBLIC_APP_ENV === "staging" ||
  siteUrl === stagingUrl ||
  siteUrl.includes("staging.");

export { productionUrl, stagingUrl };
