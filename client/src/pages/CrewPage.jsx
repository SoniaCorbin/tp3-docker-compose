import { useEffect, useState } from 'react';
import { api } from '../api.js';

const ROLES = ['medecin', 'ingenieur', 'soldat', 'cuisinier', 'scientifique', 'eclaireur', 'autre'];
const STATES = ['ok', 'injured', 'missing'];

const emptyForm = { name: '', role: 'soldat', skillLevel: 5, state: 'ok' };

export default function CrewPage() {
  const [crew, setCrew] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setCrew(await api.listCrew());
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.createCrew({ ...form, skillLevel: Number(form.skillLevel) });
      setForm(emptyForm);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Retirer ce survivant du registre ?')) return;
    try { await api.deleteCrew(id); load(); }
    catch (err) { setError(err.message); }
  }

  function startEdit(member) {
    setEditingId(member._id);
    setEditForm({
      name: member.name,
      role: member.role,
      skillLevel: member.skillLevel,
      state: member.state
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function saveEdit(id) {
    try {
      await api.updateCrew(id, { ...editForm, skillLevel: Number(editForm.skillLevel) });
      cancelEdit();
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>🧑‍🚀 BunkerCrew</h2>
        <p>Registre des survivants et équipe du bunker.</p>
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Enregistrer un survivant</h3>
        <div className="form-grid">
          <label>Nom
            <input type="text" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sonia, Marc, Léa..." />
          </label>
          <label>Rôle
            <select value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>Compétence (1-10)
            <input type="number" min="1" max="10" value={form.skillLevel}
              onChange={(e) => setForm({ ...form, skillLevel: e.target.value })} />
          </label>
          <label>État
            <select value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary">+ Recruter</button>
      </form>

      {error && <p className="error">⚠ {error}</p>}

      {loading ? (
        <p className="empty">Recensement en cours…</p>
      ) : crew.length === 0 ? (
        <p className="empty">Aucun survivant enregistré.</p>
      ) : (
        <div className="grid">
          {crew.map((m) => editingId === m._id ? (
            <article key={m._id} className="card item">
              <h4>Modifier le survivant</h4>
              <div className="form-grid">
                <label>Nom
                  <input type="text" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </label>
                <label>Rôle
                  <select value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label>Compétence (1-10)
                  <input type="number" min="1" max="10" value={editForm.skillLevel}
                    onChange={(e) => setEditForm({ ...editForm, skillLevel: e.target.value })} />
                </label>
                <label>État
                  <select value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div className="item-actions">
                <button className="btn btn-primary" onClick={() => saveEdit(m._id)}>Enregistrer</button>
                <button className="btn btn-secondary" onClick={cancelEdit}>Annuler</button>
              </div>
            </article>
          ) : (
            <article key={m._id} className={`card item state-${m.state}`}>
              <header className="item-head">
                <h4>{m.name}</h4>
                <span className={`badge badge-${m.state}`}>{m.state}</span>
              </header>
              <p className="item-meta">{m.role}</p>
              <p className="item-stat"><span>Compétence</span><strong>{m.skillLevel} / 10</strong></p>
              <p className="item-stat"><span>Survie estimée</span><strong>{m.survivalProbability}%</strong></p>
              <div className="item-actions">
                <button className="btn btn-secondary" onClick={() => startEdit(m)}>Modifier</button>
                <button className="btn btn-danger" onClick={() => handleDelete(m._id)}>Supprimer</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}