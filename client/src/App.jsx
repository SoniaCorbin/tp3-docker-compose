import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import StocksPage from './pages/StocksPage.jsx';
import ZonesPage from './pages/ZonesPage.jsx';
import CrewPage from './pages/CrewPage.jsx';

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
        <nav className="nav">
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/stocks" className="nav-link">BunkerStock</NavLink>
          <NavLink to="/zones" className="nav-link">Zones</NavLink>
          <NavLink to="/crew" className="nav-link">BunkerCrew</NavLink>
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
        </Routes>
      </main>

      <footer className="app-footer">
        <span>Apocaliste © Bunker Control — TP3 Docker Compose</span>
      </footer>
    </div>
  );
}