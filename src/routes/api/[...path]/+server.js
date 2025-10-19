import { json } from '@sveltejs/kit';
import { DB } from '$lib/server/db.js';
import { ApiClient } from '$lib/server/api-client.js';

export async function GET({ request, params, url }) {
  return handleProxyRequest('GET', params.path, request, url.searchParams);
}

export async function POST({ request, params }) {
  const body = await request.json().catch(() => ({}));
  return handleProxyRequest('POST', params.path, request, null, body);
}

async function handleProxyRequest(method, path, request, searchParams = null, body = null) {
  try {
    const sessionCode = request.headers.get('cookie')
      ?.split('; ')
      ?.find(row => row.startsWith('session='))
      ?.split('=')[1];

    let userSession = null;

    if (sessionCode) {
      userSession = await DB.getSession(sessionCode);

      if (!userSession) {
        return json({ error: 'Invalid session' }, { status: 401 });
      }
    } else {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const apiClient = new ApiClient();

    let queryString = '';
    if (searchParams) {
      queryString = '?' + new URLSearchParams(searchParams).toString();
    }

    const result = await apiClient.request(
      method,
      `/${path}${queryString}`,
      { body }
    );

    return json(result);

  } catch (error) {
    console.error('Proxy API error:', error);

    return json({
      error: true,
      message: error.message || 'API request failed',
      code: error.message.includes('X_API_KEY') ? 'API_NOT_CONFIGURED' : 'API_ERROR'
    }, { status: 200 });
  }
}