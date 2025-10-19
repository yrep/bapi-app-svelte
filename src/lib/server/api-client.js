import { API_BASE_URL } from '$lib/constants/config.js';
import { apiLogger } from '$lib/utils/logger.js';

const X_API_KEY = process.env.X_API_KEY;
const REFERER = process.env.REFERER || 'https://bapi.apitter.com';

export class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(method, path, options = {}) {
    const url = `${this.baseURL}${path}`;
    const headers = {
      'X-Api-Key': X_API_KEY,
      'Referer': REFERER,
      'Content-Type': 'application/json',
      ...options.headers
    };

    apiLogger.logRequest('API', method, url, options.body, headers);

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

      return responseBody;

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
}