import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Menu, Star, X } from "lucide-react";

function linkClass({ isActive }) {
  return isActive ? "nav-real-link active" : "nav-real-link";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand">What Game Deals We Got</Link>

        <nav className="nav-real desktop-nav">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>

          <div className="nav-dropdown">
            <button className="nav-dropdown-trigger" type="button">
              Stores <ChevronDown size={16} />
            </button>
            <div className="nav-dropdown-menu">
              <NavLink to="/store/steam" className="nav-dropdown-item">Steam</NavLink>
              <NavLink to="/store/epic-games-store" className="nav-dropdown-item">Epic Games</NavLink>
              <NavLink to="/store/gog" className="nav-dropdown-item">GOG</NavLink>
            </div>
          </div>

          <NavLink to="/favorites" className={linkClass}>
            <Star size={15} />
            Favorites
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <NavLink to="/favorites" className="auth-btn desktop-favorites-btn">Saved Deals</NavLink>
          <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(v => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-nav-shell">
          <div className="container mobile-nav">
            <NavLink to="/" className="mobile-nav-link" end onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/store/steam" className="mobile-nav-link" onClick={() => setOpen(false)}>Steam</NavLink>
            <NavLink to="/store/epic-games-store" className="mobile-nav-link" onClick={() => setOpen(false)}>Epic Games</NavLink>
            <NavLink to="/store/gog" className="mobile-nav-link" onClick={() => setOpen(false)}>GOG</NavLink>
            <NavLink to="/favorites" className="mobile-nav-link" onClick={() => setOpen(false)}>Favorites</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
