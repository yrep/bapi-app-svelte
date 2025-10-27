import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { tabsStore } from './tabs';
import { setupTestUser, DEBUG, dlog } from '$lib/utils/debug.js';

const STORAGE_KEY_PREFIX = 'workspace-state-';

export const WORKSPACE_TYPES = {
  binder: {
    name: 'Binder',
    initialEntity: 'user',
    availableEntities: ['user', 'vendor', 'bind', 'task', 'request'],
    settings: {
      saveTabChain: true,
      defaultLimit: 100
    }
  },
  otherType: {}
};

function createWorkspaceStore() {
  const { subscribe, set, update } = writable({
    currentWorkspace: null,
    workspaceType: 'binder',
    settings: WORKSPACE_TYPES.binder.settings,
    selectedUser: null
  });

  return {
    subscribe,
    
    setWorkspace: (workspace, type = 'binder') => {
      const workspaceConfig = WORKSPACE_TYPES[type] || WORKSPACE_TYPES.binder;

      tabsStore.clearAll();

      let restored = false;
      
      if (browser && workspace?.id) {
        const storageKey = `${STORAGE_KEY_PREFIX}${workspace.id}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
          try {
            const state = JSON.parse(saved);
            
            update(store => ({
              ...store,
              currentWorkspace: workspace,
              workspaceType: state.workspaceType || type,
              settings: state.settings || workspaceConfig.settings,
              selectedUser: state.selectedUser || null
            }));

            if (state.tabChain && state.tabChain.length > 0) {
              setTimeout(() => {
                state.tabChain.forEach(tabData => {
                  tabsStore.addTab(tabData.entityType, tabData.searchParams, tabData.id);
                });
              }, 50);
            }

            restored = true;
            dlog('✅ Restored workspace:', workspace.id, 'user:', state.selectedUser?.id);
            
          } catch (e) {
            console.error('Failed to restore workspace state:', e);
          }
        }
      }

      if (!restored) {
        update(state => ({
          ...state,
          currentWorkspace: workspace,
          workspaceType: type,
          settings: { ...workspaceConfig.settings, ...state.settings },
          selectedUser: null
        }));

        setTimeout(() => {
          let currentTabs = [];
          const unsubscribe = tabsStore.subscribe(tabs => { currentTabs = tabs; });
          unsubscribe();
          // check if user tab exists
          const userTabExists = currentTabs.some(tab => tab.entityType === 'user');
          if (!userTabExists) {
            tabsStore.addTab(workspaceConfig.initialEntity, {});
          }
        }, 0);

        dlog('🆕 Created new workspace:', workspace.id);
      }
    },

    updateSettings: (newSettings) => {
      update(state => ({
        ...state,
        settings: { ...state.settings, ...newSettings }
      }));
      this.saveCurrentWorkspace();
    },
    
    setSelectedUser: (userData) => {
      update(state => ({
        ...state,
        selectedUser: userData
      }));
      this.saveCurrentWorkspace();
    },
    
    clearSelectedUser: () => {
      update(state => ({
        ...state,
        selectedUser: null
      }));
      this.saveCurrentWorkspace();
    },
    
    saveCurrentWorkspace: () => {
      if (!browser) return;
      
      let currentState;
      const unsubscribe = subscribe(state => { currentState = state; });
      unsubscribe();
      
      if (currentState.currentWorkspace?.id && currentState.settings.saveTabChain) {
        const storageKey = `${STORAGE_KEY_PREFIX}${currentState.currentWorkspace.id}`;
        
        let currentTabs = [];
        const unsubscribeTabs = tabsStore.subscribe(tabs => { currentTabs = tabs; });
        unsubscribeTabs();
        
        const saveData = {
          workspaceId: currentState.currentWorkspace.id,
          workspaceType: currentState.workspaceType,
          settings: currentState.settings,
          selectedUser: currentState.selectedUser,
          tabChain: currentTabs.map(tab => ({
            id: tab.id,
            entityType: tab.entityType,
            searchParams: tab.searchParams,
            results: tab.results || [],
            loading: tab.loading || false,
            error: tab.error || null,
            offset: tab.offset || 0,
            hasMore: tab.hasMore || false,
            active: tab.active || false
          }))
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        dlog('💾 Saved workspace:', currentState.currentWorkspace.id, 'user:', currentState.selectedUser?.id, 'tabs:', currentTabs.length);
      }
    },
    
    restoreState: (workspaceId) => {
      if (!browser) return false;

      const storageKey = `${STORAGE_KEY_PREFIX}${workspaceId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const state = JSON.parse(saved);

          update(store => ({ 
            ...store, 
            currentWorkspace: { id: workspaceId },
            workspaceType: state.workspaceType,
            settings: state.settings,
            selectedUser: state.selectedUser
          }));

          if (state.tabChain && state.tabChain.length > 0) {
            setTimeout(() => {
              tabsStore.clearAll();
              state.tabChain.forEach(tabData => {
                tabsStore.addTab(tabData.entityType, tabData.searchParams, tabData.id);
              });
            }, 50);
          }

          dlog('✅ restoreState: Restored workspace:', workspaceId, 'user:', state.selectedUser?.id);
          return true;

        } catch (e) {
          console.error('Failed to restore workspace state:', e);
        }
      }
      return false;
    },

    clearWorkspaceState: (workspaceId) => {
      if (browser && workspaceId) {
        const storageKey = `${STORAGE_KEY_PREFIX}${workspaceId}`;
        localStorage.removeItem(storageKey);
        dlog('🗑️ Cleared workspace state:', workspaceId);
      }
    }
  };
}

export const workspaceStore = createWorkspaceStore();