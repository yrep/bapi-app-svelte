<script>
  let { value = '' } = $props();
  let expanded = $state(false);
  
  const MAX_LENGTH = 100;
  const needsTruncation = $derived(value?.length > MAX_LENGTH);
  const displayValue = $derived(expanded ? value : (needsTruncation ? value.slice(0, MAX_LENGTH) : value));
  const ellipsis = $derived(needsTruncation && !expanded ? '...' : '');
</script>

<span class="text-field">
  {displayValue}
  {#if ellipsis}
    <span 
      class="ellipsis"
      on:click={() => expanded = true}
    >{ellipsis}</span>
  {/if}
</span>

<style>
  .text-field {
    word-break: break-word;
  }
  
  .ellipsis {
    cursor: pointer;
    color: var(--sl-color-primary-600);
    font-weight: bold;
    padding: 0 2px;
    transition: background-color 0.2s ease;
  }
  
  .ellipsis:hover {
    background-color: var(--sl-color-primary-100);
    border-radius: 2px;
  }
</style>