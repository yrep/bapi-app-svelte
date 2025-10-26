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
  
  console.log('🔍 PROXY START:', { method, path, fullPath, queryString, body });
  
  apiLogger.logRequest('FRONT', method, fullUrl, body, Object.fromEntries(request.headers.entries()));

  // Детальная отладка cookies
  const cookies = request.headers.get('cookie');
  console.log('🍪 Raw cookies:', cookies);
  
  const sessionCode = cookies
    ?.split('; ')
    ?.find(row => row.startsWith('session='))
    ?.split('=')[1];

  console.log('🔑 Extracted session code:', sessionCode);

  let userSession = null;
  
  if (sessionCode) {
    console.log('📋 Fetching session from DB...');
    userSession = await DB.getSessionWithUser(sessionCode);
    console.log('👤 User session:', userSession);
    
    if (!userSession) {
      const errorResponse = { error: 'Invalid session' };
      console.log('❌ No user session found');
      apiLogger.logResponse('FRONT', method, fullUrl, 401, 'Unauthorized', errorResponse);
      return json(errorResponse, { status: 401 });
    }
  } else {
    const errorResponse = { error: 'Authentication required' };
    console.log('❌ No session code found in cookies');
    apiLogger.logResponse('FRONT', method, fullUrl, 401, 'Unauthorized', errorResponse);
    return json(errorResponse, { status: 401 });
  }

  try {
    console.log('🚀 Creating ApiClient with settings:', userSession.settings);
    const apiClient = new ApiClient(userSession.settings);
    
    console.log('📤 Making request to backend...');
    const result = await apiClient.request(method, `${fullPath}${queryString}`, { body });
    
    console.log('✅ Backend response:', result);

    apiLogger.logResponse('FRONT', method, fullUrl, 200, 'OK', result);
    return json(result);
  } catch (error) {
    console.error('💥 PROXY ERROR:', error);
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const errorResponse = { message: 'Internal Error' };
    apiLogger.logResponse('FRONT', method, fullUrl, 500, 'Internal Server Error', errorResponse);
    return json(errorResponse, { status: 500 });
  }
}