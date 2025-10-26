<script>
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import JsonField from './field/JsonField.svelte';
  import { toast } from '$lib/stores/toast.js';
  
  import TextField from './field/TextField.svelte';
  import NumberField from './field/NumberField.svelte';
  import BoolFieldIcon from './field/BoolFieldIcon.svelte';
  import EntityField from './field/EntityField.svelte';
  import NestedEntityField from './field/NestedEntityField.svelte';

  let { entity, entityType, expanded = false, onToggle, nested = false } = $props();

  const VIEW_MODES = { NORMAL: 'normal', JSON: 'json' };
  let viewMode = $state(VIEW_MODES.NORMAL);
  const config = getEntityConfig(entityType);
  
  let displayFields = $derived(
    expanded 
      ? Object.keys(config.fields || {})
      : (config.brief || ['id', 'name', 'email'])
  );

  function detectEntityType(fieldName) {
    if (fieldName.includes('vendor')) return 'vendor';
    if (fieldName.includes('user')) return 'user';
    if (fieldName.includes('bind')) return 'bind';
    return 'vendor';
  }

  function toggleViewMode() {
    viewMode = viewMode === VIEW_MODES.NORMAL ? VIEW_MODES.JSON : VIEW_MODES.NORMAL;
  }

  function handleUserSelect() {
    if (entityType === 'user') {
      workspaceStore.setSelectedUser(entity);
    }
  }

  function isSelectedUser() {
    return entityType === 'user' && $workspaceStore.selectedUser?.id === entity.id;
  }

  function copyFieldValue(value, fieldName) {
    navigator.clipboard.writeText(String(value)).then(() => {
      toast.success(`Copied ${fieldName}`);
    });
  }
</script>

<div class="entity-container" class:expanded class:nested>
  {#if !nested}
    <div class="entity-header">
      <div class="header-info">
        <h4>{config.displayName || entityType} - {entity.id}</h4>
        {#if expanded}
          <sl-badge variant="neutral">{Object.keys(entity).length} fields</sl-badge>
        {/if}
      </div>
      
      <div class="header-actions">
        <sl-tooltip content={viewMode === VIEW_MODES.NORMAL ? 'View as JSON' : 'View as fields'}>
          <sl-icon-button 
            name={viewMode === VIEW_MODES.NORMAL ? 'code' : 'list'}
            on:click={toggleViewMode}
          ></sl-icon-button>
        </sl-tooltip>

        <sl-tooltip content={expanded ? 'Collapse' : 'Expand'}>
          <sl-icon-button 
            name={expanded ? 'chevron-up' : 'chevron-down'}
            on:click={onToggle}
          ></sl-icon-button>
        </sl-tooltip>

        {#if entityType === 'user'}
          <sl-button 
            size="small"
            variant={isSelectedUser() ? 'primary' : 'default'}
            on:click={handleUserSelect}
          >
            {isSelectedUser() ? 'Selected' : 'Select'}
          </sl-button>
        {/if}

        {#if entityType === 'task'}
          <sl-button 
            size="small"
            variant="default"
            on:click={() => {
              import('$lib/stores/tabs.js').then(({ tabsStore }) => {
                tabsStore.addTab('request', { task_id: entity.id });
              });
            }}
          >
            <sl-icon slot="prefix" name="link"></sl-icon>
            Requests
          </sl-button>
        {/if}

      </div>
    </div>
  {:else}
    <div class="nested-header">
      <span class="nested-title">{config.displayName || entityType} - {entity.id}</span>
    </div>
  {/if}
  
  <div class="entity-content">
    {#if viewMode === VIEW_MODES.NORMAL}
      <div class="entity-fields">
        {#each displayFields as fieldName}
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

      {#if !expanded && Object.keys(entity).length > displayFields.length && !nested}
        <div class="more-fields-hint" on:click={onToggle}>
          ... and {Object.keys(entity).length - displayFields.length} more fields
        </div>
      {/if}
    {:else}
      <div class="json-view">
        <JsonField value={entity} compact={!expanded} />
      </div>
    {/if}
  </div>
</div>

<style>
  .field-value-container { flex: 1; min-width: 0; }
  .field-value { position: relative; transition: background-color 0.2s ease; }
  .field-value--copyable { 
    cursor: pointer; padding: 2px 4px; border-radius: 3px; 
    display: inline-flex; align-items: center; gap: 0.5rem; 
  }
  .field-value--copyable:hover { background-color: var(--sl-color-primary-100); }
  .copy-icon { opacity: 0; transition: opacity 0.2s ease; font-size: 0.8rem; color: var(--sl-color-neutral-500); }
  .field-value--copyable:hover .copy-icon { opacity: 1; }
  .entity-container { border: 1px solid var(--sl-color-neutral-200); border-radius: var(--sl-border-radius-medium); padding: 1rem; background: white; transition: all 0.2s ease; }
  .entity-container:hover { border-color: var(--sl-color-neutral-300); }
  .entity-container.expanded { background: var(--sl-color-neutral-50); padding: 1.5rem; }
  .entity-container.nested { background: var(--sl-color-neutral-50); border: 1px solid var(--sl-color-neutral-300); padding: 0.75rem; margin: 0.25rem 0; }
  .nested-header { margin-bottom: 0.5rem; }
  .nested-title { font-weight: 600; color: var(--sl-color-neutral-700); font-size: 0.875rem; }
  .entity-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; }
  .header-info { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
  .header-info h4 { margin: 0; color: var(--sl-color-neutral-800); font-size: 1rem; line-height: 1.4; }
  .header-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
  .entity-content { min-height: 20px; }
  .entity-fields { display: flex; flex-direction: column; gap: 0.5rem; }
  .field { display: flex; gap: 1rem; font-size: 0.875rem; line-height: 1.4; }
  .field-name { font-weight: 600; color: var(--sl-color-neutral-600); min-width: 120px; flex-shrink: 0; }
  .more-fields-hint { font-size: 0.75rem; color: var(--sl-color-neutral-500); font-style: italic; margin-top: 0.75rem; padding: 0.5rem; background: var(--sl-color-neutral-100); border-radius: var(--sl-border-radius-small); text-align: center; cursor: pointer; }
  .json-view { margin-top: 0.5rem; }
</style>