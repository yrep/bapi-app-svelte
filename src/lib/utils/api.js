const API_BASE = '/api';

async function handleApiResponse(response) {
  const responseClone = response.clone();
  const responseText = await response.text();

  console.log(`Response status: ${response.status}`);
  console.log(`Response body: ${responseText}`);

  if (!response.ok) {
    let errorMessage = `API error ${response.status}`;

    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = responseText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return JSON.parse(responseText);
}

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
    return handleApiResponse(response);
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

export const brandsApi = {
  list: () => api.get('brands'),
  getBySlug: (slug) => api.get(`brands/getBrandBySlug?slug=${slug}`)
};


export const usersApi = {
  getById: (id) => api.get(`users/${id}`),
  getByEmail: (email, brandSlug) => api.get('admin/getUserByBrandSlugEmail', {
    email: email,
    brand_slug: brandSlug
  }),
  getByCRM: (crmId, brandSlug) => api.get('admin/getUserByBrandSlugCrmDomain', {
    domain: crmId,
    brand_slug: brandSlug
  })
};

export const vendorsApi = {
  search: (uuid) => api.post(`vendors/getVendor?slug=${uuid}`),
  getByUuid: (uuid) => api.post(`vendors/getVendor?slug=${uuid}`),
};

export const entityApi = {
  search: (entityType, params = {}) => {
    switch (entityType) {
      case 'user':
        if (params.id) return usersApi.getById(params.id);
        if (params.email) return usersApi.getByEmail(params.email, params.brandSlug);
        if (params.crm) return usersApi.getByCRM(params.crm, params.brandSlug);
        break;
      case 'vendor':
        if (params.uuid) return api.post(`vendors/getVendor`, params);
        //return api.get(`vendors/${params.id}`);
      case 'bind':
        return api.get(`vendors/getVendorBindsWithData`);
      case 'task':
        return api.get(`tasks/${params.id}`);
      case 'request':
        return api.get(`requests/${params.id}`);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    return Promise.resolve([]);
  }
};