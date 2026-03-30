import { DEAL_CACHE_KEY } from "./constants";

export function saveDealToCache(storeSlug, deal) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DEAL_CACHE_KEY) || "{}");
    parsed[`${storeSlug}:${deal.dealID}`] = deal;
    sessionStorage.setItem(DEAL_CACHE_KEY, JSON.stringify(parsed));
  } catch {}
}

export function getDealFromCache(storeSlug, dealId) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DEAL_CACHE_KEY) || "{}");
    return parsed[`${storeSlug}:${dealId}`] || null;
  } catch {
    return null;
  }
}
