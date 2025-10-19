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
  console.dir(response)
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
  
  getByEmail: (email, brandSlug) => {
    const params = new URLSearchParams({ 
      email: email,
      brand_slug: brandSlug 
    });
    return fetch(`/api/users/getUserByBrandSlugEmail?${params}`).then(handleApiResponse);
  },
  //admin/getUserByBrandSlugCrmDomain
  getByCRM: (crmId, brandSlug) => {
    const params = new URLSearchParams({ 
      domain: crmId,
      brand_slug: brandSlug 
    });
    return fetch(`/api/admin/getUserByBrandSlugCrmDomain?${params}`).then(handleApiResponse);
  }
};

export const entityApi = {
  search: (entityType, params = {}) => {
    // Для разных entity types используем соответствующие API
    switch (entityType) {
      case 'user':
        if (params.id) return usersApi.getById(params.id);
        if (params.email) return usersApi.getByEmail(params.email);
        if (params.crm) return usersApi.getByCRM(params.crm);
        break;
      case 'vendor':
        // Заглушка для vendor API - замените на реальное
        return fetch(`/api/vendors/${params.id}`).then(handleApiResponse);
      case 'bind':
        // Заглушка для bind API - замените на реальное
        return fetch(`/api/binds/${params.id}`).then(handleApiResponse);
      case 'task':
        // Заглушка для task API - замените на реальное
        return fetch(`/api/tasks/${params.id}`).then(handleApiResponse);
      case 'request':
        // Заглушка для request API - замените на реальное
        return fetch(`/api/requests/${params.id}`).then(handleApiResponse);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
    
    // Если не нашли подходящий параметр, возвращаем пустой массив
    return Promise.resolve([]);
  }
};