import { writable, derived } from 'svelte/store';
import { nanoid } from 'nanoid';

function createTabsStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    // addTab: (entityType, searchParams = {}, id = nanoid()) => {
    //   console.log('➕ Adding tab:', { id, entityType, searchParams });
    //   update(tabs => {
    //     const newTab = {
    //       id,
    //       entityType,
    //       searchParams,
    //       results: [],
    //       loading: false,
    //       error: null,
    //       offset: 0,
    //       hasMore: false
    //     };
        
    //     const updatedTabs = tabs.map(tab => ({ ...tab, active: false }));
    //     const newTabs = [...updatedTabs, { ...newTab, active: true }];
    //     console.log('📋 Tabs after add:', newTabs);
    //     return newTabs;
    //   });
    //   return id;
    // },
addTab: (entityType, searchParams = {}, id = nanoid()) => {
  console.log('➕ Adding tab:', { id, entityType, searchParams });
  
  return new Promise((resolve) => {
    update(tabs => {
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
      
      if (Object.keys(searchParams).length > 0) {
        setTimeout(() => resolve(id), 0);
      } else {
        resolve(id);
      }
      
      return newTabs;
    });
  });
},
    updateTab: (tabId, updates) => {
      console.log('🔄 Updating tab:', tabId, updates);
      update(tabs => {
        const newTabs = tabs.map(tab => 
          tab.id === tabId ? { ...tab, ...updates } : tab
        );
        console.log('📋 Tabs after update:', newTabs);
        return newTabs;
      });
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
      console.log('📥 Appending results to tab:', tabId, {
        newResultsCount: newResults.length,
        limit,
        currentResults: tabs.find(tab => tab.id === tabId)?.results?.length
      });
      
      update(tabs => tabs.map(tab => {
        if (tab.id === tabId) {
          console.log('🔍 Current tab before update:', {
            id: tab.id,
            entityType: tab.entityType,
            currentResults: tab.results.length,
            newResults: newResults.slice(0, 2) // Показываем только первые 2 для отладки
          });
          
          const updatedResults = [...tab.results, ...newResults];
          const updatedTab = {
            ...tab,
            results: updatedResults,
            offset: updatedResults.length,
            hasMore: newResults.length === limit
          };
          
          console.log('🔍 Updated tab:', {
            id: updatedTab.id,
            resultsCount: updatedTab.results.length,
            hasMore: updatedTab.hasMore,
            firstResult: updatedTab.results[0] ? { ...updatedTab.results[0] } : null
          });
          
          return updatedTab;
        }
        return tab;
      }));
    },
    clearAll: () => set([])
  };
}

export const tabsStore = createTabsStore();