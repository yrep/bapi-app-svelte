<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  export let message = '';
  export let type = 'error'; // 'error' | 'warning' | 'success'
  export let duration = 5000;
  export let show = false;
  
  let timeoutId;
  
  onMount(() => {
    if (show && duration > 0) {
      timeoutId = setTimeout(() => {
        show = false;
      }, duration);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
  
  function close() {
    show = false;
    if (timeoutId) clearTimeout(timeoutId);
  }
</script>

{#if show}
  <div class="toast toast-{type}" in:fly="{{ y: -20, duration: 300 }}" out:fade on:click={close}>
    <div class="toast-icon">
      {#if type === 'error'}
        <sl-icon name="exclamation-octagon"></sl-icon>
      {:else if type === 'warning'}
        <sl-icon name="exclamation-triangle"></sl-icon>
      {:else if type === 'success'}
        <sl-icon name="check-circle"></sl-icon>
      {/if}
    </div>
    <div class="toast-content">
      <div class="toast-message">{message}</div>
    </div>
    <sl-icon-button 
      name="x" 
      label="Close" 
      class="toast-close"
      on:click={close}
    ></sl-icon-button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: white;
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-large);
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 300px;
    max-width: 400px;
    z-index: 10000;
    cursor: pointer;
    border-left: 4px solid;
  }
  
  .toast-error {
    border-left-color: var(--sl-color-danger-500);
  }
  
  .toast-warning {
    border-left-color: var(--sl-color-warning-500);
  }
  
  .toast-success {
    border-left-color: var(--sl-color-success-500);
  }
  
  .toast-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  .toast-error .toast-icon {
    color: var(--sl-color-danger-500);
  }
  
  .toast-warning .toast-icon {
    color: var(--sl-color-warning-500);
  }
  
  .toast-success .toast-icon {
    color: var(--sl-color-success-500);
  }
  
  .toast-content {
    flex: 1;
    min-width: 0;
  }
  
  .toast-message {
    color: var(--sl-color-neutral-700);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .toast-close {
    flex-shrink: 0;
    color: var(--sl-color-neutral-500);
  }
  
  @media (max-width: 768px) {
    .toast {
      left: 1rem;
      right: 1rem;
      min-width: auto;
    }
  }
</style>