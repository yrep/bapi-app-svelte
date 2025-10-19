import { API_BASE_URL } from '$lib/constants/config.js';

const X_API_KEY = process.env.X_API_KEY;
const REFERER = process.env.REFERER || 'https://bapi.developtech.ru';

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

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      return await response.json();

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