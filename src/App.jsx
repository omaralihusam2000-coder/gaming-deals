import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import StorePage from './pages/StorePage.jsx'
import DealDetailsPage from './pages/DealDetailsPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import AboutPage from './pages/AboutPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/store/:storeSlug" element={<StorePage />} />
      <Route path="/deal/:storeSlug/:dealId" element={<DealDetailsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  )
}
