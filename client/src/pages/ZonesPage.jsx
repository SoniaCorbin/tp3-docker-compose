import { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUSES = ['operational', 'maintenance', 'critical'];

const emptyForm = { name: '', status: 'operational', dangerLevel: 0, description: '' };

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setZones(await api.listZones());
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.createZone({ ...form, dangerLevel: Number(form.dangerLevel) });
      setForm(emptyForm);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Retirer cette zone du registre ?')) return;
    try { await api.deleteZone(id); load(); }
    catch (err) { setError(err.message); }
  }

  function startEdit(zone) {
    setEditingId(zone._id);
    setEditForm({
      name: zone.name,
      status: zone.status,
      dangerLevel: zone.dangerLevel,
      description: zone.description || ''
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function saveEdit(id) {
    try {
      await api.updateZone(id, { ...editForm, dangerLevel: Number(editForm.dangerLevel) });
      cancelEdit();
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>🛠 Zones</h2>
        <p>Surveillance et état des zones du bunker.</p>
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Déclarer une zone</h3>
        <div className="form-grid">
          <label>Nom
            <input type="text" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sas Nord, Réacteur, Infirmerie..." />
          </label>
          <label>Statut
            <select value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Danger (0-10)
            <input type="number" min="0" max="10" value={form.dangerLevel}
              onChange={(e) => setForm({ ...form, dangerLevel: e.target.value })} />
          </label>
          <label className="full">Description
            <input type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Notes opérationnelles..." />
          </label>
        </div>
        <button type="submit" className="btn btn-primary">+ Enregistrer</button>
      </form>

      {error && <p className="error">⚠ {error}</p>}

      {loading ? (
        <p className="empty">Lecture des capteurs…</p>
      ) : zones.length === 0 ? (
        <p className="empty">Aucune zone enregistrée.</p>
      ) : (
        <div className="grid">
          {zones.map((z) => editingId === z._id ? (
            <article key={z._id} className="card item">
              <h4>Modifier la zone</h4>
              <div className="form-grid">
                <label>Nom
                  <input type="text" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </label>
                <label>Statut
                  <select value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>Danger (0-10)
                  <input type="number" min="0" max="10" value={editForm.dangerLevel}
                    onChange={(e) => setEditForm({ ...editForm, dangerLevel: e.target.value })} />
                </label>
                <label className="full">Description
                  <input type="text" value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </label>
              </div>
              <div className="item-actions">
                <button className="btn btn-primary" onClick={() => saveEdit(z._id)}>Enregistrer</button>
                <button className="btn btn-secondary" onClick={cancelEdit}>Annuler</button>
              </div>
            </article>
          ) : (
            <article key={z._id} className={`card item status-${z.status}`}>
              <header className="item-head">
                <h4>{z.name}</h4>
                <span className={`badge badge-${z.status}`}>{z.status}</span>
              </header>
              <p className="item-stat"><span>Danger</span><strong>{z.dangerLevel} / 10</strong></p>
              {z.description && <p className="item-desc">{z.description}</p>}
              <div className="item-actions">
                <button className="btn btn-secondary" onClick={() => startEdit(z)}>Modifier</button>
                <button className="btn btn-danger" onClick={() => handleDelete(z._id)}>Supprimer</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}