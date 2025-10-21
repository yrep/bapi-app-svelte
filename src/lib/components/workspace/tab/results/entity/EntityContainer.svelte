<script>
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import JsonField from './field/JsonField.svelte';

  let { entity, entityType, expanded = false, onToggle } = $props();

  // Режимы отображения
  const VIEW_MODES = {
    NORMAL: 'normal',
    JSON: 'json'
  };

  let viewMode = $state(VIEW_MODES.NORMAL);
  const config = getEntityConfig(entityType);
  
  // Определяем поля для отображения
  let displayFields = $derived(
    expanded 
      ? Object.keys(config.fields || {})
      : (config.brief || ['id', 'name', 'email'])
  );

  function toggleViewMode() {
    viewMode = viewMode === VIEW_MODES.NORMAL ? VIEW_MODES.JSON : VIEW_MODES.NORMAL;
  }

  function handleUserSelect() {
    if (entityType === 'user') {
      workspaceStore.setSelectedUser(entity);
    }
  }

  function isSelectedUser() {
    return entityType === 'user' && 
           $workspaceStore.selectedUser && 
           $workspaceStore.selectedUser.id === entity.id;
  }
</script>

<div class="entity-container" class:expanded>
  <!-- Header с действиями -->
  <div class="entity-header">
    <div class="header-info">
      <h4>{config.displayName || entityType} - {entity.id}</h4>
      {#if expanded}
        <sl-badge variant="neutral">{Object.keys(entity).length} fields</sl-badge>
      {/if}
    </div>
    
    <div class="header-actions">
      <!-- Переключатель режимов -->
      <sl-tooltip content={viewMode === VIEW_MODES.NORMAL ? 'View as JSON' : 'View as fields'}>
        <sl-icon-button 
          name={viewMode === VIEW_MODES.NORMAL ? 'code' : 'list'}
          label="Toggle view mode"
          on:click={toggleViewMode}
        ></sl-icon-button>
      </sl-tooltip>

      <!-- Кнопка расширения/свертывания -->
      <sl-tooltip content={expanded ? 'Collapse' : 'Expand'}>
        <sl-icon-button 
          name={expanded ? 'chevron-up' : 'chevron-down'}
          label={expanded ? 'Collapse' : 'Expand'}
          on:click={onToggle}
        ></sl-icon-button>
      </sl-tooltip>

      <!-- Кнопка Select для пользователей -->
      {#if entityType === 'user'}
        <sl-button 
          size="small"
          variant={isSelectedUser() ? 'primary' : 'default'}
          on:click={handleUserSelect}
        >
          {isSelectedUser() ? 'Selected' : 'Select'}
        </sl-button>
      {/if}
    </div>
  </div>
  
  <!-- Контент -->
  <div class="entity-content">
    {#if viewMode === VIEW_MODES.NORMAL}
      <!-- Обычный режим - поля -->
      <div class="entity-fields">
        {#each displayFields as fieldName}
          {#if entity[fieldName] !== undefined}
            <div class="field">
              <span class="field-name">{fieldName}:</span>
              <span class="field-value">
                {#if (fieldName === 'is_verified' || fieldName === 'enable') && (entity[fieldName] === '1' || entity[fieldName] === 1)}
                  <sl-icon name="check" style="color: var(--sl-color-success-600);"></sl-icon>
                {:else if fieldName === 'is_verified' || fieldName === 'enable'}
                  <sl-icon name="x" style="color: var(--sl-color-danger-600);"></sl-icon>
                {:else}
                  {String(entity[fieldName])}
                {/if}
              </span>
            </div>
          {/if}
        {/each}
      </div>

      {#if !expanded && Object.keys(entity).length > displayFields.length}
        <div class="more-fields-hint">
          ... and {Object.keys(entity).length - displayFields.length} more fields
        </div>
      {/if}
    {:else}
      <!-- JSON режим -->
      <div class="json-view">
        <JsonField value={entity} compact={!expanded} />
      </div>
    {/if}
  </div>
</div>

<style>
  .entity-container {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    padding: 1rem;
    background: white;
    transition: all 0.2s ease;
  }

  .entity-container:hover {
    border-color: var(--sl-color-neutral-300);
  }

  .entity-container.expanded {
    background: var(--sl-color-neutral-50);
    padding: 1.5rem;
  }

  .entity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .header-info h4 {
    margin: 0;
    color: var(--sl-color-neutral-800);
    font-size: 1rem;
    line-height: 1.4;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .entity-content {
    min-height: 20px;
  }

  .entity-fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .field-name {
    font-weight: 600;
    color: var(--sl-color-neutral-600);
    min-width: 120px;
    flex-shrink: 0;
  }

  .field-value {
    flex: 1;
    word-break: break-word;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .more-fields-hint {
    font-size: 0.75rem;
    color: var(--sl-color-neutral-500);
    font-style: italic;
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: var(--sl-color-neutral-100);
    border-radius: var(--sl-border-radius-small);
    text-align: center;
  }

  .json-view {
    margin-top: 0.5rem;
  }
</style>