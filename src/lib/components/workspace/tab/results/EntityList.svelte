<script>
  import { workspaceStore } from '$lib/stores/workspace.js';
  import EntityContainer from './entity/EntityContainer.svelte';
  
  let {
    entities = [],
    entityType,
    loading = false,
    onLoadMore = null
  } = $props();

  let expandedEntities = $state(new Set());

  function toggleExpand(entityId) {
    expandedEntities = new Set(expandedEntities);
    if (expandedEntities.has(entityId)) {
      expandedEntities.delete(entityId);
    } else {
      expandedEntities.add(entityId);
    }
  }
  // function toggleExpand(entityId) {
  //   if (expandedEntities.has(entityId)) {
  //     expandedEntities.delete(entityId);
  //   } else {
  //     expandedEntities.add(entityId);
  //   }
  //   expandedEntities = new Set(expandedEntities);
  // }
</script>

<div class="entity-list">
  {#if loading && entities.length === 0}
    <div class="loading">
      <sl-spinner></sl-spinner>
      <span>Loading...</span>
    </div>
  {:else if entities.length === 0}
    <div class="empty-state">
      <sl-icon name="search"></sl-icon>
      <p>No data</p>
    </div>
  {:else}
    <div class="entities">
      {#each entities as entity (entity.id)}
        <div class:entity-item--selected={$workspaceStore.selectedUser?.id === entity.id} class="entity-item">
          <EntityContainer
            {entity}
            {entityType}
            expanded={expandedEntities.has(entity.id)}
            onToggle={() => toggleExpand(entity.id)}
          />
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
    gap: 1rem;
  }

  .entity-item {
    transition: all 0.2s ease;
  }

  .entity-item--selected {
    position: relative;
  }

  .entity-item--selected::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--sl-color-primary-500);
    border-radius: 2px;
  }

  .load-more-section {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>