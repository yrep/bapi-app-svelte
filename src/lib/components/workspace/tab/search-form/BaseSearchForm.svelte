<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { entityApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';

  export let tab;

  let searchId = '';
  let loading = false;

  const limit = $workspaceStore.settings.defaultLimit;

  async function handleSearch() {
    if (!searchId.trim()) {
      toast.error('Please enter ID');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      const results = await entityApi.search(tab.entityType, { 
        id: searchId,
        limit,
        offset: 0
      });

      tabsStore.updateTab(tab.id, { 
        results,
        searchParams: { id: searchId },
        offset: results.length,
        hasMore: results.length === limit
      });

      if (results.length === 0) {
        toast.warning('No results found');
      } else {
        toast.success(`Found ${results.length} results`);
      }
    } catch (error) {
      tabsStore.updateTab(tab.id, { error });
      toast.error(error.message || 'Search failed');
    } finally {
      loading = false;
      tabsStore.updateTab(tab.id, { loading: false });
    }
  }

  async function handleLoadMore() {
    if (!tab.hasMore) return;

    loading = true;
    try {
      const newResults = await entityApi.search(tab.entityType, {
        ...tab.searchParams,
        limit,
        offset: tab.offset
      });

      tabsStore.appendResults(tab.id, newResults, limit);

      if (newResults.length > 0) {
        toast.success(`Loaded ${newResults.length} more results`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load more');
    } finally {
      loading = false;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="search-form">
  <sl-input
    placeholder="Enter ID to search"
    value={searchId}
    on:sl-input={(e) => searchId = e.target.value}
    on:keypress={handleKeyPress}
  >
    <sl-button
      slot="suffix"
      variant="primary"
      loading={loading}
      disabled={!searchId.trim()}
      on:click={handleSearch}
    >
      <sl-icon slot="prefix" name="search"></sl-icon>
      Search
    </sl-button>
  </sl-input>

  {#if tab.hasMore}
    <div class="load-more">
      <sl-button variant="default" on:click={handleLoadMore} loading={loading}>
        Load more...
      </sl-button>
    </div>
  {/if}
</div>

<style>
  .search-form {
    margin-bottom: 1rem;
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>