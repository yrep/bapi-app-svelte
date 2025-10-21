<script>
  import { writable, derived } from 'svelte/store';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import EntityContainer from './entity/EntityContainer.svelte';

  export let entities = [];
  export let entityType;
  export let loading = false;
  export let onLoadMore = null;

  let filterText = '';
  let expandedEntities = new Set();

  const filteredEntities = derived(
    [writable(entities), writable(filterText)],
    ([$entities, $filterText]) => {
      if (!$filterText) return $entities;

      const searchTerm = $filterText.toLowerCase();
      return $entities.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }
  );

  function toggleExpand(entityId) {
    if (expandedEntities.has(entityId)) {
      expandedEntities.delete(entityId);
    } else {
      expandedEntities.add(entityId);
    }
    expandedEntities = expandedEntities;
  }

  // ← ДОБАВИТЬ ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЕМ
  function handleUserSelect(entity) {
    if (entityType === 'user') {
      workspaceStore.setSelectedUser(entity);
    }
  }

  function isSelectedUser(entity) {
    return entityType === 'user' && 
           $workspaceStore.selectedUser && 
           $workspaceStore.selectedUser.id === entity.id;
  }
</script>

<div class="entity-list">
  <div class="filter-section">
    <sl-input
      placeholder="Filter results..."
      value={filterText}
      on:sl-input={(e) => filterText = e.target.value}
      clearable
    >
      <sl-icon name="search" slot="prefix"></sl-icon>
    </sl-input>
  </div>

  {#if loading && entities.length === 0}
    <div class="loading">
      <sl-spinner></sl-spinner>
      <span>Loading...</span>
    </div>
  {:else if filteredEntities.length === 0}
    <div class="empty-state">
      <sl-icon name="search"></sl-icon>
      <p>{filterText ? 'No matching results' : 'No data'}</p>
    </div>
  {:else}
    <div class="entities">
      {#each filteredEntities as entity (entity.id)}
        <div class:entity-item--selected={isSelectedUser(entity)} class="entity-item">
          <EntityContainer
            {entity}
            {entityType}
            expanded={expandedEntities.has(entity.id)}
            onToggle={() => toggleExpand(entity.id)}
          />
          
          {#if entityType === 'user'}
            <div class="entity-actions">
              <sl-button 
                size="small" 
                variant={isSelectedUser(entity) ? 'primary' : 'default'}
                on:click={() => handleUserSelect(entity)}
              >
                {isSelectedUser(entity) ? 'Selected' : 'Select'}
              </sl-button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if onLoadMore}
    <div class="load-more-section">
      <sl-button variant="default" on:click={onLoadMore} loading={loading}>
        Load more...
      </sl-button>
    </div>
  {/if}
</div>

<style>
  .entity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    justify-content: center;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
  }

  .entities {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .entity-item {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .entity-item--selected {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-50);
  }

  .entity-actions {
    flex-shrink: 0;
  }

  .load-more-section {
    display: flex;
    justify-content: center;
  }
</style>