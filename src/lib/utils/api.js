import { DEBUG, dlog, setupTestUser } from '$lib/utils/debug.js';
import { get } from 'svelte/store';
import { workspaceStore } from '$lib/stores/workspace.js';

const API_BASE = '/api';

function getCurrentSelectedUser() {
  try {
    return get(workspaceStore).selectedUser;
  } catch (error) {
    console.warn('Cannot get selected user:', error);
    return null;
  }
}



export const authApi = {
  login: (userKey) => api.post('auth', { userKey }),
  logout: () => api.delete('auth'),
  check: () => api.get('auth'),
  refresh: () => api.post('auth/refresh', {})
};

// async function handleApiResponse(response) {
//   const responseClone = response.clone();
//   const responseText = await response.text();

//   console.log(`Response status: ${response.status}`);
//   console.log(`Response body: ${responseText}`);

//   if (!response.ok) {
//     let errorMessage = `API error ${response.status}`;

//     try {
//       const errorData = JSON.parse(responseText);
//       errorMessage = errorData.message || errorData.error || errorMessage;
//     } catch {
//       errorMessage = responseText || errorMessage;
//     }

//     throw new Error(errorMessage);
//   }

//   return JSON.parse(responseText);
// }


async function handleApiResponse(response) {
  const responseClone = response.clone();
  const responseText = await response.text();

  console.log(`Response status: ${response.status}`);
  console.log(`Response body: ${responseText}`);

  if (!response.ok) {
    let errorMessage = `API error ${response.status}`;
    let errorPayload = null;

    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorPayload = errorData;
    } catch {
      errorMessage = responseText || errorMessage;
      errorPayload = responseText;
    }

    const error = new Error(errorMessage);
    error.payload = errorPayload;
    error.status = response.status;
    throw error;
  }

  return JSON.parse(responseText);
}

export const api = {
request: async (method, path, data = null) => {
    const url = `${API_BASE}/${path}`;

    const selectedUser = getCurrentSelectedUser();

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify({
        ...data,
        meta: {
          user_id: selectedUser?.id || null
        }
      });
    }

    dlog('Request from api.js');
    dlog(url);
    dlog(options);

    try {
      const response = await fetch(url, options);
      return handleApiResponse(response);
    } catch (error) {

      if (error.payload) {
        throw error;
      }

      error.payload = { message: error.message };
      throw error;
    }
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
  list: () => api.get('brands/'),
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
  search: (params) => api.post('supervisor/vendorSearch', params),
  getById: (params) => api.post('supervisor/vendorSearch', params),
  //search: (uuid) => api.post(`vendors/getVendor?slug=${uuid}`),
  getByUuid: (uuid) => api.post(`vendors/getVendor?slug=${uuid}`),
};

export const bindsApi = {
  search: (params) => api.post('supervisor/bindSearch', params),
};

export const tasksApi = {
  search: (params) => api.post('supervisor/taskSearch', params),
};

export const requestsApi = {
  search: (params) => api.post('supervisor/requestSearch', params),
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