import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h3>What Game Deals We Got</h3>
          <p>Track live game deals from Steam, Epic Games, and GOG in one cleaner place with featured picks, smart filters, and store details.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/store/steam">Steam</Link>
            <Link to="/store/epic-games-store">Epic Games</Link>
            <Link to="/store/gog">GOG</Link>
          </div>

          <div>
            <h4>Library</h4>
            <Link to="/favorites">Favorites</Link>
            <Link to="/about">About</Link>
          </div>

          <div>
            <h4>Note</h4>
            <p className="footer-note">
              Steam uses direct app links when available. Epic Games and GOG may use direct links or store search depending on available product data.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
