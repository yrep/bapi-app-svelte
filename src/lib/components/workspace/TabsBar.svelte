<script>
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { setupTestUser, DEBUG, dlog } from '$lib/utils/debug.js';

  let tabsContainer;
  let scrollableArea;
  let addMenuElement;
  let plusButtonElement;
  
  let showAddMenu = $state(false);
  
  const availableEntities = ['user', 'vendor', 'bind', 'task', 'request']; //del later

  const entityStates = derived(tabsStore, $tabs => {
    const hasUserTab = $tabs.some(tab => tab.entityType === 'user');
    
    return availableEntities.map(entity => ({
      type: entity,
      disabled: entity === 'user' && hasUserTab
    }));
  });

  onMount(() => {
    dlog('TabsBar mounted');
    dlog('Current tabs:', $tabsStore);

    const handleClickOutside = (event) => {
      const clickedInsideMenu = addMenuElement && addMenuElement.contains(event.target);
      const clickedOnPlus = plusButtonElement && plusButtonElement.contains(event.target);

      if (showAddMenu && !clickedInsideMenu && !clickedOnPlus) {
        showAddMenu = false;
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  });

  function handleTabClick(tabId) {
    tabsStore.setActiveTab(tabId);
  }

  function handleTabClose(tabId, event) {
    event.stopPropagation();
    event.preventDefault();
    tabsStore.removeTab(tabId);
  }

  function handleAddTab(entityType) {
    if (entityType === 'user') {
      const existingUserTab = $tabsStore.find(tab => tab.entityType === 'user');
      if (existingUserTab) {
        tabsStore.setActiveTab(existingUserTab.id);
        showAddMenu = false;
        return;
      }
    }
    
    dlog('Adding tab:', entityType);
    tabsStore.addTab(entityType, {});
    showAddMenu = false;
    
    setTimeout(() => {
      if (tabsContainer) {
        tabsContainer.scrollLeft = tabsContainer.scrollWidth;
      }
    }, 100);
  }

  function getTabTitle(tab) {
    return tab.entityType || 'New Tab';
  }

  function handlePlusClick(event) {
    event.stopPropagation();
    showAddMenu = !showAddMenu;
  }
</script>

<div class="tabs-bar">
  <div class="tabs-container" bind:this={tabsContainer}>
    <div class="tabs-scroller" bind:this={scrollableArea}>
      {#each $tabsStore as tab (tab.id)}
        <div 
          class="tab {tab.active ? 'tab--active' : ''}"
          on:click={() => handleTabClick(tab.id)}
        >
          <span class="tab__title">{getTabTitle(tab)}</span>
          <button 
            class="tab__close"
            on:click|preventDefault={(e) => handleTabClose(tab.id, e)}
            on:mousedown|preventDefault
          >
            <sl-icon name="x" label="Close tab"></sl-icon>
          </button>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="add-tab">
    <sl-icon-button
      name="plus"
      label="Add tab"
      on:click={handlePlusClick}
      bind:this={plusButtonElement}
    ></sl-icon-button>
    
    {#if showAddMenu}
      <div class="add-menu" bind:this={addMenuElement}>
        {#each $entityStates as entity}
          <sl-button 
            variant="default" 
            size="small"
            on:click={() => handleAddTab(entity.type)}
            disabled={entity.disabled}
          >
            {#if entity.type === 'user' && entity.disabled}
              user (already open)
            {:else}
              {entity.type}
            {/if}
          </sl-button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .tabs-bar {
    display: flex;
    align-items: center;
    background: var(--sl-color-neutral-0);
    border-bottom: 1px solid var(--sl-color-neutral-200);
    min-height: 3rem;
    padding: 0 0.5rem;
    gap: 0.5rem;
  }

  .tabs-container {
    flex: 1;
    overflow-x: auto;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .tabs-container::-webkit-scrollbar {
    height: 4px;
  }

  .tabs-container::-webkit-scrollbar-track {
    background: var(--sl-color-neutral-100);
  }

  .tabs-container::-webkit-scrollbar-thumb {
    background: var(--sl-color-neutral-300);
    border-radius: 2px;
  }

  .tabs-scroller {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: min-content;
    padding: 0.5rem 0;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--sl-color-neutral-100);
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    cursor: pointer;
    white-space: nowrap;
    min-width: 120px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .tab:hover {
    background: var(--sl-color-neutral-200);
  }

  .tab--active {
    background: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-500);
    color: var(--sl-color-primary-700);
  }

  .tab__title {
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-medium);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab__close {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-small);
    padding: 0.25rem;
    cursor: pointer;
    color: var(--sl-color-neutral-500);
    transition: all 0.2s ease;
  }

  .tab__close:hover {
    background: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-700);
  }

  .add-tab {
    position: relative;
    flex-shrink: 0;
  }

  .add-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--sl-color-neutral-0);
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