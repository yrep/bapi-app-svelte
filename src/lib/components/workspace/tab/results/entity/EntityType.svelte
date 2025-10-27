<script>
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { setupTestUser, DEBUG, dlog } from '$lib/utils/debug.js';

  export let entities = [];
  export let entityType;
  export let loading = false;
  export let onLoadMore = null;

  function handleUserSelect(entity) {
    dlog('👤 User selected:', entity);
    if (entityType === 'user') {
      workspaceStore.setSelectedUser(entity);
    }
  }

  function isSelectedUser(entity) {
    return entityType === 'user' && 
          $workspaceStore.selectedUser && 
          $workspaceStore.selectedUser.id === entity.id;
  }

  function renderField(key, value) {
    if (key === 'is_verified' || key === 'enable') {
      return `
        <sl-icon name="${value === '1' ? 'check' : 'x'}" 
            style="color: ${value === '1' ? 'green' : 'red'};">
        </sl-icon>
      `;
    }
    return String(value);
  }
</script>

<div class="entity-list">
  {#if DEBUG}
    <div style="background: green; color: white; padding: 10px; margin-bottom: 10px;">
      ✅ WITH BOOL FIELDS: Showing {entities?.length || 0} entities of type {entityType}
    </div>
  {/if}

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
        <div class:entity-item--selected={isSelectedUser(entity)} class="entity-item">
          <div class="simple-entity">
            <h4>Entity: {entityType} - ID: {entity.id}</h4>
            {#each Object.entries(entity) as [key, value]}
              <div class="field">
                <strong>{key}:</strong> 
                <div class="field-value">
                  {#if key === 'is_verified' || key === 'enable'}
                    <sl-icon 
                      name={value === '1' ? 'check' : 'x'} 
                      style={value === '1' ? 'color: green;' : 'color: red;'}
                    ></sl-icon>
                    ({value})
                  {:else}
                    <span>{String(value)}</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
          
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

  .simple-entity {
    flex: 1;
  }

  .simple-entity h4 {
    margin: 0 0 0.5rem 0;
    color: var(--sl-color-neutral-800);
  }

  .field {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }

  .field strong {
    min-width: 120px;
    color: var(--sl-color-neutral-600);
  }

  .field-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .entity-actions {
    flex-shrink: 0;
  }

  .load-more-section {
    display: flex;
    justify-content: center;
  }
</style>