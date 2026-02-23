const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

async function apiRequestFormData(endpoint: string, formData: FormData) {
  const headers: HeadersInit = {};

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    signup: async (username: string, password: string) => {
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuthToken(data.token);
      return data;
    },
    signin: async (username: string, password: string) => {
      const data = await apiRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuthToken(data.token);
      return data;
    },
    signout: () => {
      setAuthToken(null);
    },
  },
  jobs: {
    list: () => apiRequest('/api/jobs'),
    get: (id: string) => apiRequest(`/api/jobs/${id}`),
    upload: (formData: FormData) => apiRequestFormData('/api/jobs/upload', formData),
    createFromUrl: (data: { url: string; title: string; type: string }) =>
      apiRequest('/api/jobs/url', { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (data: { urls: string[]; type: string }) =>
      apiRequest('/api/jobs/bulk', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/api/jobs/${id}`, { method: 'DELETE' }),
  },
};
