import { API_BASE_URL } from '$lib/constants/config.js';
import { apiLogger } from '$lib/utils/logger.js';
import { X_API_KEY } from '$env/static/private';
import { createBapiResponse } from '$lib/utils/bapi-response.js';
import { AccessMiddleware } from './middleware.js';

const REFERER = process.env.REFERER || 'https://bapi.apitter.com';

export class ApiClient {
  constructor(userSettings) {

    console.log('ApiClient userSettings:', userSettings);
    console.log('userSettings type:', typeof userSettings);
    console.log('userSettings keys:', userSettings ? Object.keys(userSettings) : 'null');

    this.baseURL = API_BASE_URL;
    this.middleware = userSettings ? new AccessMiddleware(userSettings) : null;
  }

  async request(method, path, options = {}) {
    const url = `${this.baseURL}${path}`;

    console.log('🚀 API CLIENT REQUEST:', {
      method,
      fullUrl: url,
      baseURL: this.baseURL,
      path: path,
      body: options.body
    });

    const headers = {
      'X-Api-Key': X_API_KEY,
      'Referer': REFERER,
      'Content-Type': 'application/json',
      ...options.headers
    };

    apiLogger.logRequest('API', method, url, options.body, headers);

    if (this.middleware) {
      const validation = this.middleware.validateRequest(path, method, options.body);
      if (!validation.allowed) {
        throw new Error(validation.error || 'Access denied');
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const responseText = await response.text();
      let responseBody = null;

      try {
        responseBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseBody = responseText;
      }

      apiLogger.logResponse(
        'API',
        method,
        url,
        response.status,
        response.statusText,
        responseBody,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      const bapiResponse = createBapiResponse(responseBody);

      if (!bapiResponse.isOK()) {
        throw new Error(bapiResponse.getMessage() || 'API returned error');
      }

      if (bapiResponse.hasErrors()) {
        throw new Error(bapiResponse.getErrors().join(', '));
      }

      let data = bapiResponse.getData();
      console.log('Before get entity type');
      if (this.middleware) {
        const entityType = this.middleware.getEntityTypeFromPath(path);
        console.log('Entity type', entityType);
        data = this.middleware.filterResponse(data, entityType, method);

        if (data === null || (Array.isArray(data) && data.length === 0)) {
          throw new Error('Access denied: no permitted data found');
        }
      }

      return data;

    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(path, options = {}) {
    return this.request('GET', path, options);
  }

  async post(path, body, options = {}) {
    return this.request('POST', path, { ...options, body });
  }

  async put(path, body, options = {}) {
    return this.request('PUT', path, { ...options, body });
  }

  async delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }
}