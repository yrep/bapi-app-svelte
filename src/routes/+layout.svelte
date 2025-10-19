<script>

	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
 	import { setBasePath } from '@shoelace-style/shoelace';
  import ToastContainer from '$lib/components/ToastContainer.svelte';

import '@shoelace-style/shoelace/dist/components/button/button.js';
  import '@shoelace-style/shoelace/dist/components/icon/icon.js';
  import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
  import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
  import '@shoelace-style/shoelace/dist/components/input/input.js';
  import '@shoelace-style/shoelace/dist/components/alert/alert.js';
  import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
  import '@shoelace-style/shoelace/dist/components/select/select.js';
  import '@shoelace-style/shoelace/dist/components/option/option.js';
  import '@shoelace-style/shoelace/dist/components/divider/divider.js';
  import '@shoelace-style/shoelace/dist/components/card/card.js';


	let { children } = $props();

	onMount(() => {
    	setBasePath('/shoelace');
  	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="/shoelace/themes/light.css" />
	<title>Bapi - Binder API Tool</title>
</svelte:head>

<main>
  <div class="app">
    {@render children()}
  </div>
  <ToastContainer />
</main>

<style>
  .app {
    min-height: 100vh;
    background-color: var(--sl-color-neutral-50);
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
</style>