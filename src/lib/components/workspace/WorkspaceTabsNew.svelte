<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore, WORKSPACE_TYPES } from '$lib/stores/workspace.js';
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  import { derived } from 'svelte/store';

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

<div class="tabs-container">
  <div class="tabs-scroller">
    {#each $tabsStore as tab (tab.id)}
      <div 
        class:tab-active={tab.active}
        class="tab"
        on:click={() => handleTabClick(tab.id)}
      >
        <span class="tab-title">{getTabTitle(tab)}</span>
        <sl-icon-button
          name="x"
          label="Close tab"
          on:click={(e) => handleTabClose(tab.id, e)}
        ></sl-icon-button>
      </div>
    {/each}
    
    <div class="add-tab-container">
      <sl-icon-button
        name="plus"
        label="Add tab"
        on:click={() => showAddMenu = true}
      ></sl-icon-button>
      
      {#if showAddMenu}
        <div class="add-menu">
          {#each $availableEntities as entityType}
            <sl-button 
              variant="default" 
              size="small"
              on:click={() => handleAddTab(entityType)}
            >
              {entityType}
            </sl-button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .tabs-container {
    background: white;
    border-bottom: 1px solid var(--sl-color-neutral-200);
    overflow-x: auto;
  }

  .tabs-scroller {
    display: flex;
    align-items: center;
    min-width: min-content;
    padding: 0 0.5rem;
    height: 50px; /* Фиксированная высота для панели табов */
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--sl-color-neutral-200);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    background: var(--sl-color-neutral-100);
    cursor: pointer;
    white-space: nowrap;
    min-width: 120px;
    margin-right: 2px;
    height: 100%;
    box-sizing: border-box;
  }

  .tab-active {
    background: white;
    border-color: var(--sl-color-primary-500);
    margin-bottom: -1px;
  }

  .tab-title {
    font-size: 0.875rem;
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .add-tab-container {
    position: relative;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .add-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 120px;
    z-index: 100;
    box-shadow: var(--sl-shadow-medium);
  }
</style>