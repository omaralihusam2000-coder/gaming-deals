import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FAVORITES_KEY, FALLBACK_IMAGE } from "../lib/constants";
import { getDealFromCache, saveDealToCache } from "../lib/dealCache";
import { formatPrice, formatSavings, getStoreTheme } from "../lib/helpers";
import { fetchDeals, fetchStores } from "../providers/cheapshark";
import { resolveDealUrl } from "../providers/linkResolver";

export default function DealDetailsPage() {
  const { storeSlug, dealId } = useParams();
  const location = useLocation();
  const [stores, setStores] = useState([]);
  const [deal, setDeal] = useState(location.state?.deal || getDealFromCache(storeSlug, dealId));
  const [storeName, setStoreName] = useState(location.state?.storeName || "Store");
  const [loading, setLoading] = useState(!deal);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const loadedStores = await fetchStores();
        if (!mounted) return;
        setStores(loadedStores);
        const currentStore = loadedStores.find((s) => s.slug === storeSlug);
        if (currentStore) setStoreName(currentStore.storeName);

        if (!deal && currentStore) {
          const data = await fetchDeals({ storeID: currentStore.storeID, sortBy: "Deal Rating", pageSize: 60 });
          const found = data.find((item) => String(item.dealID) === String(dealId));
          if (found) {
            if (!mounted) return;
            setDeal(found);
            saveDealToCache(storeSlug, found);
          } else {
            setError("Deal not found in current store page fetch.");
          }
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Could not load deal details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, [deal, dealId, storeSlug]);

  function toggleFavorite() {
    if (!deal) return;
    setFavorites((current) => current.includes(deal.dealID) ? current.filter((id) => id !== deal.dealID) : [...current, deal.dealID]);
  }

  const theme = getStoreTheme(storeName);
  const resolved = useMemo(() => deal ? resolveDealUrl(deal, storeName) : null, [deal, storeName]);

  return (
    <div className="app-shell">
      <div className="background-glow" />
      <Navbar />
      <main className="container main-content">
        <div className="store-page-top">
          <Link to={`/store/${storeSlug}`} className="back-link"><ArrowLeft size={16} /> Back to store page</Link>
        </div>

        {loading ? (
          <div className="details-shell">
            <div className="details-card skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-line wide" />
                <div className="skeleton-line half" />
                <div className="skeleton-button" />
              </div>
            </div>
          </div>
        ) : error || !deal ? (
          <div className="error-card">
            <p className="error-title">Could not load deal details</p>
            <p className="error-text">{error || "No deal data found."}</p>
          </div>
        ) : (
          <section className="details-shell">
            <div className="details-card">
              <div className="details-grid">
                <div className="details-media">
                  <img src={deal.thumb || FALLBACK_IMAGE} alt={deal.title} className="details-image" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                </div>
                <div className="details-content">
                  <div className="details-top-row">
                    <span className={`store-badge ${theme.className}`}>{theme.icon}</span>
                    <button onClick={toggleFavorite} className="favorite-inline-btn">
                      <Star size={16} className={favorites.includes(deal.dealID) ? "favorite-filled" : ""} />
                      {favorites.includes(deal.dealID) ? "Saved" : "Save"}
                    </button>
                  </div>

                  <h1 className="details-title">{deal.title}</h1>
                  <p className="details-subtitle">Deal details page inside your website before the final store action.</p>

                  <div className="details-info-grid">
                    <div className="details-stat"><span>Deal rating</span><strong>{deal.dealRating || "N/A"}</strong></div>
                    <div className="details-stat"><span>Discount</span><strong>{formatSavings(deal.savings)}</strong></div>
                    <div className="details-stat"><span>Now</span><strong>{formatPrice(deal.salePrice)}</strong></div>
                    <div className="details-stat"><span>Before</span><strong>{formatPrice(deal.normalPrice)}</strong></div>
                  </div>

                  <div className="details-link-box">
                    <p className="details-link-label">Link strategy</p>
                    <p className="details-link-value">
                      {resolved?.isDirect ? "Best direct/best-effort route found for this store." : "Search/fallback route used for this store."}
                    </p>
                  </div>

                  <div className="details-actions">
                    <a href={resolved?.url} target="_blank" rel="noreferrer" className="open-store-btn details-open-btn">
                      Open on {theme.icon}
                      <ExternalLink size={16} />
                    </a>
                    <Link to={`/store/${storeSlug}`} className="details-secondary-btn">
                      View more from {theme.icon}
                    </Link>
                  </div>

                  <div className="details-note">
                    Source strategy: Steam tries app-page direct first. Epic and GOG use direct links only when a real slug is available, otherwise they use store search.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
