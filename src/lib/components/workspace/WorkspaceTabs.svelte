<script>
  import { onMount } from 'svelte';
  import { tabsStore } from '$lib/stores/tabs.js';

  let showAddMenu = false;

  const availableEntities = ['user', 'vendor', 'bind', 'task', 'request'];

  onMount(() => {
    console.log('WorkspaceTabs MOUNTED');
    console.log('Current tabs:', $tabsStore);
  });

  function handleTabClick(tabId) {
    console.log('Click tab:', tabId);
    tabsStore.setActiveTab(tabId);
  }

  function handleTabClose(tabId, event) {
    event.stopPropagation();
    console.log('Close tab:', tabId);
    tabsStore.removeTab(tabId);
  }

  function handleAddTab(entityType) {
    console.log('Add tab:', entityType);
    tabsStore.addTab(entityType, {});
    showAddMenu = false;
  }

  function getTabTitle(tab) {
    return tab.entityType || 'New Tab';
  }
</script>

<div class="tabs-container" style="background: red; border: 2px solid blue;">
  <div class="tabs-scroller" style="background: yellow;">
    <div style="color: black; padding: 10px;">
      DEBUG: Tabs count = {$tabsStore.length}
    </div>
    
    {#each $tabsStore as tab (tab.id)}
      <div 
        class="tab"
        class:tab-active={tab.active}
        on:click={() => handleTabClick(tab.id)}
        style="border: 1px solid green;"
      >
        <span class="tab-title">{getTabTitle(tab)}</span>
        <button on:click={(e) => handleTabClose(tab.id, e)}>X</button>
      </div>
    {/each}
    
    <div class="add-tab-container">
      <button on:click={() => showAddMenu = true}>+</button>
      
      {#if showAddMenu}
        <div class="add-menu" style="background: white; border: 1px solid black;">
          {#each availableEntities as entityType}
            <button on:click={() => handleAddTab(entityType)}>
              {entityType}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .tabs-container {
    background: white;
    border-bottom: 1px solid #ccc;
    overflow-x: auto;
    min-height: 50px;
  }

  .tabs-scroller {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    height: 50px;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    background: #f0f0f0;
    cursor: pointer;
    margin-right: 2px;
  }

  .tab-active {
    background: white;
    border-color: blue;
  }

  .tab-title {
    font-size: 0.875rem;
  }
</style>