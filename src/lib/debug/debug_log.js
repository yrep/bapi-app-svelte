import { browser } from '$app/environment';

export const DEBUG = browser ?
  (import.meta.env.VITE_DEBUG === 'true') :
  (process.env.DEBUG === 'true');

export function dlog(message, data = null) {
  if (DEBUG) {
    console.debug(`${message}`, data || '');
  }
}