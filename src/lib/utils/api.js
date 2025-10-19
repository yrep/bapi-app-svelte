const API_BASE = '/api';

export const api = {
  request: async (method, path, data = null) => {
    const url = `${API_BASE}/${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    return await response.json();
  },

  get: (path, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${path}${query ? `?${query}` : ''}`;
    return api.request('GET', url);
  },

  post: (path, data) => api.request('POST', path, data),
  put: (path, data) => api.request('PUT', path, data),
  delete: (path) => api.request('DELETE', path)
};

async function handleApiResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export const brandsApi = {
  list: () => fetch('/api/brands').then(handleApiResponse),
  getBySlug: (slug) => fetch(`/api/brands/getBrandBySlug?slug=${slug}`).then(handleApiResponse)
};

export const usersApi = {
  getById: (id) => fetch(`/api/users/${id}`).then(handleApiResponse),
  getByEmail: (email) => fetch(`/api/users/getUserByEmail?email=${email}`).then(handleApiResponse),
  getByCRM: (crmId) => fetch(`/api/users/getUserByCRM?crm=${crmId}`).then(handleApiResponse)
};