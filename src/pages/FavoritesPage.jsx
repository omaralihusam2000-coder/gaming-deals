import React, { useEffect, useMemo, useState } from "react";
import { HeartCrack } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DealCard from "../components/DealCard";
import { FAVORITES_KEY, CORE_STORE_SLUGS } from "../lib/constants";
import { fetchDeals, fetchStores } from "../providers/cheapshark";

export default function FavoritesPage() {
  const [stores, setStores] = useState([]);
  const [allDeals, setAllDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const loadedStores = (await fetchStores()).filter((s) => CORE_STORE_SLUGS.includes(s.slug));
        if (!mounted) return;
        setStores(loadedStores);

        const all = await Promise.all(
          loadedStores.map((store) => fetchDeals({ storeID: store.storeID, pageSize: 120, sortBy: "Deal Rating" }))
        );
        if (!mounted) return;
        setAllDeals(all.flat());
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  function toggleFavorite(dealID) {
    setFavorites((current) => current.includes(dealID) ? current.filter((id) => id !== dealID) : [...current, dealID]);
  }

  const favoriteDeals = useMemo(
    () => allDeals.filter((deal) => favorites.includes(deal.dealID)),
    [allDeals, favorites]
  );

  return (
    <div className="app-shell">
      <div className="background-glow" />
      <Navbar />
      <main className="container main-content">
        <section className="section-heading favorites-heading">
          <div>
            <h2>Saved Deals</h2>
            <p>Your bookmarked deals across Steam, Epic Games, and GOG.</p>
          </div>
          <div className="status-chip">{favoriteDeals.length} saved</div>
        </section>

        {loading ? (
          <div className="deals-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="deal-card skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line half" />
                  <div className="skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        ) : favoriteDeals.length === 0 ? (
          <div className="empty-state-card">
            <HeartCrack size={30} />
            <h3>No saved deals yet</h3>
            <p>Open a store page or the homepage and save the deals you want to track.</p>
          </div>
        ) : (
          <div className="deals-grid">
            {favoriteDeals.map((deal) => {
              const store = stores.find((s) => String(s.storeID) === String(deal.storeID));
              return (
                <DealCard
                  key={`${deal.dealID}-${deal.storeID}`}
                  deal={deal}
                  storeName={store?.storeName || "Store"}
                  storeSlug={store?.slug || "store"}
                  isFavorite={favorites.includes(deal.dealID)}
                  onToggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
