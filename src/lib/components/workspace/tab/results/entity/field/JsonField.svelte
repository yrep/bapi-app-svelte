<script>

  let { value, compact = false } = $props();
  
  let expanded = $state(false);
  
  const isObject = typeof value === 'object' && value !== null;
  const jsonString = JSON.stringify(value, null, 2);
  
  function toggleExpand() {
    expanded = !expanded;
  }
  
  function copyToClipboard() {
    navigator.clipboard.writeText(jsonString);
    // Можно добавить toast уведомление
  }
</script>

<div class="json-field">
  <div class="json-controls">
    <sl-button-group>
      <sl-button 
        size="small" 
        variant={expanded ? "default" : "neutral"}
        on:click={toggleExpand}
      >
        <sl-icon name={expanded ? "chevron-up" : "chevron-down"} slot="prefix"></sl-icon>
        {expanded ? 'Collapse' : 'Expand'}
      </sl-button>
      
      <sl-button 
        size="small" 
        variant="neutral"
        on:click={copyToClipboard}
      >
        <sl-icon name="copy" slot="prefix"></sl-icon>
        Copy
      </sl-button>
    </sl-button-group>
  </div>

  <div class="json-content">
    {#if expanded || !isObject}
      <pre class="json-full">{jsonString}</pre>
    {:else}
      <div class="json-compact" on:click={toggleExpand}>
        {#if compact}
          <span class="json-preview">{Object.keys(value).length} fields</span>
        {:else}
          <span class="json-preview">
            {jsonString.length > 150 ? jsonString.substring(0, 150) + '...' : jsonString}
          </span>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .json-field {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    background: var(--sl-color-neutral-50);
    overflow: hidden;
  }

  .json-controls {
    padding: 0.5rem;
    background: var(--sl-color-neutral-100);
    border-bottom: 1px solid var(--sl-color-neutral-200);
  }

  .json-content {
    padding: 0.75rem;
  }

  .json-full {
    margin: 0;
    font-size: 0.75rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
  }

  .json-compact {
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--sl-border-radius-small);
    transition: background-color 0.2s ease;
  }

  .json-compact:hover {
    background: var(--sl-color-neutral-100);
  }

  .json-preview {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.75rem;
    color: var(--sl-color-neutral-600);
    line-height: 1.4;
  }
</style>