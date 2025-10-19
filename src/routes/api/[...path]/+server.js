import { json } from '@sveltejs/kit';
import { DB } from '$lib/server/db.js';
import { ApiClient } from '$lib/server/api-client.js';
import { apiLogger } from '$lib/utils/logger.js';

export async function GET({ request, params, url }) {
  return handleProxyRequest('GET', params.path, request, url.searchParams);
}

export async function POST({ request, params }) {
  const body = await request.json().catch(() => ({}));
  return handleProxyRequest('POST', params.path, request, null, body);
}

async function handleProxyRequest(method, path, request, searchParams = null, body = null) {
  const fullPath = `/${path}`;
  const queryString = searchParams ? '?' + new URLSearchParams(searchParams).toString() : '';
  const fullUrl = `${method} ${fullPath}${queryString}`;
  
  apiLogger.logRequest('FRONT', method, fullUrl, body, Object.fromEntries(request.headers.entries()));

  const sessionCode = request.headers.get('cookie')
    ?.split('; ')
    ?.find(row => row.startsWith('session='))
    ?.split('=')[1];

  let userSession = null;
  
  if (sessionCode) {
    userSession = await DB.getSession(sessionCode);
    if (!userSession) {
      const errorResponse = { error: 'Invalid session' };
      apiLogger.logResponse('FRONT', method, fullUrl, 401, 'Unauthorized', errorResponse);
      return json(errorResponse, { status: 401 });
    }
  } else {
    const errorResponse = { error: 'Authentication required' };
    apiLogger.logResponse('FRONT', method, fullUrl, 401, 'Unauthorized', errorResponse);
    return json(errorResponse, { status: 401 });
  }

  const apiClient = new ApiClient();
  const result = await apiClient.request(method, `${fullPath}${queryString}`, { body });

  apiLogger.logResponse('FRONT', method, fullUrl, 200, 'OK', result);
  return json(result);
}