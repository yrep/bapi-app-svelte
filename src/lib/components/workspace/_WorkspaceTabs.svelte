<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore, WORKSPACE_TYPES } from '$lib/stores/workspace.js';
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  import { derived } from 'svelte/store';

  let tabsContainer;
  let showAddMenu = false;
  
  const availableEntities = derived(workspaceStore, $ws => 
    WORKSPACE_TYPES[$ws.workspaceType]?.availableEntities || []
  );

  function handleTabClick(tabId) {
    tabsStore.setActiveTab(tabId);
  }

  function handleTabClose(tabId, event) {
    event.stopPropagation();
    tabsStore.removeTab(tabId);
  }

  function handleAddTab(entityType) {
    tabsStore.addTab(entityType, {});
    showAddMenu = false;
  }

  function getTabTitle(tab) {
    const config = getEntityConfig(tab.entityType);
    const hasParams = Object.keys(tab.searchParams).length > 0;
    
    if (hasParams && tab.searchParams.id) {
      return `${tab.entityType}: ${tab.searchParams.id}`;
    }
    
    return `${tab.entityType}${hasParams ? ' (search)' : ''}`;
  }
</script>