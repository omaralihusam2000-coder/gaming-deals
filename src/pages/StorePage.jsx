import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DealCard from "../components/DealCard";
import { AUTO_REFRESH_MS, CORE_STORE_SLUGS, FAVORITES_KEY } from "../lib/constants";
import { formatTime, getStoreTheme } from "../lib/helpers";
import { fetchDeals, fetchStores } from "../providers/cheapshark";

export default function StorePage() {
  const { storeSlug } = useParams();
  const [stores, setStores] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const firstLoadRef = useRef(true);
  const toastTimerRef = useRef(null);

  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const loadedStores = (await fetchStores()).filter((s) => CORE_STORE_SLUGS.includes(s.slug));
        if (!mounted) return;
        setStores(loadedStores);
      } catch {
        if (!mounted) return;
        setStores([]);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const currentStore = useMemo(() => stores.find((store) => store.slug === storeSlug), [stores, storeSlug]);

  useEffect(() => { if (currentStore) fetchStoreDeals(false); }, [currentStore]);
  useEffect(() => {
    if (!currentStore) return;
    const interval = setInterval(() => fetchStoreDeals(true), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [currentStore]);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  async function fetchStoreDeals(isBackgroundRefresh = false) {
    if (!currentStore) return;
    if (isBackgroundRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await fetchDeals({ storeID: currentStore.storeID, sortBy: "Deal Rating", pageSize: 96 });
      setDeals(data);
      setLastUpdated(new Date());
      if (isBackgroundRefresh && !firstLoadRef.current) {
        setShowToast(true);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 2400);
      }
    } catch (err) {
      setError(err.message || "Something went wrong while loading deals.");
      if (!isBackgroundRefresh) setDeals([]);
    } finally {
      firstLoadRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }

  function toggleFavorite(dealID) {
    setFavorites((current) => current.includes(dealID) ? current.filter((id) => id !== dealID) : [...current, dealID]);
  }

  const theme = getStoreTheme(currentStore?.storeName || "Store");

  return (
    <div className="app-shell">
      <div className="background-glow" />
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="refresh-toast">
            <CheckCircle2 className="toast-icon" />
            Store deals refreshed successfully
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar />
      <main className="container main-content">
        <div className="store-page-top"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link></div>
        <section className="store-hero store-hero-v2">
          <div>
            <p className="eyebrow-main">core store page</p>
            <h1>{currentStore ? currentStore.storeName : "Loading store..."}</h1>
            <p className="hero-description">Each core store now has a cleaner page, and every card links to a details page before the final store action.</p>
          </div>
          <div className={`store-hero-badge ${theme.className}`}>
            <div className="store-hero-name">{theme.icon}</div>
            <div className="store-hero-meta"><span>{deals.length} deals</span><span>Last updated {formatTime(lastUpdated)}</span></div>
            <button onClick={() => fetchStoreDeals(true)} className="refresh-btn"><RefreshCw size={16} className={refreshing ? "spin" : ""} /> Refresh store</button>
          </div>
        </section>

        <section className="section-heading">
          <div><h2>{currentStore ? `${currentStore.storeName} deals` : "Store deals"}</h2><p>Open the detail page first to see the full action options.</p></div>
          <div className="status-chip">{currentStore ? currentStore.storeName : "Store"} • {deals.length} results</div>
        </section>

        {loading ? (
          <div className="deals-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="deal-card skeleton-card"><div className="skeleton-image" /><div className="skeleton-content"><div className="skeleton-line wide" /><div className="skeleton-line half" /><div className="skeleton-button" /></div></div>)}</div>
        ) : error ? (
          <div className="error-card"><p className="error-title">Could not load store deals</p><p className="error-text">{error}</p></div>
        ) : (
          <div className="deals-grid">
            {deals.map((deal, index) => (
              <motion.div key={`${deal.dealID}-${deal.storeID}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}>
                <DealCard
                  deal={deal}
                  storeName={currentStore?.storeName || "Store"}
                  storeSlug={currentStore?.slug || "store"}
                  isFavorite={favorites.includes(deal.dealID)}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
