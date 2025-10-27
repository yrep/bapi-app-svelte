import { writable } from 'svelte/store';
import { nanoid } from 'nanoid';
import { workspaceStore } from './workspace.js';
import { setupTestUser, DEBUG, dlog } from '$lib/utils/debug.js';

function createTabsStore() {
  const { subscribe, set, update } = writable([]);

  const saveWorkspace = () => {
    setTimeout(() => {
      workspaceStore.saveCurrentWorkspace();
    }, 0);
  };

  return {
    subscribe,
    
    addTab: (entityType, searchParams = {}, id = nanoid()) => {
      dlog('➕ Adding tab:', { id, entityType, searchParams });
      
      let tabId = id;
      update(tabs => {
        const existingTab = tabs.find(tab => tab.id === id);
        if (existingTab) {
          dlog('⚠️ Tab already exists, skipping:', id);
          tabId = existingTab.id;
          return tabs;
        }

        const newTab = {
          id,
          entityType,
          searchParams,
          results: [],
          loading: Object.keys(searchParams).length > 0,
          error: null,
          offset: 0,
          hasMore: false
        };
        
        const updatedTabs = tabs.map(tab => ({ ...tab, active: false }));
        const newTabs = [...updatedTabs, { ...newTab, active: true }];
        
        return newTabs;
      });
      
      saveWorkspace();
      return tabId;
    },
    
    updateTab: (tabId, updates) => {
      dlog('🔄 Updating tab:', tabId, updates);
      update(tabs => {
        const newTabs = tabs.map(tab => 
          tab.id === tabId ? { ...tab, ...updates } : tab
        );
        return newTabs;
      });
      saveWorkspace();
    },
    
    removeTab: (tabId) => {
      update(tabs => {
        const filtered = tabs.filter(tab => tab.id !== tabId);
        if (filtered.length > 0 && !filtered.some(tab => tab.active)) {
          filtered[filtered.length - 1].active = true;
        }
        return filtered;
      });
      saveWorkspace();
    },
    
    updateSearchParams: (tabId, searchParams) => {
      update(tabs => tabs.map(tab => 
        tab.id === tabId ? { ...tab, searchParams, offset: 0, results: [] } : tab
      ));
      saveWorkspace();
    },
    
    setActiveTab: (tabId) => {
      update(tabs => tabs.map(tab => ({
        ...tab,
        active: tab.id === tabId
      })));
      saveWorkspace();
    },
    
    appendResults: (tabId, newResults, limit) => {
      dlog('📥 Appending results to tab:', tabId, {
        newResultsCount: newResults.length,
        limit
      });
      
      update(tabs => tabs.map(tab => {
        if (tab.id === tabId) {
          const updatedResults = [...tab.results, ...newResults];
          return {
            ...tab,
            results: updatedResults,
            offset: updatedResults.length,
            hasMore: newResults.length === limit
          };
        }
        return tab;
      }));
      saveWorkspace();
    },
    
    clearAll: () => {
      set([]);
      saveWorkspace();
    }
  };
}

export const tabsStore = createTabsStore();