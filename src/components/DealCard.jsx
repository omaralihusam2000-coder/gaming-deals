import React from "react";
import { ExternalLink, Flame, Star, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { FALLBACK_IMAGE } from "../lib/constants";
import { formatPrice, formatSavings, getStoreTheme } from "../lib/helpers";
import { resolveDealUrl } from "../providers/linkResolver";
import { saveDealToCache } from "../lib/dealCache";

export default function DealCard({ deal, storeName, storeSlug, isFavorite, onToggleFavorite }) {
  const theme = getStoreTheme(storeName);
  const resolved = resolveDealUrl(deal, storeName);

  function handleDetailsClick() {
    saveDealToCache(storeSlug, deal);
  }

  return (
    <article className="deal-card">
      <div className="deal-image-wrap">
        <img src={deal.thumb || FALLBACK_IMAGE} alt={deal.title} className="deal-image" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
        <div className="deal-top-overlay" />
        <div className="deal-badges">
          <span className="discount-badge big-discount-badge">{formatSavings(deal.savings)}</span>
          <span className={`store-badge ${theme.className}`}>{theme.icon}</span>
        </div>
        <button onClick={() => onToggleFavorite(deal.dealID)} className="favorite-btn" aria-label="Toggle favorite">
          <Star size={16} className={isFavorite ? "favorite-filled" : ""} />
        </button>
      </div>
      <div className="deal-body">
        <h3 className="deal-title">{deal.title}</h3>
        {isFavorite ? <div className="saved-mini-badge">Saved</div> : null}
        <div className="deal-meta">
          <span><Flame size={13} /> {deal.dealRating || "N/A"} rating</span>
          <span><Store size={13} /> {storeName || "Store"}</span>
        </div>
        <div className="price-box">
          <div>
            <p className="price-label">Deal price</p>
            <p className="deal-price highlight-price ultra-price">{formatPrice(deal.salePrice)}</p>
          </div>
          <div className="price-side">
            <p className="old-price subdued-old-price">{formatPrice(deal.normalPrice)}</p>
            <p className="save-price">Save {formatSavings(deal.savings)}</p>
          </div>
        </div>
        <div className={`link-status ${resolved.isDirect ? "direct" : "fallback"}`}>
          {resolved.isDirect ? "Direct store link" : "Store search link"}
        </div>
        <div className="deal-actions">
          <Link to={`/deal/${storeSlug}/${deal.dealID}`} state={{ deal, storeName, storeSlug }} onClick={handleDetailsClick} className="details-btn">
            View details
          </Link>
          <a href={resolved.url} target="_blank" rel="noreferrer" className="open-store-btn compact-store-btn">
            Open on {theme.icon}
            <ExternalLink size={16} />
          </a>
        </div>
        <div className="tiny-note">
          {resolved.isDirect ? "Real direct link found for this store." : "Uses the store search page when a reliable direct product link is unavailable."}
        </div>
      </div>
    </article>
  );
}
