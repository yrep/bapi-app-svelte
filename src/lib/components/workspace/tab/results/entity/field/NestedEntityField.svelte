<script>
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  import JsonField from './JsonField.svelte';
  import { toast } from '$lib/stores/toast.js';
  
  import TextField from './TextField.svelte';
  import NumberField from './NumberField.svelte';
  import BoolFieldIcon from './BoolFieldIcon.svelte';
  import EntityField from './EntityField.svelte';
  import EntityContainer from '../EntityContainer.svelte';

  let { entity, entityType, nested = true } = $props();

  const config = getEntityConfig(entityType);

  function copyFieldValue(value, fieldName) {
    navigator.clipboard.writeText(String(value)).then(() => {
      toast.success(`Copied ${fieldName}`);
    });
  }
</script>

<div class="nested-entity-container">
  <div class="nested-header">
    <span class="nested-title">{config.displayName || entityType} - {entity.id}</span>
  </div>
  
  <div class="entity-fields">
    {#each Object.keys(config.fields || {}) as fieldName}
      {#if entity[fieldName] !== undefined}
        <div class="field">
          <span class="field-name">{fieldName}:</span>
          <div class="field-value-container field-value--copyable">
            {#if config.fields[fieldName]?.component === 'EntityContainer' && typeof entity[fieldName] === 'object' && entity[fieldName] !== null}
              <NestedEntityField
                entity={entity[fieldName]}
                entityType={config.fields[fieldName]?.entityType || detectEntityType(fieldName)}
                nested={true}
              />
            {:else if config.fields[fieldName]?.component === 'BoolFieldIcon'}
              <div class="field-value--copyable" on:click={() => copyFieldValue(entity[fieldName], fieldName)}>
                <BoolFieldIcon value={entity[fieldName]} />
              </div>
            {:else if config.fields[fieldName]?.component === 'TextField'}
              <div class="field-value--copyable" on:click={() => copyFieldValue(entity[fieldName], fieldName)}>
                <TextField value={entity[fieldName]} />
              </div>
            {:else if config.fields[fieldName]?.component === 'NumberField'}
              <div class="field-value--copyable" on:click={() => copyFieldValue(entity[fieldName], fieldName)}>
                <NumberField value={entity[fieldName]} />
              </div>
            {:else if config.fields[fieldName]?.component === 'EntityField'}
              <div class="field-value--copyable" on:click={() => copyFieldValue(entity[fieldName], fieldName)}>
                <EntityField 
                  value={entity[fieldName]} 
                  fieldConfig={config.fields[fieldName]}
                  fieldName={fieldName}
                />
              </div>
            {:else if config.fields[fieldName]?.component === 'JsonField'}
              <JsonField value={entity[fieldName]
              } />
            {:else}
              <span 
                class="field-value field-value--copyable" 
                on:click={() => copyFieldValue(entity[fieldName], fieldName)}
              >
                {String(entity[fieldName])}
                <sl-icon name="clipboard" class="copy-icon"></sl-icon>
              </span>
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
.nested-entity-container {
  background: var(--sl-color-neutral-50);
  border: 1px solid var(--sl-color-neutral-300);
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: var(--sl-border-radius-small);
}

.nested-header {
  margin-bottom: 0.5rem;
}

.nested-title {
  font-weight: 600;
  color: var(--sl-color-neutral-700);
  font-size: 0.875rem;
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

.field-value-container {
  flex: 1;
  min-width: 0;
}

.field-value {
  position: relative;
  transition: background-color 0.2s ease;
}

.field-value--copyable {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.field-value--copyable:hover {
  background-color: var(--sl-color-primary-100);
}

.copy-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 0.8rem;
  color: var(--sl-color-neutral-500);
}

.field-value--copyable:hover .copy-icon {
  opacity: 1;
}
</style>