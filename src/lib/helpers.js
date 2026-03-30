export function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number);
}
export function formatSavings(value) {
  return `${Math.round(Number(value || 0))}% OFF`;
}
export function formatTime(date) {
  if (!date) return "--";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}
export function normalizeStoreName(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function slugifyText(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function getStoreTheme(name = "") {
  const n = name.toLowerCase();
  if (n.includes("steam")) return { icon: "Steam", className: "theme-steam", short: "ST" };
  if (n.includes("epic")) return { icon: "Epic Games", className: "theme-epic", short: "EP" };
  if (n.includes("gog")) return { icon: "GOG", className: "theme-gog", short: "GG" };
  return { icon: name || "Store", className: "theme-default", short: "ST" };
}
export function encodeQuery(text = "") {
  return encodeURIComponent(text.trim());
}
