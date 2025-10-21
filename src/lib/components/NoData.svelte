<script>
  export let title = 'No data available';
  export let message = 'Unable to load data. Please check your connection and try again.';
  export let icon = 'database-x';
  export let action = null;
  export let actionText = 'Retry';
</script>

<div class="no-data">
  <sl-icon name={icon} style="font-size: 4rem; color: var(--sl-color-neutral-400);"></sl-icon>
  <h2>{title}</h2>
  <p>{message}</p>
  {#if action}
    <sl-button variant="primary" on:click={action}>
      <sl-icon slot="prefix" name="arrow-clockwise"></sl-icon>
      {actionText}
    </sl-button>
  {/if}
</div>

<style>
  .no-data {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-small);
    margin: 1rem 0;
  }

  .no-data h2 {
    margin: 1rem 0 0.5rem 0;
    color: var(--sl-color-neutral-700);
  }

  .no-data p {
    color: var(--sl-color-neutral-600);
    margin-bottom: 2rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
</style>