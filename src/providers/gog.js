import { encodeQuery } from "../lib/helpers";

function getCandidateSlug(deal) {
  return deal?.gogSlug || deal?.productSlug || deal?.slug || null;
}

export function getGogDirectUrl(deal) {
  const slug = getCandidateSlug(deal);
  if (!slug) return null;
  return `https://www.gog.com/en/game/${encodeURIComponent(slug)}`;
}

export function getGogSearchUrl(title) {
  return `https://www.gog.com/en/games?query=${encodeQuery(title)}`;
}

export function getGogBestEffortUrl(deal) {
  const direct = getGogDirectUrl(deal);
  if (direct) return { url: direct, source: "gog-direct", isDirect: true };
  return { url: getGogSearchUrl(deal?.title || ""), source: "gog-search", isDirect: false };
}
