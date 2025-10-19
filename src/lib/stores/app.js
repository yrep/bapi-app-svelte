import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';


export const DEBUG = writable(browser ? 
  (import.meta.env.VITE_DEBUG === 'true') : 
  (process.env.DEBUG === 'true')
);

const persistentStore = (key, initialValue) => {
  if (!browser) return writable(initialValue);

  const stored = localStorage.getItem(key);
  const value = stored ? JSON.parse(stored) : initialValue;
  const store = writable(value);

  store.subscribe(value => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return store;
};

export const user = writable(null);
export const isAuthenticated = writable(false);
export const workspaces = persistentStore('workspaces', []);
export const isLoading = writable(false);
export const apiStatus = writable({
  configured: true,
  available: true,
  lastError: null
});

export const userRole = derived(user, $user => $user?.role || null);
export const canDeleteWorkspaces = derived(userRole, $role =>
  ['admin', 'support_engineer'].includes($role)
);
export const isApiAvailable = derived(apiStatus, $status => $status.available);

export const apiActions = {
  setError: (error) => {
    apiStatus.update(status => ({
      ...status,
      configured: !error?.message?.includes('X_API_KEY'),
      available: false,
      lastError: error?.message
    }));
  },

  setAvailable: () => {
    apiStatus.update(status => ({
      ...status,
      configured: true,
      available: true,
      lastError: null
    }));
  },

  reset: () => {
    apiStatus.set({
      configured: true,
      available: true,
      lastError: null
    });
  }
};

export async function checkAuth() {
  if (!browser) return false;

  try {
    const response = await fetch('/api/auth');
    if (response.ok) {
      const data = await response.json();
      user.set(data.user);
      isAuthenticated.set(true);
      apiActions.setAvailable();
      return true;
    } else {
      user.set(null);
      isAuthenticated.set(false);
      return false;
    }
  } catch (error) {
    user.set(null);
    isAuthenticated.set(false);
    apiActions.setError(error);
    return false;
  }
}