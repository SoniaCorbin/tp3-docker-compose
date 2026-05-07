const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || 'Erreur réseau');
  }

  return res.json();
}

export const api = {
  health: () => request('/health'),

  listStocks: () => request('/stocks'),
  createStock: (data) => request('/stocks', { method: 'POST', body: JSON.stringify(data) }),
  updateStock: (id, data) => request(`/stocks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStock: (id) => request(`/stocks/${id}`, { method: 'DELETE' }),

  listZones: () => request('/zones'),
  createZone: (data) => request('/zones', { method: 'POST', body: JSON.stringify(data) }),
  updateZone: (id, data) => request(`/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteZone: (id) => request(`/zones/${id}`, { method: 'DELETE' }),

  listCrew: () => request('/crew'),
  createCrew: (data) => request('/crew', { method: 'POST', body: JSON.stringify(data) }),
  updateCrew: (id, data) => request(`/crew/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCrew: (id) => request(`/crew/${id}`, { method: 'DELETE' })
};