import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { tabsStore } from './tabs';

const STORAGE_KEY = 'workspace-state';

export const WORKSPACE_TYPES = {
  binder: {
    name: 'Binder',
    initialEntity: 'user',
    availableEntities: ['user', 'vendor', 'bind', 'task', 'request'],
    settings: {
      saveTabChain: false,
      defaultLimit: 100
    }
  },
  otherType:{}
};

function createWorkspaceStore() {
  const { subscribe, set, update } = writable({
    currentWorkspace: null,
    workspaceType: 'binder',
    settings: WORKSPACE_TYPES.binder.settings
  });

  // Сохраняем состояние только если saveTabChain включен
  if (browser) {
    subscribe(state => {
      if (state.settings.saveTabChain) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          workspaceId: state.currentWorkspace?.id,
          workspaceType: state.workspaceType,
          settings: state.settings,
          tabChain: $tabsStore.map(tab => ({
            id: tab.id,
            entityType: tab.entityType,
            searchParams: tab.searchParams,
          }))
        }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  return {
    subscribe,
    setWorkspace: (workspace, type = 'binder') => {
      const workspaceConfig = WORKSPACE_TYPES[type] || WORKSPACE_TYPES.binder;
      
      update(state => ({
        ...state,
        currentWorkspace: workspace,
        workspaceType: type,
        settings: { ...workspaceConfig.settings, ...state.settings }
      }));

      // Создаем начальный таб для этого типа workspace
      if (workspaceConfig.initialEntity) {
        tabsStore.addTab(workspaceConfig.initialEntity, {});
      }
    },
    updateSettings: (newSettings) => {
      update(state => ({
        ...state,
        settings: { ...state.settings, ...newSettings }
      }));
    },
    restoreState: (workspaceId) => {
      if (!browser) return false;
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (state.workspaceId === workspaceId) {
            // Восстанавливаем цепочку табов
            state.tabChain.forEach(tabData => {
              tabsStore.addTab(tabData.entityType, tabData.searchParams, tabData.id);
            });
            return true;
          }
        } catch (e) {
          console.error('Failed to restore workspace state:', e);
        }
      }
      return false;
    }
  };
}

export const workspaceStore = createWorkspaceStore();