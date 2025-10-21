<script>
  export let value = {};
  
  let expanded = false;
  
  function toggleExpand() {
    expanded = !expanded;
  }
</script>

<div class="json-field">
  {#if expanded}
    <pre>{JSON.stringify(value, null, 2)}</pre>
    <sl-button size="small" variant="text" on:click={toggleExpand}>
      <sl-icon name="chevron-up" slot="prefix"></sl-icon>
      Collapse
    </sl-button>
  {:else}
    <span class="json-preview" on:click={toggleExpand}>
      {JSON.stringify(value).substring(0, 100)}
      {JSON.stringify(value).length > 100 ? '...' : ''}
    </span>
  {/if}
</div>

<style>
  .json-field {
    cursor: pointer;
  }

  .json-preview {
    color: var(--sl-color-neutral-600);
    font-family: monospace;
    font-size: 0.75rem;
  }

  pre {
    margin: 0;
    font-size: 0.75rem;
    background: var(--sl-color-neutral-100);
    padding: 0.5rem;
    border-radius: var(--sl-border-radius-small);
    white-space: pre-wrap;
  }
</style>