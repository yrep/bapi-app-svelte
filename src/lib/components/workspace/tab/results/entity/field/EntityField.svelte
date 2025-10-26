<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  
  let { value, fieldConfig, entityType, fieldName, entity } = $props();

  console.log('EntityField debug:', {
    value,
    fieldConfig,
    fetchButton: fieldConfig?.fetchButton,
    fetchEntity: fieldConfig?.fetchEntity,
    shouldShowButton: fieldConfig?.fetchButton && fieldConfig?.fetchEntity && value
  });

  // function handleFetch() {
  //   if (fieldConfig?.fetchEntity && value) {
  //     tabsStore.addTab(fieldConfig.fetchEntity, { id: value });
  //   }
  // }

  function handleFetch() {
    if (fieldConfig?.fetchEntity && value) {
      tabsStore.addTab(fieldConfig.fetchEntity, { 
        searchParams: {
          id: value
        }
      });
    }
  }
</script>

<div class="entity-field">
  <span class="entity-value">{value}</span>
  {#if fieldConfig?.fetchButton && fieldConfig?.fetchEntity && value}
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