import { API_BASE } from "../lib/constants";
import { normalizeStoreName } from "../lib/helpers";

export async function fetchStores() {
  const res = await fetch(`${API_BASE}/stores`);
  if (!res.ok) throw new Error("Failed to load stores.");
  const data = await res.json();
  return data.filter((s) => s.isActive === 1).map((s) => ({ ...s, slug: normalizeStoreName(s.storeName) }));
}

export async function fetchDeals(params = {}) {
  const query = new URLSearchParams({
    pageSize: String(params.pageSize || 24),
    sortBy: params.sortBy || "Deal Rating",
    lowerPrice: "0",
  });
  if (params.title) query.set("title", params.title);
  if (params.storeID && params.storeID !== "all") query.set("storeID", String(params.storeID));
  const res = await fetch(`${API_BASE}/deals?${query.toString()}`);
  if (!res.ok) throw new Error("Could not fetch live deals.");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function getCheapSharkRedirect(dealID) {
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
}
