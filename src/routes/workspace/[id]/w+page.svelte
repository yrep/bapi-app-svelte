<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { workspaces, apiActions } from '$lib/stores/app';
  import { brandsApi, usersApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';

  let workspace = null;
  let brands = [];
  let selectedBrand = '';
  let searchType = 'id';
  let searchValue = '';
  let searchResults = null;
  let searchError = '';
  let dataLoaded = false;
  let loading = false;
  let loadError = null;

  async function loadBrands() {
    loading = true;
    dataLoaded = false;
    loadError = null;
    try {
      brands = await brandsApi.list();
      dataLoaded = true;
      apiActions.setAvailable();
    } catch (error) {
      console.error('Failed to load brands:', error);
      loadError = error;
      apiActions.setError(error);
      toast.error(error.message || 'Failed to load brands data');
      dataLoaded = false;
      brands = [];
    } finally {
      loading = false;
    }
  }

  async function searchUser() {
    if (!searchValue.trim()) {
      toast.error('Please enter search value');
      return;
    }
    if (!selectedBrand) {
      toast.error('Please select a brand first');
      return;
    }
    loading = true;
    searchError = '';
    searchResults = null;
    try {
      let result;
      switch (searchType) {
        case 'id':
          result = await usersApi.getById(searchValue.trim());
          break;
        case 'email':
          result = await usersApi.getByEmail(searchValue.trim());
          break;
        case 'crm':
          result = await usersApi.getByCRM(searchValue.trim());
          break;
      }
      searchResults = result;
      apiActions.setAvailable();
      toast.success('User data loaded successfully');
    } catch (error) {
      searchError = error.message || 'Search failed';
      apiActions.setError(error);
      toast.error(searchError);
      searchResults = null;
    } finally {
      loading = false;
    }
  }

  function clearSearch() {
    searchValue = '';
    searchResults = null;
    searchError = '';
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      searchUser();
    }
  }

  onMount(() => {
    workspace = $workspaces.find(w => w.id === $page.params.id);

    if (!workspace) {
      toast.error('Workspace not found');
      goto('/');
      return;
    }

    loadBrands();
  });
</script>

<svelte:head>
  <title>{workspace?.name || 'Workspace'} - Bapi</title>
</svelte:head>

{#if workspace}
  <div class="workspace-page">
    <header class="header">
      <div class="header-content">
        <div class="back-button">
          <sl-icon-button
            name="arrow-left"
            label="Back to workspaces"
            on:click={() => goto('/')}
          ></sl-icon-button>
          <h1>{workspace.name}</h1>
        </div>

        <div class="workspace-actions">
          <sl-button variant="neutral" on:click={() => goto('/')}>
            <sl-icon slot="prefix" name="house"></sl-icon>
            Dashboard
          </sl-button>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="workspace-content">
        {#if loadError}
          <div class="error-state">
            <sl-icon name="cloud-off" style="font-size: 4rem; color: var(--sl-color-neutral-400);"></sl-icon>
            <h2>Unable to load data</h2>
            <p>{loadError.message || 'Check your API configuration and try again'}</p>
            <sl-button variant="primary" on:click={loadBrands}>
              <sl-icon slot="prefix" name="arrow-clockwise"></sl-icon>
              Retry
            </sl-button>
          </div>
        {:else if loading && !dataLoaded}
          <div class="loading-state">
            <sl-spinner></sl-spinner>
            <span>Loading brands...</span>
          </div>
        {:else if dataLoaded && brands.length === 0}
          <div class="empty-state">
            <sl-icon name="database-x"></sl-icon>
            <p>No brands available</p>
            <sl-button variant="primary" on:click={loadBrands}>
              <sl-icon slot="prefix" name="arrow-clockwise"></sl-icon>
              Reload
            </sl-button>
          </div>
        {:else if dataLoaded}
          <sl-card class="section-card">
            <div slot="header">
              <h2>Select Brand</h2>
            </div>
            <sl-select
              label="Brand"
              placeholder="Choose a brand"
              value={selectedBrand}
              on:sl-change={(e) => selectedBrand = e.target.value}
            >
              {#each brands as brand}
                <sl-option value={brand.slug}>{brand.name}</sl-option>
              {/each}
            </sl-select>
          </sl-card>

          {#if selectedBrand}
            <sl-card class="section-card">
              <div slot="header">
                <h2>Search User</h2>
              </div>

              <div class="search-controls">
                <sl-select
                  value={searchType}
                  on:sl-change={(e) => searchType = e.target.value}
                  style="min-width: 120px;"
                >
                  <sl-option value="id">By ID</sl-option>
                  <sl-option value="email">By Email</sl-option>
                  <sl-option value="crm">By CRM</sl-option>
                </sl-select>

                <sl-input
                  placeholder={searchType === 'id' ? 'Enter user ID' : searchType === 'email' ? 'Enter email address' : 'Enter CRM ID'}
                  value={searchValue}
                  on:sl-input={(e) => searchValue = e.target.value}
                  on:keypress={handleKeyPress}
                  style="flex: 1;"
                >
                  {#if searchValue}
                    <sl-icon-button
                      slot="suffix"
                      name="x"
                      label="Clear"
                      on:click={clearSearch}
                    ></sl-icon-button>
                  {/if}
                </sl-input>

                <sl-button
                  variant="primary"
                  on:click={searchUser}
                  loading={loading}
                  disabled={!searchValue.trim()}
                >
                  <sl-icon slot="prefix" name="search"></sl-icon>
                  Search
                </sl-button>
              </div>

              {#if searchError}
                <sl-alert variant="danger" open style="margin-top: 1rem;">
                  <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                  {searchError}
                </sl-alert>
              {/if}

              {#if searchResults}
                <div class="search-results">
                  <div class="results-header">
                    <h3>Search Results</h3>
                    <sl-button variant="neutral" size="small" on:click={clearSearch}>
                      Clear
                    </sl-button>
                  </div>

                  <div class="json-viewer">
                    <pre>{JSON.stringify(searchResults, null, 2)}</pre>
                  </div>
                </div>
              {/if}
            </sl-card>
          {/if}
        {/if}
      </div>
    </main>
  </div>
{/if}

<style>
  .workspace-page {
    min-height: 100vh;
    background-color: var(--sl-color-neutral-50);
  }

  .header {
    background: white;
    border-bottom: 1px solid var(--sl-color-neutral-200);
    padding: 1rem 0;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .back-button h1 {
    margin: 0;
    color: var(--sl-color-neutral-800);
  }

  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .workspace-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section-card {
    width: 100%;
  }

  .section-card h2 {
    margin: 0;
    color: var(--sl-color-neutral-700);
    font-size: 1.25rem;
  }

  .search-controls {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .error-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-small);
  }

  .error-state h2 {
    margin: 1rem 0 0.5rem 0;
    color: var(--sl-color-neutral-700);
  }

  .error-state p {
    color: var(--sl-color-neutral-600);
    margin-bottom: 2rem;
  }

  .loading-state {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    color: var(--sl-color-neutral-600);
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--sl-color-neutral-500);
  }

  .empty-state sl-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .search-results {
    margin-top: 1.5rem;
    border-top: 1px solid var(--sl-color-neutral-200);
    padding-top: 1.5rem;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .results-header h3 {
    margin: 0;
    color: var(--sl-color-neutral-700);
  }

  .json-viewer {
    background: var(--sl-color-neutral-100);
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    padding: 1rem;
    overflow: auto;
    max-height: 400px;
  }

  .json-viewer pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.8rem;
    line-height: 1.4;
    color: var(--sl-color-neutral-700);
  }

  @media (max-width: 768px) {
    .search-controls {
      flex-direction: column;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .back-button {
      justify-content: center;
    }
  }
</style>