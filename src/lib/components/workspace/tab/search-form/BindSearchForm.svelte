<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { bindsApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';
  import { setupTestUser, DEBUG, dlog } from '$lib/utils/debug.js';

  let { tab } = $props();

  let searchId = $state('');
  let searchUuid = $state('');
  let searchVendorFromId = $state('');
  let searchVendorToId = $state('');
  let searchEnable = $state('');
  let loading = $state(false);
  let hasAutoSearched = $state(false);

  const limit = $workspaceStore.settings.defaultLimit;

  const hasId = $derived(searchId.trim().length > 0);
  const hasOtherFields = $derived(
    searchUuid.trim().length > 0 ||
    searchVendorFromId.trim().length > 0 ||
    searchVendorToId.trim().length > 0 ||
    searchEnable.trim().length > 0
  );

  const searchDisabled = $derived(!hasId && !hasOtherFields);

  const inputPlaceholder = $derived(
    hasId 
      ? 'Searching by ID (other fields disabled)' 
      : hasOtherFields
        ? 'Searching by multiple criteria'
        : 'Enter Bind ID or other search criteria'
  );

  // Effects
  $effect(() => {
    dlog('🔍 Bind search form state:', {
      hasId,
      hasOtherFields,
      searchDisabled,
      searchId: searchId.trim(),
      searchUuid: searchUuid.trim(),
      searchVendorFromId: searchVendorFromId.trim(),
      searchVendorToId: searchVendorToId.trim(),
      searchEnable: searchEnable.trim()
    });
  });

  $effect(() => {
    const params = tab.searchParams?.searchParams || tab.searchParams;

    if (params && Object.keys(params).length > 0 && !hasAutoSearched) {
      dlog('🔄 Filling bind form from searchParams:', params);
      hasAutoSearched = true;

      if (params.id) searchId = params.id;
      if (params.uuid) searchUuid = params.uuid;
      if (params.vendor_from_id) searchVendorFromId = params.vendor_from_id;
      if (params.vendor_to_id) searchVendorToId = params.vendor_to_id;
      if (params.enable !== undefined && params.enable !== null) {
        searchEnable = params.enable.toString();
      }

      dlog('📝 Bind form fields after filling:', {
        searchId, searchUuid, searchVendorFromId, searchVendorToId, searchEnable
      });

      setTimeout(() => {
        if (!searchDisabled && !loading) {
          dlog('🔍 Auto-searching binds with filled form');
          handleSearch();
        } else {
          console.error('❌ Cannot auto-search binds:', { searchDisabled, loading });
        }
      }, 100);
    }
  });

  // Methods
  async function handleSearch() {
    if (searchDisabled) {
      toast.error('Please enter search criteria');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      const searchParams = {
        meta: {
          userId: $workspaceStore.selectedUser?.id,
          limit: limit,
          offset: 0
        }
      };

      if (hasId) searchParams.id = searchId.trim();
      if (searchUuid.trim()) searchParams.uuid = searchUuid.trim();
      if (searchVendorFromId.trim()) searchParams.vendor_from_id = searchVendorFromId.trim();
      if (searchVendorToId.trim()) searchParams.vendor_to_id = searchVendorToId.trim();
      if (searchEnable.trim()) {

        const enableValue = searchEnable.trim().toLowerCase();
        if (enableValue === 'true' || enableValue === '1' || enableValue === 'yes') {
          searchParams.enable = true;
        } else if (enableValue === 'false' || enableValue === '0' || enableValue === 'no') {
          searchParams.enable = false;
        }
      }

      dlog('🔍 Searching binds with params:', searchParams);

      const response = await bindsApi.search(searchParams);

      dlog('✅ Search response:', response);

      const results = response.binds || [];

      dlog('✅ Search results:', results);

      tabsStore.updateTab(tab.id, {
        results,
        searchParams,
        offset: results.length,
        hasMore: results.length === limit
      });

      if (results.length === 0) {
        toast.warning('No binds found');
      } else {
        toast.success(`Found ${results.length} bind(s)`);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
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
      const searchParams = {
        ...tab.searchParams,
        meta: {
          ...tab.searchParams.meta,
          limit,
          offset: tab.offset
        }
      };

      const response = await bindsApi.search(searchParams);
      const newResults = response.binds || [];

      tabsStore.appendResults(tab.id, newResults, limit);

      if (newResults.length > 0) {
        toast.success(`Loaded ${newResults.length} more binds`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load more binds');
    } finally {
      loading = false;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function clearForm() {
    searchId = '';
    searchUuid = '';
    searchVendorFromId = '';
    searchVendorToId = '';
    searchEnable = '';

    tabsStore.updateTab(tab.id, {
      results: [],
      searchParams: {},
      offset: 0,
      hasMore: false
    });
  }


  function fetchVendorFrom() {
    // delete???
    dlog('Fetch vendor_from implementation needed');
  }

  function fetchVendorTo() {
    // delete???
    dlog('Fetch vendor_to implementation needed');
  }
</script>

<div class="search-form">
  <div class="search-section">
    <h4>Search Binds</h4>
    <div class="search-grid">
      <sl-input
        placeholder="Bind ID"
        value={searchId}
        on:input={(e) => searchId = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasOtherFields}
      >
        <sl-icon slot="prefix" name="tag"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="UUID"
        value={searchUuid}
        on:input={(e) => searchUuid = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasId}
      >
        <sl-icon slot="prefix" name="file-binary"></sl-icon>
      </sl-input>

      <div class="input-with-button">
        <sl-input
          placeholder="Vendor From ID"
          value={searchVendorFromId}
          on:input={(e) => searchVendorFromId = e.target.value}
          on:keypress={handleKeyPress}
          disabled={hasId}
        >
          <sl-icon slot="prefix" name="arrow-left-circle"></sl-icon>
        </sl-input>
        <sl-tooltip content="Fetch vendor">
          <sl-icon-button 
            name="search" 
            label="Fetch vendor"
            on:click={fetchVendorFrom}
            disabled={hasId}
          ></sl-icon-button>
        </sl-tooltip>
      </div>

      <div class="input-with-button">
        <sl-input
          placeholder="Vendor To ID"
          value={searchVendorToId}
          on:input={(e) => searchVendorToId = e.target.value}
          on:keypress={handleKeyPress}
          disabled={hasId}
        >
          <sl-icon slot="prefix" name="arrow-right-circle"></sl-icon>
        </sl-input>
        <sl-tooltip content="Fetch vendor">
          <sl-icon-button 
            name="search" 
            label="Fetch vendor"
            on:click={fetchVendorTo}
            disabled={hasId}
          ></sl-icon-button>
        </sl-tooltip>
      </div>

      <sl-select
        placeholder="Enable Status"
        value={searchEnable}
        on:sl-change={(e) => searchEnable = e.target.value}
        disabled={hasId}
      >
        <sl-menu-item value="">Any</sl-menu-item>
        <sl-menu-item value="true">Enabled</sl-menu-item>
        <sl-menu-item value="false">Disabled</sl-menu-item>
      </sl-select>
    </div>
    <div class="section-note">{inputPlaceholder}</div>
  </div>

  <div class="form-actions">
    <sl-button variant="default" on:click={clearForm}>
      <sl-icon slot="prefix" name="x-circle"></sl-icon>
      Clear
    </sl-button>
    
    <sl-button
      variant="primary"
      loading={loading}
      disabled={searchDisabled}
      on:click={handleSearch}
    >
      <sl-icon slot="prefix" name="search"></sl-icon>
      Search Binds
    </sl-button>
  </div>

  {#if tab.hasMore}
    <div class="load-more">
      <sl-button variant="default" on:click={handleLoadMore} loading={loading}>
        Load more binds...
      </sl-button>
    </div>
  {/if}
</div>

<style>
  .search-form {
    margin-bottom: 1rem;
  }

  .search-section {
    margin-bottom: 1.5rem;
  }

  .search-section h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--sl-color-neutral-600);
    font-weight: 600;
  }

  .section-note {
    font-size: 0.8rem;
    color: var(--sl-color-neutral-500);
    margin-top: 0.25rem;
    font-style: italic;
  }

  .search-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
  }

  .input-with-button {
    display: flex;
    gap: 0.25rem;
    align-items: flex-start;
  }

  .input-with-button sl-input {
    flex: 1;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--sl-color-neutral-200);
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--sl-color-neutral-200);
  }

  @media (max-width: 768px) {
    .search-grid {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .input-with-button {
      flex-direction: column;
    }
  }
</style>