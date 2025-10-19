<script>
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  
  export let entity;
  export let entityType;
  export let expanded = false;
  export let onToggle;

  const config = getEntityConfig(entityType);
  const displayFields = expanded ? Object.keys(config.fields) : config.brief;
</script>

<div class="entity-container" class:expanded on:click={onToggle}>
  {#each displayFields as fieldName}
    {#if config.fields[fieldName] && entity[fieldName] !== undefined}
      <div class="field">
        <span class="field-name">{fieldName}:</span>
        <span class="field-value">{String(entity[fieldName])}</span>
      </div>
    {/if}
  {/each}
</div>

<style>
  .entity-container {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    padding: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .entity-container:hover {
    background: var(--sl-color-neutral-50);
  }

  .entity-container.expanded {
    padding: 1rem;
  }

  .field {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .field-name {
    font-weight: 600;
    color: var(--sl-color-neutral-600);
    min-width: 80px;
    font-size: 0.875rem;
  }

  .field-value {
    flex: 1;
    word-break: break-word;
    font-size: 0.875rem;
  }
</style>