import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  Star,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import DealCard from "../components/DealCard";
import StoreHeroCard from "../components/StoreHeroCard";
import Footer from "../components/Footer";
import CustomSelect from "../components/CustomSelect";
import {
  AUTO_REFRESH_MS,
  CORE_STORE_SLUGS,
  FAVORITES_KEY,
} from "../lib/constants";
import { formatTime } from "../lib/helpers";
import { fetchDeals, fetchStores } from "../providers/cheapshark";

export default function HomePage() {
  const [stores, setStores] = useState([]);
  const [deals, setDeals] = useState([]);
  const [storeDealsMap, setStoreDealsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("core3-recent-searches") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedStore, setSelectedStore] = useState("all");
  const [sortBy, setSortBy] = useState("Deal Rating");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const firstLoadRef = useRef(true);
  const toastTimerRef = useRef(null);
  const storesSectionRef = useRef(null);
  const dealsSectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setVisibleCount(24);
  }, [debouncedSearch, selectedStore, sortBy, priceFilter, showFavoritesOnly]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(
      "core3-recent-searches",
      JSON.stringify(recentSearches),
    );
  }, [recentSearches]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const allStores = await fetchStores();
        const loadedStores = allStores.filter((s) =>
          CORE_STORE_SLUGS.includes(s.slug),
        );
        if (!mounted) return;
        setStores(loadedStores);
        const entries = await Promise.all(
          loadedStores
            .filter((store) => CORE_STORE_SLUGS.includes(store.slug))
            .map(async (store) => [
              String(store.storeID),
              await fetchDeals({
                storeID: store.storeID,
                pageSize: 18,
                sortBy: "Deal Rating",
              }),
            ]),
        );
        if (!mounted) return;
        setStoreDealsMap(Object.fromEntries(entries));
      } catch {
        if (!mounted) return;
        setStores([]);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchMainDeals(false);
  }, [debouncedSearch, selectedStore, sortBy, stores.length]);
  useEffect(() => {
    const interval = setInterval(() => fetchMainDeals(true), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [debouncedSearch, selectedStore, sortBy, stores.length]);
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  async function fetchMainDeals(isBackgroundRefresh = false) {
    if (isBackgroundRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      let data = [];

      if (selectedStore === "all") {
        const coreStores = stores.filter((s) =>
          CORE_STORE_SLUGS.includes(s.slug),
        );
        const results = await Promise.all(
          coreStores.map((store) =>
            fetchDeals({
              storeID: store.storeID,
              title: debouncedSearch,
              sortBy,
              pageSize: 60,
            }),
          ),
        );

        data = results.flat();
      } else {
        data = await fetchDeals({
          storeID: selectedStore,
          title: debouncedSearch,
          sortBy,
          pageSize: 96,
        });
      }

      const coreIds = new Set(stores.map((s) => String(s.storeID)));
      const filtered = data.filter((d) => coreIds.has(String(d.storeID)));

      const seen = new Set();
      const deduped = filtered.filter((deal) => {
        const normalizedTitle = String(deal.title || "")
          .trim()
          .toLowerCase();
        const key = `${normalizedTitle}-${deal.storeID}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setDeals(deduped);
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
    setFavorites((current) =>
      current.includes(dealID)
        ? current.filter((id) => id !== dealID)
        : [...current, dealID],
    );
  }

  const selectedStoreName = useMemo(() => {
    if (selectedStore === "all") return "All Core Stores";
    return (
      stores.find((store) => String(store.storeID) === String(selectedStore))
        ?.storeName || "Store"
    );
  }, [selectedStore, stores]);

  const filteredDeals = useMemo(() => {
    let result = [...deals];
    if (priceFilter === "under10")
      result = result.filter((deal) => Number(deal.salePrice) < 10);
    if (priceFilter === "under20")
      result = result.filter((deal) => Number(deal.salePrice) < 20);
    if (priceFilter === "under40")
      result = result.filter((deal) => Number(deal.salePrice) < 40);
    if (priceFilter === "above50")
      result = result.filter((deal) => Number(deal.savings) >= 50);
    if (showFavoritesOnly)
      result = result.filter((deal) => favorites.includes(deal.dealID));
    return result;
  }, [deals, priceFilter, showFavoritesOnly, favorites]);

  const suggestionPool = useMemo(() => {
    const titles = deals.map((d) => d.title).filter(Boolean);
    return [...new Set(titles)].slice(0, 8);
  }, [deals]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recentSearches.slice(0, 5);
    return suggestionPool
      .filter((title) => title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, suggestionPool, recentSearches]);

  function applySearch(value) {
    const cleaned = value.trim();
    setSearch(cleaned);
    setShowSuggestions(false);
    if (!cleaned) return;
    setRecentSearches((current) =>
      [cleaned, ...current.filter((item) => item !== cleaned)].slice(0, 6),
    );
  }

  function clearSearch() {
    setSearch("");
    setDebouncedSearch("");
    setShowSuggestions(false);
  }

  function scrollToSection(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const storeOptions = [
    { value: "all", label: "All Core Stores" },
    ...stores.map((store) => ({
      value: String(store.storeID),
      label: store.storeName,
    })),
  ];

  const sortOptions = [
    { value: "Deal Rating", label: "Best deals" },
    { value: "Savings", label: "Biggest discount" },
    { value: "Price", label: "Lowest price" },
    { value: "Recent", label: "Most recent" },
    { value: "Title", label: "Title" },
  ];

  const priceOptions = [
    { value: "all", label: "All prices" },
    { value: "under10", label: "Under $10" },
    { value: "under20", label: "Under $20" },
    { value: "under40", label: "Under $40" },
    { value: "above50", label: "50%+ off" },
  ];

  const featuredDeals = useMemo(() => {
    return [...filteredDeals]
      .sort((a, b) => Number(b.savings || 0) - Number(a.savings || 0))
      .slice(0, 3);
  }, [filteredDeals]);

  const visibleDeals = useMemo(() => {
    return filteredDeals.slice(0, visibleCount);
  }, [filteredDeals, visibleCount]);

  const canLoadMore = visibleCount < filteredDeals.length;

  const quickFilterCounts = useMemo(() => {
    return {
      all: deals.length,
      under10: deals.filter((deal) => Number(deal.salePrice) < 10).length,
      under20: deals.filter((deal) => Number(deal.salePrice) < 20).length,
      under40: deals.filter((deal) => Number(deal.salePrice) < 40).length,
      above50: deals.filter((deal) => Number(deal.savings) >= 50).length,
    };
  }, [deals]);

  function applyQuickFilter(next) {
    setPriceFilter(next);
    setVisibleCount(24);
    setTimeout(() => {
      scrollToSection(dealsSectionRef);
    }, 50);
  }

  const storeDescriptions = {
    steam: "Best PC sales, huge catalog, and strongest direct linking support.",
    "epic-games-store":
      "Strong exclusives, free games, and cleaner search fallback logic.",
    gog: "DRM-free catalog with direct-or-search routing and store details pages.",
  };

  return (
    <div className="app-shell">
      <div className="background-glow" />
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="refresh-toast"
          >
            <CheckCircle2 className="toast-icon" />
            Deals refreshed successfully
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar />
      <main className="container main-content">
        <section className="hero-section hero-core3">
          <div className="hero-copy">
            <div className="mini-pills">
              <span>
                <Sparkles size={14} />{" "}
              </span>
              <span>
                <Zap size={14} /> Deal Details
              </span>
              <span>
                <ShieldCheck size={14} /> Smarter Links to the stores{" "}
              </span>
            </div>
            <p className="eyebrow-main">steam • epic games • gog</p>
            <h1>
              Track the best game deals from Steam, Epic, and GOG — all in one
              place
            </h1>
            <p className="hero-description">
              Browse cleaner live deals from Steam, Epic Games, and GOG, check
              featured picks faster, and open smarter store links with a
              smoother overall experience.
            </p>
            <div className="hero-buttons">
              <button
                type="button"
                className="primary-cta"
                onClick={() => scrollToSection(dealsSectionRef)}
              >
                Browse Live Deals
              </button>
              <button
                type="button"
                className="secondary-cta"
                onClick={() => scrollToSection(storesSectionRef)}
              >
                Explore Core Stores
              </button>
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat">
                <strong>{stores.length}</strong>
                <span>core stores</span>
              </div>
              <div className="hero-stat">
                <strong>{filteredDeals.length}</strong>
                <span>live deals shown</span>
              </div>
              <div className="hero-stat">
                <strong>{formatTime(lastUpdated)}</strong>
                <span>last update</span>
              </div>
            </div>
          </div>

          <div className="hero-right-panel">
            <div className="hero-right-box hero-right-box-v2">
              <div className="hero-right-title">
                Why users will want to stay
              </div>
              <div className="hero-feature-grid">
                <div className="hero-feature-card">
                  <strong>Fast price checks</strong>
                  <span>
                    See discounts from Steam, Epic Games, and GOG in one clean
                    place.
                  </span>
                </div>
                <div className="hero-feature-card">
                  <strong>Less wasted clicks</strong>
                  <span>
                    Use the details page first, then choose the best store
                    action.
                  </span>
                </div>
                <div className="hero-feature-card">
                  <strong>Cleaner discovery</strong>
                  <span>
                    Focused only on 3 strong stores, so the browsing experience
                    stays simple.
                  </span>
                </div>
                <div className="hero-feature-card">
                  <strong>More live deals</strong>
                  <span>
                    This version loads more games so users can browse deeper
                    without feeling limited.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="info-cards-grid compact-info">
          {[
            {
              icon: ShieldCheck,
              label: "3-store focus",
              value: "Cleaner product and less noise",
            },
            {
              icon: BellRing,
              label: "Live refresh",
              value: "Updates every 2 minutes",
            },
            {
              icon: Sparkles,
              label: "Better UX",
              value: "Details page and stronger CTAs",
            },
            {
              icon: Zap,
              label: "Smarter links",
              value: "Direct if possible, search if needed",
            },
          ].map((item) => (
            <div key={item.label} className="info-card">
              <div className="info-card-icon">
                <item.icon size={20} />
              </div>
              <p className="info-label">{item.label}</p>
              <p className="info-value">{item.value}</p>
            </div>
          ))}
        </section>

        <section
          id="stores"
          ref={storesSectionRef}
          className="core-stores-section"
        >
          <div className="section-heading centered-heading">
            <div>
              <h2>Core Store Focus</h2>
              <p>
                Featured focus on Steam, Epic Games, and GOG — and the deals
                browser below is limited to these 3 stores only.
              </p>
            </div>
          </div>
          <div className="core-stores-grid">
            {stores
              .filter((store) => CORE_STORE_SLUGS.includes(store.slug))
              .map((store) => (
                <StoreHeroCard
                  key={store.storeID}
                  store={store}
                  dealsCount={
                    (storeDealsMap[String(store.storeID)] || []).length
                  }
                  description={
                    storeDescriptions[store.slug] || "Store page ready."
                  }
                />
              ))}
          </div>
        </section>

        <section className="featured-deals-section">
          <div className="section-heading">
            <div>
              <h2>Featured Deals</h2>
              <p>
                Editor-picked highlights with the strongest discounts right now
                from Steam, Epic Games, and GOG.
              </p>
            </div>
            <div className="status-chip">
              {featuredDeals.length} featured picks
            </div>
          </div>

          {loading ? (
            <div className="featured-deals-grid featured-deals-grid-pro">
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : (
            <div className="featured-deals-grid featured-deals-grid-pro">
              {featuredDeals.map((deal) => {
                const store = stores.find(
                  (s) => String(s.storeID) === String(deal.storeID),
                );
                return (
                  <DealCard
                    key={`featured-${deal.dealID}-${deal.storeID}`}
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
        </section>

        <section id="top-deals" className="filter-panel polished-filter-panel">
          <div className="smart-filters-row">
            <button
              type="button"
              className={`smart-chip ${priceFilter === "all" ? "active" : ""}`}
              onClick={() => applyQuickFilter("all")}
            >
              <span>All Deals</span>
              <strong>{quickFilterCounts.all}</strong>
            </button>
            <button
              type="button"
              className={`smart-chip ${priceFilter === "under10" ? "active" : ""}`}
              onClick={() => applyQuickFilter("under10")}
            >
              <span>Under $10</span>
              <strong>{quickFilterCounts.under10}</strong>
            </button>
            <button
              type="button"
              className={`smart-chip ${priceFilter === "under20" ? "active" : ""}`}
              onClick={() => applyQuickFilter("under20")}
            >
              <span>Under $20</span>
              <strong>{quickFilterCounts.under20}</strong>
            </button>
            <button
              type="button"
              className={`smart-chip ${priceFilter === "under40" ? "active" : ""}`}
              onClick={() => applyQuickFilter("under40")}
            >
              <span>Under $40</span>
              <strong>{quickFilterCounts.under40}</strong>
            </button>
            <button
              type="button"
              className={`smart-chip ${priceFilter === "above50" ? "active" : ""}`}
              onClick={() => applyQuickFilter("above50")}
            >
              <span>50%+ Off</span>
              <strong>{quickFilterCounts.above50}</strong>
            </button>
          </div>
          <div className="filter-grid">
            <div className="search-box premium-search-box">
              <Search size={18} className="search-leading-icon" />
              <div className="search-input-wrap">
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search games, for example Elden Ring, Cyberpunk, Resident Evil..."
                />
                {search ? (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>
              {showSuggestions && (suggestions.length > 0 || search.trim()) ? (
                <div className="search-suggestions">
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="search-suggestion-item"
                        onClick={() => applySearch(item)}
                      >
                        <Search size={14} />
                        <span>{item}</span>
                      </button>
                    ))
                  ) : (
                    <div className="search-no-results">
                      No quick suggestions found
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <CustomSelect
              value={selectedStore}
              onChange={setSelectedStore}
              options={storeOptions}
              className="filter-input"
              placeholder="All Core Stores"
            />
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              className="filter-input"
              placeholder="Best deals"
            />
            <CustomSelect
              value={priceFilter}
              onChange={setPriceFilter}
              options={priceOptions}
              className="filter-input"
              placeholder="All prices"
            />
            <div className="filter-actions">
              <button
                onClick={() => setShowFavoritesOnly((v) => !v)}
                className={`saved-btn ${showFavoritesOnly ? "saved-active" : ""}`}
              >
                <Star size={16} /> Saved
              </button>
              <button
                onClick={() => fetchMainDeals(true)}
                className="refresh-btn"
              >
                <RefreshCw size={16} className={refreshing ? "spin" : ""} />{" "}
                Refresh
              </button>
            </div>
          </div>
        </section>

        <div className="live-stores-banner">
          🔥 Showing live deals from Steam, Epic Games, and GOG
        </div>
        <section
          id="latest-deals"
          ref={dealsSectionRef}
          className="section-heading"
        >
          <div>
            <h2>All Live Deals from Steam, Epic Games, and GOG</h2>
            <p>
              Browse the full live list from the 3 core stores. Use filters to
              narrow results, then open the details page before the final store
              action.
            </p>
          </div>
          <div className="status-chip">
            {selectedStoreName} • {filteredDeals.length} live results
          </div>
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
        ) : error ? (
          <div className="error-card">
            <p className="error-title">Could not load live deals</p>
            <p className="error-text">{error}</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="empty-state-card">
            <h3>No deals found</h3>
            <p>
              No deals matched this quick filter right now. Try All Deals or
              another store.
            </p>
          </div>
        ) : (
          <>
            <div className="deals-grid">
              {visibleDeals.map((deal, index) => {
                const store = stores.find(
                  (s) => String(s.storeID) === String(deal.storeID),
                );
                return (
                  <motion.div
                    key={`${deal.dealID}-${deal.storeID}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <DealCard
                      deal={deal}
                      storeName={store?.storeName || "Store"}
                      storeSlug={store?.slug || "store"}
                      isFavorite={favorites.includes(deal.dealID)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </motion.div>
                );
              })}
            </div>
            {isLoadingMore ? (
              <div className="deals-grid loadmore-skeleton-grid">
                {Array.from({ length: 3 }).map((_, i) => (
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
            ) : null}
            {canLoadMore ? (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="load-more-btn"
                  disabled={isLoadingMore}
                  onClick={() => {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                      setVisibleCount((v) => v + 24);
                      setIsLoadingMore(false);
                    }, 350);
                  }}
                >
                  {isLoadingMore ? "Loading more deals..." : "Load More Deals"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
