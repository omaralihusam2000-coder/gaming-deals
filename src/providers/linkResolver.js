import { getCheapSharkRedirect } from "./cheapshark";
import { getSteamDirectUrl, getSteamSearchUrl } from "./steam";
import { getEpicBestEffortUrl } from "./epic";
import { getGogBestEffortUrl } from "./gog";

export function resolveDealUrl(deal, storeName = "") {
  const name = storeName.toLowerCase();

  if (name.includes("steam")) {
    const direct = getSteamDirectUrl(deal);
    if (direct) return { url: direct, isDirect: true, source: "steam-direct" };
    return { url: getSteamSearchUrl(deal?.title || ""), isDirect: false, source: "steam-search" };
  }

  if (name.includes("epic")) {
    return getEpicBestEffortUrl(deal);
  }

  if (name.includes("gog")) {
    return getGogBestEffortUrl(deal);
  }

  return { url: getCheapSharkRedirect(deal.dealID), isDirect: false, source: "cheapshark-fallback" };
}
