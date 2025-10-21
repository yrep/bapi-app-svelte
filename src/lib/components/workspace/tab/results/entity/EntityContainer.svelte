<script>
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  
  export let entity;
  export let entityType;
  export let expanded = false;
  export let onToggle;

  const config = getEntityConfig(entityType);
  
  // Определяем поля для отображения
  $: displayFields = expanded ? 
    Object.keys(config.fields || {}) : 
    (config.brief || ['id', 'name', 'email']);

  // Отладка
  $: console.log('🟢 EntityContainer DATA:', { 
    entityType,
    entity,
    displayFields,
    expanded 
  });
</script>

<div class="entity-container" class:expanded on:click={onToggle}>
  <div class="entity-header">
    <h4>{config.displayName || entityType} - {entity.id}</h4>
    <sl-icon 
      name={expanded ? 'chevron-down' : 'chevron-right'} 
      class="expand-icon"
    ></sl-icon>
  </div>
  
  <div class="entity-fields">
    {#each displayFields as fieldName}
      {#if entity[fieldName] !== undefined}
        <div class="field">
          <span class="field-name">{fieldName}:</span>
          <span class="field-value">
            {#if (fieldName === 'is_verified' || fieldName === 'enable') && (entity[fieldName] === '1' || entity[fieldName] === 1)}
              <sl-icon name="check" style="color: green;"></sl-icon>
            {:else if fieldName === 'is_verified' || fieldName === 'enable'}
              <sl-icon name="x" style="color: red;"></sl-icon>
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
</div>

<style>
  .entity-container {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    padding: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .entity-container:hover {
    background: var(--sl-color-neutral-50);
  }

  .entity-container.expanded {
    background: var(--sl-color-neutral-50);
    padding: 1.5rem;
  }

  .entity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .entity-header h4 {
    margin: 0;
    color: var(--sl-color-neutral-800);
    font-size: 1rem;
  }

  .expand-icon {
    color: var(--sl-color-neutral-500);
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
    margin-top: 0.5rem;
  }
</style>