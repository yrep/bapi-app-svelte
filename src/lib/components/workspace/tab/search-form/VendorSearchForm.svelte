<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { vendorsApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';

  let { tab } = $props();

  // Reactive state
  let searchId = $state('');
  let searchType = $state('');
  let searchUuid = $state('');
  let searchToken = $state('');
  let searchLogin = $state('');
  let searchSource = $state('');
  let loading = $state(false);
  let hasAutoSearched = $state(false);

  const limit = $workspaceStore.settings.defaultLimit;

  // Derived values
  const hasId = $derived(searchId.trim().length > 0);
  const hasOtherFields = $derived(
    searchType.trim().length > 0 ||
    searchUuid.trim().length > 0 ||
    searchToken.trim().length > 0 ||
    searchLogin.trim().length > 0 ||
    searchSource.trim().length > 0
  );

  const searchDisabled = $derived(!hasId && !hasOtherFields);

  const inputPlaceholder = $derived(
    hasId 
      ? 'Searching by ID (other fields disabled)' 
      : hasOtherFields
        ? 'Searching by multiple criteria'
        : 'Enter Vendor ID or other search criteria'
  );

  // Effects
  $effect(() => {
    console.log('🔍 Search form state:', {
      hasId,
      hasOtherFields,
      searchDisabled,
      searchId: searchId.trim(),
      searchType: searchType.trim(),
      searchUuid: searchUuid.trim(),
      searchToken: searchToken.trim(),
      searchLogin: searchLogin.trim(),
      searchSource: searchSource.trim()
    });
  });


 $effect(() => {
    // Берем searchParams из вложенной структуры
    const params = tab.searchParams?.searchParams || tab.searchParams;
    
    if (params && Object.keys(params).length > 0 && !hasAutoSearched) {
      console.log('🔄 Filling form from searchParams:', params);
      hasAutoSearched = true; // Помечаем что авто-поиск уже выполнен
      
      // Заполняем поля формы из searchParams
      if (params.id) searchId = params.id;
      if (params.type) searchType = params.type;
      if (params.uuid) searchUuid = params.uuid;
      if (params.token) searchToken = params.token;
      if (params.login) searchLogin = params.login;
      if (params.source) searchSource = params.source;
      
      console.log('📝 Form fields after filling:', {
        searchId, searchType, searchUuid, searchToken, searchLogin, searchSource
      });
      
      setTimeout(() => {
        if (!searchDisabled && !loading) {
          console.log('🔍 Auto-searching with filled form');
          handleSearch();
        } else {
          console.log('❌ Cannot auto-search:', { searchDisabled, loading });
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
      
      // Добавляем параметры поиска
      if (hasId) searchParams.id = searchId.trim();
      if (searchType.trim()) searchParams.type = searchType.trim();
      if (searchUuid.trim()) searchParams.uuid = searchUuid.trim();
      if (searchToken.trim()) searchParams.token = searchToken.trim();
      if (searchLogin.trim()) searchParams.login = searchLogin.trim();
      if (searchSource.trim()) searchParams.source = searchSource.trim();

      console.log('🔍 Searching vendors with params:', searchParams);

      const response = await vendorsApi.search(searchParams);

      console.log('✅ Search response:', response);

      const results = response.vendors || [];

      console.log('✅ Search results:', results);

      tabsStore.updateTab(tab.id, {
        results,
        searchParams,
        offset: results.length,
        hasMore: results.length === limit
      });
      
      if (results.length === 0) {
        toast.warning('No vendors found');
      } else {
        toast.success(`Found ${results.length} vendor(s)`);
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
        limit,
        offset: tab.offset
      };

      const newResults = await vendorsApi.search(searchParams);
      tabsStore.appendResults(tab.id, newResults, limit);
      
      if (newResults.length > 0) {
        toast.success(`Loaded ${newResults.length} more vendors`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load more vendors');
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
    searchType = '';
    searchUuid = '';
    searchToken = '';
    searchLogin = '';
    searchSource = '';
    
    tabsStore.updateTab(tab.id, { 
      results: [],
      searchParams: {},
      offset: 0,
      hasMore: false
    });
  }
</script>

<div class="search-form">
  <div class="search-section">
    <h4>Search Vendors</h4>
    <div class="search-grid">
      <sl-input
        placeholder="Vendor ID"
        value={searchId}
        on:input={(e) => searchId = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasOtherFields}
      >
        <sl-icon slot="prefix" name="tag"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Type"
        value={searchType}
        on:input={(e) => searchType = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasId}
      >
        <sl-icon slot="prefix" name="type"></sl-icon>
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

      <sl-input
        placeholder="Token"
        value={searchToken}
        on:input={(e) => searchToken = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasId}
      >
        <sl-icon slot="prefix" name="key"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Login"
        value={searchLogin}
        on:input={(e) => searchLogin = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasId}
      >
        <sl-icon slot="prefix" name="person"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Source"
        value={searchSource}
        on:input={(e) => searchSource = e.target.value}
        on:keypress={handleKeyPress}
        disabled={hasId}
      >
        <sl-icon slot="prefix" name="database"></sl-icon>
      </sl-input>
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
      Search Vendors
    </sl-button>
  </div>

  {#if tab.hasMore}
    <div class="load-more">
      <sl-button variant="default" on:click={handleLoadMore} loading={loading}>
        Load more vendors...
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
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
  }
</style>