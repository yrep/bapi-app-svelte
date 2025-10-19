import { writable, derived } from 'svelte/store';
import { nanoid } from 'nanoid';

function createTabsStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    addTab: (entityType, searchParams = {}, id = nanoid()) => {
      update(tabs => {
        const newTab = {
          id,
          entityType,
          searchParams,
          results: [],
          loading: false,
          error: null,
          offset: 0,
          hasMore: false
        };
        
        // Делаем новую вкладку активной
        const updatedTabs = tabs.map(tab => ({ ...tab, active: false }));
        return [...updatedTabs, { ...newTab, active: true }];
      });
      return id;
    },
    removeTab: (tabId) => {
      update(tabs => {
        const filtered = tabs.filter(tab => tab.id !== tabId);
        // Если удалили активную вкладку, активируем последнюю
        if (filtered.length > 0 && !filtered.some(tab => tab.active)) {
          filtered[filtered.length - 1].active = true;
        }
        return filtered;
      });
    },
    updateTab: (tabId, updates) => {
      update(tabs => tabs.map(tab => 
        tab.id === tabId ? { ...tab, ...updates } : tab
      ));
    },
    updateSearchParams: (tabId, searchParams) => {
      update(tabs => tabs.map(tab => 
        tab.id === tabId ? { ...tab, searchParams, offset: 0, results: [] } : tab
      ));
    },
    setActiveTab: (tabId) => {
      update(tabs => tabs.map(tab => ({
        ...tab,
        active: tab.id === tabId
      })));
    },
    appendResults: (tabId, newResults, limit) => {
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
    },
    clearAll: () => set([])
  };
}

export const tabsStore = createTabsStore();