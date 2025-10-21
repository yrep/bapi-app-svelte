<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  
  export let value;
  export let fieldConfig;
  export let entityType;
  export let fieldName;
  export let entity;

  function handleFetch() {
    if (fieldConfig.fetchEntity && value) {
      // Создаем новый таб для связанной сущности
      tabsStore.addTab(fieldConfig.fetchEntity, { id: value });
    }
  }
</script>

<div class="entity-field">
  <span class="entity-value">{value}</span>
  {#if fieldConfig.fetchButton && fieldConfig.fetchEntity}
    <sl-icon-button
      name="arrow-right"
      label={`Open ${fieldConfig.fetchEntity}`}
      size="small"
      on:click={handleFetch}
    ></sl-icon-button>
  {/if}
</div>

<style>
  .entity-field {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .entity-value {
    flex: 1;
  }
</style>