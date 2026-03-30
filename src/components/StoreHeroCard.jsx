import React from "react";
import { Link } from "react-router-dom";
import { getStoreTheme } from "../lib/helpers";

export default function StoreHeroCard({ store, dealsCount = 0, description }) {
  const theme = getStoreTheme(store.storeName);
  return (
    <div className={`core-store-card ${theme.className}`}>
      <div className="core-store-top">
        <div className="core-store-badge">{theme.short}</div>
        <div>
          <h3>{theme.icon}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="core-store-stats">
        <span>{dealsCount} live deals</span>
        <span>Store page ready</span>
      </div>
      <Link to={`/store/${store.slug}`} className="core-store-btn">
        Explore {theme.icon}
      </Link>
    </div>
  );
}
