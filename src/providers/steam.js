import { encodeQuery } from "../lib/helpers";

export function getSteamDirectUrl(deal) {
  const appId = deal?.steamAppID || deal?.steamAppId;
  if (!appId) return null;
  return `https://store.steampowered.com/app/${encodeURIComponent(appId)}/`;
}

export function getSteamSearchUrl(title) {
  return `https://store.steampowered.com/search/?term=${encodeQuery(title)}`;
}
