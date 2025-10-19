<script>
  export let data;
  export let expanded = false;
  
  function toggleExpanded() {
    expanded = !expanded;
  }
</script>

<div class="json-viewer">
  <div class="json-header" on:click={toggleExpanded}>
    <sl-icon name={expanded ? 'chevron-down' : 'chevron-right'}></sl-icon>
    <span>JSON Data</span>
    <sl-badge variant="neutral">{typeof data}</sl-badge>
  </div>
  
  {#if expanded}
    <pre class="json-content">{JSON.stringify(data, null, 2)}</pre>
  {/if}
</div>

<style>
  .json-viewer {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    overflow: hidden;
  }
  
  .json-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--sl-color-neutral-100);
    border-bottom: 1px solid var(--sl-color-neutral-200);
    cursor: pointer;
    user-select: none;
  }
  
  .json-header:hover {
    background: var(--sl-color-neutral-200);
  }
  
  .json-content {
    margin: 0;
    padding: 1rem;
    background: white;
    overflow: auto;
    max-height: 400px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.8rem;
    line-height: 1.4;
  }
</style>