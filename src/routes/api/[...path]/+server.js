import { json } from '@sveltejs/kit';
import { DB } from '$lib/server/db.js';
import { ApiClient } from '$lib/server/api-client.js';
import { apiLogger } from '$lib/utils/logger.js';
import { setupTestUser, DEBUG, dlog } from '$lib/utils/debug.js';

export async function GET({ request, params, url, cookies }) {
  return handleProxyRequest('GET', params.path, request, url.searchParams, null, cookies);
}

export async function POST({ request, params, cookies }) {
  const body = await request.json().catch(() => ({}));
  return handleProxyRequest('POST', params.path, request, null, body, cookies);
}

async function handleProxyRequest(method, path, request, searchParams = null, body = null, cookies) {
  const fullPath = `/${path}`;
  const queryString = searchParams ? '?' + new URLSearchParams(searchParams).toString() : '';
  const fullUrl = `${method} ${fullPath}${queryString}`;
  
  dlog('🔍 PROXY START:', { method, path, fullPath, queryString, body });

  const sessionCode = cookies.get('session');
  dlog('🔑 Session code from cookies:', sessionCode);

  if (!sessionCode) {
    const errorResponse = { error: 'Authentication required' };
    console.error('❌ No session code found in cookies');
    apiLogger.logResponse('FRONT', method, fullUrl, 401, 'Unauthorized', errorResponse);
    return json(errorResponse, { status: 401 });
  }

  dlog('📋 Fetching session from DB...');
  const userSession = await DB.getSessionWithUser(sessionCode);
  dlog('👤 User session:', userSession);
  
  if (!userSession) {
    const errorResponse = { error: 'Invalid session' };
    console.error('❌ No user session found');
    apiLogger.logResponse('FRONT', method, fullUrl, 401, 'Unauthorized', errorResponse);
    return json(errorResponse, { status: 401 });
  }

  try {
    dlog('🚀 Creating ApiClient with settings:', userSession.settings);
    const apiClient = new ApiClient(userSession.settings);

    dlog('📤 Making request to backend...');
    const result = await apiClient.request(method, `${fullPath}${queryString}`, { body });

    dlog('✅ Backend response:', result);

    apiLogger.logResponse('FRONT', method, fullUrl, 200, 'OK', result);
    return json(result);
  } catch (error) {
     console.error('💥 PROXY ERROR:', error);
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      payload: error.payload,
      status: error.status 
    });

    const errorResponse = { 
      message: error.message,
      payload: error.payload || null,
      status: error.status || 500
    };

    const httpStatus = error.status || 500;
    
    apiLogger.logResponse('FRONT', method, fullUrl, httpStatus, 'Error', errorResponse);
    return json(errorResponse, { status: httpStatus });
  }
}