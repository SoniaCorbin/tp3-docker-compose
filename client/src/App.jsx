import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import StocksPage from './pages/StocksPage.jsx';
import ZonesPage from './pages/ZonesPage.jsx';
import CrewPage from './pages/CrewPage.jsx';
import MapPage from './pages/MapPage.jsx';

// 📅 Date du début de l'apocalypse (change-la si tu veux un autre point de départ)
const APOCALYPSE_START = new Date('2026-01-01');

function DaysCounter() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = Math.floor((now - APOCALYPSE_START) / (1000 * 60 * 60 * 24));
      setDays(diff);
    }
    update();
    // Met à jour toutes les minutes (au cas où minuit passe pendant la session)
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const display = String(days).padStart(4, '0');

  return (
    <div className="days-counter" title={`Apocalypse débutée le ${APOCALYPSE_START.toLocaleDateString('fr-FR')}`}>
      <div className="days-top">
        <span className="days-dot" />
        <span className="days-label">DEPUIS L'IMPACT</span>
      </div>
      <div className="days-num">{display}</div>
      <div className="days-bottom">JOURS DE SURVIE</div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-mark">☢</span>
          <div>
            <h1>Apocaliste</h1>
            <p className="tagline">Bunker Edition — Système de gestion</p>
          </div>
        </div>
        <DaysCounter />
        <nav className="nav">
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/stocks" className="nav-link">BunkerStock</NavLink>
          <NavLink to="/zones" className="nav-link">BunkerZones</NavLink>
          <NavLink to="/crew" className="nav-link">BunkerCrew</NavLink>
          <NavLink to="/map" className="nav-link">Carte</NavLink>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/zones" element={<ZonesPage />} />
          <Route path="/crew" element={<CrewPage />} />
          <Route path="*" element={<p className="empty">Zone inconnue du bunker.</p>} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <span>Apocaliste © Bunker Control — TP3 Docker Compose</span>
      </footer>
    </div>
  );
}
