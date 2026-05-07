import { useEffect, useState } from 'react';
import { api } from '../api.js';

function computeStats(stocks, zones, crew) {
  const totalStockIndex = stocks.reduce((s, x) => s + (x.survivalIndex || 0), 0);
  const stockScore = Math.min(100, (totalStockIndex / 200) * 100);

  const opZones = zones.filter(z => z.status === 'operational').length;
  const maintZones = zones.filter(z => z.status === 'maintenance').length;
  const critZones = zones.filter(z => z.status === 'critical').length;
  const zoneScore = zones.length === 0
    ? 50
    : Math.max(0, Math.min(100, ((opZones - critZones) / zones.length) * 100));

  const okCrew = crew.filter(m => m.state === 'ok').length;
  const injCrew = crew.filter(m => m.state === 'injured').length;
  const missCrew = crew.filter(m => m.state === 'missing').length;
  const crewScore = crew.length === 0
    ? 0
    : crew.reduce((s, m) => s + (m.survivalProbability || 0), 0) / crew.length;

  const global = Math.round(stockScore * 0.3 + zoneScore * 0.3 + crewScore * 0.4);

  return {
    global,
    stockScore: Math.round(stockScore),
    zoneScore: Math.round(zoneScore),
    crewScore: Math.round(crewScore),
    totalStockIndex,
    stockCount: stocks.length,
    opZones, maintZones, critZones, zoneCount: zones.length,
    okCrew, injCrew, missCrew, crewCount: crew.length
  };
}

function scoreColor(score) {
  if (score >= 70) return 'var(--green)';
  if (score >= 40) return 'var(--accent-2)';
  if (score >= 20) return 'var(--accent)';
  return 'var(--red)';
}

function Gauge({ value }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = scoreColor(value);

  return (
    <svg className="gauge" viewBox="0 0 220 220" width="220" height="220">
      <circle cx="110" cy="110" r={radius} fill="none"
        stroke="var(--border)" strokeWidth="14" />
      <circle cx="110" cy="110" r={radius} fill="none"
        stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 110 110)"
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s' }} />
      <text x="110" y="105" textAnchor="middle" fill="var(--text)"
        fontSize="48" fontWeight="bold" fontFamily="inherit">{value}%</text>
      <text x="110" y="135" textAnchor="middle" fill="var(--text-dim)"
        fontSize="11" letterSpacing="3" fontFamily="inherit">SURVIE GLOBALE</text>
    </svg>
  );
}

function Bar({ label, value, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bar-row">
      <div className="bar-label">
        <span>{label}</span>
        <strong style={{ color: scoreColor(value) }}>{value}%</strong>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: scoreColor(value) }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stocks, setStocks] = useState([]);
  const [zones, setZones] = useState([]);
  const [crew, setCrew] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [s, z, c] = await Promise.all([
        api.listStocks(), api.listZones(), api.listCrew()
      ]);
      setStocks(s); setZones(z); setCrew(c);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <p className="empty">Calcul de l'indice de survie…</p>;
  if (error) return <p className="error">⚠ {error}</p>;

  const stats = computeStats(stocks, zones, crew);

  return (
    <section className="page">
      <header className="page-header">
        <h2>📊 Tableau de bord du bunker</h2>
        <p>Évaluation globale de la situation et des chances de survie.</p>
      </header>

      <div className="dashboard">
        <div className="card gauge-card">
          <Gauge value={stats.global} />
          <div className="gauge-meta">
            {stats.global >= 70 && <p>✅ Situation stable. Le bunker tient bon.</p>}
            {stats.global >= 40 && stats.global < 70 && <p>⚠ Situation préoccupante. Vigilance requise.</p>}
            {stats.global >= 20 && stats.global < 40 && <p>🟠 Situation critique. Action urgente.</p>}
            {stats.global < 20 && <p>🔴 Le bunker est en danger imminent.</p>}
          </div>
        </div>

        <div className="card">
          <h3>Décomposition</h3>
          <Bar label="📦 Ressources (Stocks)" value={stats.stockScore} />
          <Bar label="🛠 Zones du bunker" value={stats.zoneScore} />
          <Bar label="🧑‍🚀 Équipe / Survivants" value={stats.crewScore} />
        </div>
      </div>

      <div className="dashboard">
        <article className="card stat-card">
          <h3>📦 Stocks</h3>
          <p className="big-num">{stats.stockCount}</p>
          <p className="big-label">ressources stockées</p>
          <p className="item-stat"><span>Indice total</span><strong>{stats.totalStockIndex}</strong></p>
        </article>

        <article className="card stat-card">
          <h3>🛠 Zones</h3>
          <p className="big-num">{stats.zoneCount}</p>
          <p className="big-label">zones surveillées</p>
          <p className="item-stat"><span>Opérationnelles</span><strong style={{color:'var(--green)'}}>{stats.opZones}</strong></p>
          <p className="item-stat"><span>Maintenance</span><strong style={{color:'var(--accent-2)'}}>{stats.maintZones}</strong></p>
          <p className="item-stat"><span>Critiques</span><strong style={{color:'var(--red)'}}>{stats.critZones}</strong></p>
        </article>

        <article className="card stat-card">
          <h3>🧑‍🚀 Équipe</h3>
          <p className="big-num">{stats.crewCount}</p>
          <p className="big-label">survivants enregistrés</p>
          <p className="item-stat"><span>En forme</span><strong style={{color:'var(--green)'}}>{stats.okCrew}</strong></p>
          <p className="item-stat"><span>Blessés</span><strong style={{color:'var(--accent-2)'}}>{stats.injCrew}</strong></p>
          <p className="item-stat"><span>Disparus</span><strong style={{color:'var(--red)'}}>{stats.missCrew}</strong></p>
        </article>
      </div>
    </section>
  );
}