import { encodeQuery } from "../lib/helpers";

function getCandidateSlug(deal) {
  return deal?.epicSlug || deal?.epicProductSlug || deal?.productSlug || null;
}

export function getEpicDirectUrl(deal) {
  const slug = getCandidateSlug(deal);
  if (!slug) return null;
  return `https://store.epicgames.com/en-US/p/${encodeURIComponent(slug)}`;
}

export function getEpicSearchUrl(title) {
  return `https://store.epicgames.com/en-US/browse?q=${encodeQuery(title)}&sortBy=relevancy&sortDir=DESC&count=40`;
}

export function getEpicBestEffortUrl(deal) {
  const direct = getEpicDirectUrl(deal);
  if (direct) return { url: direct, source: "epic-direct", isDirect: true };
  return { url: getEpicSearchUrl(deal?.title || ""), source: "epic-search", isDirect: false };
}
