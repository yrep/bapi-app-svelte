import { browser } from '$app/environment';

export const DEBUG = import.meta.env.VITE_DEBUG === 'true' || false;

export function dlog(...args) {
  if (DEBUG && browser) {
    console.log('🐛 DEBUG:', ...args);
  }
}

export function setupTestUser() {
  if (DEBUG && browser) {

    const testUser = {
      id: -1,
      email: 'test@debug.com',
      name: 'Debug User',
      crm_id: 'debug_crm_123'
    };

    localStorage.setItem('debugUser', JSON.stringify(testUser));

    dlog('Integrilla user setup:', testUser);
    return testUser;
  }
  return null;
}