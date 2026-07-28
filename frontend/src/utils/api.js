/**
 * api.js — Cliente HTTP centralizado
 *
 * Todas las llamadas al backend pasan por aquí.
 * Agrega automáticamente el Authorization header si hay token.
 * Maneja errores 401 (token expirado).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

/**
 * Función base para hacer requests a la API.
 * @param {string} endpoint  - Ruta relativa. Ej: '/productos'
 * @param {RequestInit} options - Opciones de fetch
 * @param {boolean} auth - Si true, agrega el header Authorization
 */
async function request(endpoint, options = {}, auth = false) {
  const headers = {
    ...(options.headers || {}),
  };

  // No poner Content-Type si es FormData (el browser lo setea con boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // para cookies de refresh token
  });

  // Respuesta sin cuerpo (204)
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data?.message || 'Error del servidor');
    error.status = res.status;
    error.data   = data;
    throw error;
  }

  return data;
}

// ── Shortcuts públicos ────────────────────────────────────────────────

export const api = {
  get:    (endpoint) => request(endpoint, { method: 'GET' }),
  post:   (endpoint, body) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
};

// ── Shortcuts protegidos (requieren token admin) ──────────────────────

export const adminApi = {
  get: (endpoint) => request(endpoint, { method: 'GET' }, true),

  post: (endpoint, body) => {
    const isFormData = body instanceof FormData;
    return request(
      endpoint,
      { method: 'POST', body: isFormData ? body : JSON.stringify(body) },
      true,
    );
  },

  put: (endpoint, body) => {
    const isFormData = body instanceof FormData;
    return request(
      endpoint,
      { method: 'PUT', body: isFormData ? body : JSON.stringify(body) },
      true,
    );
  },

  patch: (endpoint, body) =>
    request(
      endpoint,
      { method: 'PATCH', body: body ? JSON.stringify(body) : undefined },
      true,
    ),

  delete: (endpoint) => request(endpoint, { method: 'DELETE' }, true),
};
