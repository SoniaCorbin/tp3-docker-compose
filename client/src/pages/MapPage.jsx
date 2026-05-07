import { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS_COLORS = {
  operational: '#4ad66d',
  maintenance: '#ffd000',
  critical:    '#ef4444'
};

export default function MapPage() {
  const [zones, setZones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listZones().then(z => { setZones(z); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty">Chargement de la carte tactique…</p>;

  // Disposition automatique en grille (pseudo-carrée)
  const count = Math.max(1, zones.length);
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const cellW = 140;
  const cellH = 100;
  const gap = 8;
  const pad = 80;
  const bunkerW = cols * cellW;
  const bunkerH = rows * cellH;
  const totalW = bunkerW + pad * 2;
  const totalH = bunkerH + pad * 2;

  return (
    <section className="page">
      <header className="page-header">
        <h2>🗺 Carte tactique</h2>
        <p>Vue d'ensemble du bunker et des zones extérieures contaminées.</p>
      </header>

      <div className="map-layout">
        <div className="card map-card">
          <svg viewBox={`0 0 ${totalW} ${totalH}`} className="bunker-map">
            <defs>
              {/* Pattern de zone contaminée à l'extérieur */}
              <pattern id="wasteland" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="#0a0c08" />
                <text x="8" y="16" fontSize="10" fill="#3a2515" opacity="0.5">☢</text>
                <text x="24" y="32" fontSize="8" fill="#3a2515" opacity="0.5">☣</text>
              </pattern>
            </defs>

            {/* Périmètre extérieur (wasteland) */}
            <rect x="0" y="0" width={totalW} height={totalH} fill="url(#wasteland)" />

            {/* Tags de zones extérieures */}
            <text x={totalW/2} y="30" textAnchor="middle"
              fill="#ef4444" fontSize="14" letterSpacing="6"
              fontFamily="Courier New, monospace">⚠ ZONE CONTAMINÉE ⚠</text>
            <text x={totalW/2} y={totalH-15} textAnchor="middle"
              fill="#ef4444" fontSize="10" letterSpacing="4"
              fontFamily="Courier New, monospace">— PÉRIMÈTRE EXTÉRIEUR —</text>

            {/* Murs du bunker */}
            <rect x={pad-6} y={pad-6} width={bunkerW+12} height={bunkerH+12}
              fill="none" stroke="#ff8a1f" strokeWidth="3" />
            <rect x={pad-2} y={pad-2} width={bunkerW+4} height={bunkerH+4}
              fill="#14171a" stroke="#ff8a1f" strokeWidth="1" />

            {/* Coins métalliques */}
            {[[pad-6,pad-6],[pad+bunkerW-14,pad-6],[pad-6,pad+bunkerH-14],[pad+bunkerW-14,pad+bunkerH-14]].map(([x,y],i) => (
              <rect key={i} x={x} y={y} width="20" height="20" fill="#ff8a1f" opacity="0.6" />
            ))}

            {/* Zones du bunker */}
            {zones.length === 0 && (
              <text x={totalW/2} y={totalH/2} textAnchor="middle"
                fill="#8a948c" fontSize="14" fontFamily="Courier New, monospace">
                Aucune zone enregistrée. Ajoute-en dans BunkerOps.
              </text>
            )}

            {zones.map((z, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = pad + col * cellW + gap/2;
              const y = pad + row * cellH + gap/2;
              const w = cellW - gap;
              const h = cellH - gap;
              const color = STATUS_COLORS[z.status] || '#8a948c';
              const isSelected = selected?._id === z._id;

              return (
                <g key={z._id} onClick={() => setSelected(z)} style={{cursor:'pointer'}}>
                  <rect x={x} y={y} width={w} height={h}
                    fill={color}
                    fillOpacity={isSelected ? 0.35 : 0.12}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className={z.status === 'critical' ? 'zone-pulse' : ''} />
                  <text x={x + w/2} y={y + h/2 - 8} textAnchor="middle"
                    fill="#d8dcd6" fontSize="13" fontFamily="Courier New, monospace"
                    fontWeight="bold">
                    {z.name.length > 14 ? z.name.slice(0,12)+'…' : z.name}
                  </text>
                  <text x={x + w/2} y={y + h/2 + 8} textAnchor="middle"
                    fill={color} fontSize="9" letterSpacing="3"
                    fontFamily="Courier New, monospace">
                    {z.status.toUpperCase()}
                  </text>
                  <text x={x + w/2} y={y + h/2 + 24} textAnchor="middle"
                    fill="#8a948c" fontSize="9" fontFamily="Courier New, monospace">
                    DANGER {z.dangerLevel}/10
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="card map-side">
          <h3>📍 Légende</h3>
          <div className="legend-row"><span className="dot" style={{background:STATUS_COLORS.operational}}/>Opérationnelle</div>
          <div className="legend-row"><span className="dot" style={{background:STATUS_COLORS.maintenance}}/>Maintenance</div>
          <div className="legend-row"><span className="dot" style={{background:STATUS_COLORS.critical}}/>Critique</div>

          <h3 style={{marginTop:24}}>📊 Statistiques</h3>
          <p className="item-stat"><span>Total</span><strong>{zones.length}</strong></p>
          <p className="item-stat"><span style={{color:STATUS_COLORS.operational}}>Opérationnelles</span>
            <strong>{zones.filter(z=>z.status==='operational').length}</strong></p>
          <p className="item-stat"><span style={{color:STATUS_COLORS.maintenance}}>Maintenance</span>
            <strong>{zones.filter(z=>z.status==='maintenance').length}</strong></p>
          <p className="item-stat"><span style={{color:STATUS_COLORS.critical}}>Critiques</span>
            <strong>{zones.filter(z=>z.status==='critical').length}</strong></p>

          {selected && (
            <>
              <h3 style={{marginTop:24}}>🎯 Zone sélectionnée</h3>
              <p style={{margin:'4px 0', fontSize:16, color:'var(--accent-2)'}}><strong>{selected.name}</strong></p>
              <p className="item-stat"><span>Statut</span><strong style={{color:STATUS_COLORS[selected.status]}}>{selected.status}</strong></p>
              <p className="item-stat"><span>Danger</span><strong>{selected.dangerLevel}/10</strong></p>
              {selected.description && <p style={{fontSize:12, color:'var(--text-dim)', marginTop:8}}>{selected.description}</p>}
              <button className="btn btn-secondary" style={{marginTop:10, width:'100%'}}
                onClick={()=>setSelected(null)}>Désélectionner</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}