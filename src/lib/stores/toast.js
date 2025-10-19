import { writable } from 'svelte/store';

function createToastStore() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,

    show(message, type = 'error', duration = 5000) {
      const id = Math.random().toString(36).substr(2, 9);

      update(toasts => [...toasts, { id, message, type, duration, show: true }]);

      if (duration > 0) {
        setTimeout(() => {
          this.hide(id);
        }, duration);
      }

      return id;
    },

    hide(id) {
      update(toasts => toasts.map(toast =>
        toast.id === id ? { ...toast, show: false } : toast
      ));
      // remove after showing
      setTimeout(() => {
        update(toasts => toasts.filter(toast => toast.id !== id));
      }, 300);
    },

    error(message, duration = 5000) {
      return this.show(message, 'error', duration);
    },

    warning(message, duration = 5000) {
      return this.show(message, 'warning', duration);
    },

    success(message, duration = 3000) {
      return this.show(message, 'success', duration);
    },

    clear() {
      update(toasts => []);
    }
  };
}

export const toast = createToastStore();