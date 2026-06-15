// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

// Helper para obter token
const getToken = () => localStorage.getItem('access_token');

// Helper para headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// API Service completa
const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return { ok: response.ok, data };
  },

  // Login com Google: envia o ID token (credential) devolvido pelo Google
  loginWithGoogle: async (credential) => {
    const response = await fetch(`${API_BASE_URL}/users/google-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return { ok: response.ok, data };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: getHeaders()
    });
    return response.json();
  },

  updateUser: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  // Buildings
  getBuildings: async () => {
    const response = await fetch(`${API_BASE_URL}/buildings/`, {
      headers: getHeaders()
    });
    return response.json();
  },

  createBuilding: async (data) => {
    const response = await fetch(`${API_BASE_URL}/buildings/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateBuilding: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/buildings/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteBuilding: async (id) => {
    const response = await fetch(`${API_BASE_URL}/buildings/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  // Equipment
  getEquipment: async () => {
    const response = await fetch(`${API_BASE_URL}/equipment/`, {
      headers: getHeaders()
    });
    return response.json();
  },

  createEquipment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/equipment/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateEquipment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteEquipment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  // Rooms
  getRooms: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/rooms/?${params}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  getRoomAvailability: async (roomId, date) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/availability/?date=${date}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  createRoom: async (data) => {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateRoom: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteRoom: async (id) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  // Reservations
  getReservations: async () => {
    const response = await fetch(`${API_BASE_URL}/reservations/`, {
      headers: getHeaders()
    });
    return response.json();
  },

  getUserReservations: async () => {
    const response = await fetch(`${API_BASE_URL}/reservations/my_reservations/`, {
      headers: getHeaders()
    });
    return response.json();
  },

  createReservation: async (data) => {
    const response = await fetch(`${API_BASE_URL}/reservations/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  cancelReservation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel/`, {
      method: 'POST',
      headers: getHeaders()
    });
    return response.json();
  },

  approveReservation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/approve/`, {
      method: 'POST',
      headers: getHeaders()
    });
    return response.json();
  },

  rejectReservation: async (id, reason) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/reject/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return response.json();
  },

  // Secretariado: pedidos pendentes
  getPendingReservations: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/reservations/pending/?${params}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  // Secretariado: histórico de reservas (filtros: buildingId, roomId, search, startDate, endDate, sortOrder)
  getReservationHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/reservations/history/?${params}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  // Secretariado: importar CSV (type: horarios_aulas | horarios_exames | calendario_letivo)
  importData: async (type, file) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/imports/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });
    return response.json();
  },

  // URL do template CSV (endpoint público, abre diretamente no browser)
  templateUrl: (type) => `${API_BASE_URL}/imports/template/?type=${type}`
};

export default api;