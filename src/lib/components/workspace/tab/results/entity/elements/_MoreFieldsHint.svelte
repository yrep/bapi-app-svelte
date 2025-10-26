<script>
  let { expanded, totalFields, displayFieldsCount, onToggle } = $props();

  let hiddenFieldsCount = $derived(totalFields - displayFieldsCount);
</script>

{#if !expanded && hiddenFieldsCount > 0}
  <div class="more-fields-hint" on:click={onToggle}>
    ... and {hiddenFieldsCount} more field{hiddenFieldsCount === 1 ? '' : 's'}
  </div>
{/if}

<style>
  .more-fields-hint {
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--sl-color-neutral-300);
    border-radius: var(--sl-border-radius-medium);
    background-color: var(--sl-color-neutral-100);
    color: var(--sl-color-neutral-700);
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s ease;
    user-select: none;
  }
  
  .more-fields-hint:hover {
    background-color: var(--sl-color-neutral-200);
    border-color: var(--sl-color-neutral-400);
  }

  .more-fields-hint:active {
    background-color: var(--sl-color-neutral-300);
  }
</style>