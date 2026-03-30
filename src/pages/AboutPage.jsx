import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="app-shell">
      <div className="background-glow" />
      <Navbar />
      <main className="container main-content">
        <section className="section-heading about-heading">
          <div>
            <h2>About What Game Deals We Got</h2>
            <p>A focused game deals experience built around Steam, Epic Games, and GOG, designed to make deal hunting clearer and faster.</p>
          </div>
        </section>

        <div className="about-grid">
          <div className="about-card">
            <h3>Why only 3 stores?</h3>
            <p>Keeping the site focused makes browsing faster, cleaner, and easier to improve over time.</p>
          </div>
          <div className="about-card">
            <h3>How links work</h3>
            <p>Steam uses direct app links when available. Epic Games and GOG use direct links only when reliable product data exists, otherwise store search is used.</p>
          </div>
          <div className="about-card">
            <h3>How to use the site</h3>
            <p>Browse Featured Deals for quick picks, then use Latest Core Deals to explore the full live list and save games to Favorites.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
