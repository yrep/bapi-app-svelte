<script>
  import { toast } from '$lib/stores/toast.js';
  import Toast from './Toast.svelte';
</script>

<div class="toast-container">
  {#each $toast as toastItem (toastItem.id)}
    <Toast
      message={toastItem.message}
      type={toastItem.type}
      duration={toastItem.duration}
      show={toastItem.show}
      on:click={() => toast.hide(toastItem.id)}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 10000;
    pointer-events: none;
  }
  
  .toast-container > * {
    pointer-events: auto;
  }
</style>