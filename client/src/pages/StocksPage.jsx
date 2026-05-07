import { useEffect, useState } from 'react';
import { api } from '../api.js';

const CATEGORIES = ['nourriture', 'eau', 'medical', 'munitions', 'energie', 'outils', 'autre'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const emptyForm = { name: '', category: 'nourriture', quantity: 0, priority: 'medium' };

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setStocks(await api.listStocks());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.createStock({ ...form, quantity: Number(form.quantity) });
      setForm(emptyForm);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Retirer cette ressource du bunker ?')) return;
    try { await api.deleteStock(id); load(); }
    catch (err) { setError(err.message); }
  }

  function startEdit(stock) {
    setEditingId(stock._id);
    setEditForm({
      name: stock.name,
      category: stock.category,
      quantity: stock.quantity,
      priority: stock.priority
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function saveEdit(id) {
    try {
      await api.updateStock(id, { ...editForm, quantity: Number(editForm.quantity) });
      cancelEdit();
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>📦 BunkerStock</h2>
        <p>Inventaire des ressources critiques du bunker.</p>
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Ajouter une ressource</h3>
        <div className="form-grid">
          <label>Nom
            <input type="text" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rations, eau potable..." />
          </label>
          <label>Catégorie
            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Quantité
            <input type="number" min="0" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </label>
          <label>Priorité
            <select value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary">+ Stocker</button>
      </form>

      {error && <p className="error">⚠ {error}</p>}

      {loading ? (
        <p className="empty">Chargement de l'inventaire…</p>
      ) : stocks.length === 0 ? (
        <p className="empty">Aucune ressource. Le bunker est vide.</p>
      ) : (
        <div className="grid">
          {stocks.map((s) => editingId === s._id ? (
            <article key={s._id} className="card item">
              <h4>Modifier la ressource</h4>
              <div className="form-grid">
                <label>Nom
                  <input type="text" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </label>
                <label>Catégorie
                  <select value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>Quantité
                  <input type="number" min="0" value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
                </label>
                <label>Priorité
                  <select value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <div className="item-actions">
                <button className="btn btn-primary" onClick={() => saveEdit(s._id)}>Enregistrer</button>
                <button className="btn btn-secondary" onClick={cancelEdit}>Annuler</button>
              </div>
            </article>
          ) : (
            <article key={s._id} className={`card item priority-${s.priority}`}>
              <header className="item-head">
                <h4>{s.name}</h4>
                <span className={`badge badge-${s.priority}`}>{s.priority}</span>
              </header>
              <p className="item-meta">{s.category}</p>
              <p className="item-stat"><span>Quantité</span><strong>{s.quantity}</strong></p>
              <p className="item-stat"><span>Survival Index</span><strong>{s.survivalIndex}</strong></p>
              <div className="item-actions">
                <button className="btn btn-secondary" onClick={() => startEdit(s)}>Modifier</button>
                <button className="btn btn-danger" onClick={() => handleDelete(s._id)}>Supprimer</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}