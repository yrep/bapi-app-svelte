<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/_workspace.js';
  import { vendorsApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';

  let { tab } = $props();

  let searchId = '';
  let searchType = '';
  let searchUuid = '';
  let searchToken = '';
  let searchLogin = '';
  let searchSource = '';
  let loading = false;

  const limit = $workspaceStore.settings.defaultLimit;

  // Правильный синтаксис для $derived в Svelte 5
  const inputPlaceholder = $derived(
    searchId.trim() 
      ? 'Searching by ID...' 
      : 'Enter search criteria in fields below'
  );
  
  const searchDisabled = $derived(
    !searchId.trim() && 
    !searchType.trim() && 
    !searchUuid.trim() && 
    !searchToken.trim() && 
    !searchLogin.trim() && 
    !searchSource.trim()
  );

  // Добавим отладочный derived для отслеживания состояния
  const debugState = $derived({
    searchId: searchId.trim(),
    searchType: searchType.trim(),
    searchUuid: searchUuid.trim(),
    searchToken: searchToken.trim(),
    searchLogin: searchLogin.trim(),
    searchSource: searchSource.trim(),
    searchDisabled
  });

  // Логируем изменения
  $effect(() => {
    console.log('🔍 Search form state:', debugState);
  });

  async function handleSearch() {
    // Если заполнено поле ID, ищем только по ID
    if (searchId.trim()) {
      await searchById();
      return;
    }

    // Ищем по комбинации других полей
    await searchByMultipleFields();
  }

  async function searchById() {
    if (!searchId.trim()) {
      toast.error('Please enter Vendor ID');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      const results = await vendorsApi.getById(searchId.trim());
      
      const resultArray = Array.isArray(results) ? results : [results].filter(Boolean);
      
      tabsStore.updateTab(tab.id, { 
        results: resultArray,
        searchParams: { 
          id: searchId,
          type: searchType,
          uuid: searchUuid,
          token: searchToken,
          login: searchLogin,
          source: searchSource
        },
        offset: resultArray.length,
        hasMore: false
      });
      
      if (resultArray.length === 0) {
        toast.warning('No vendors found with this ID');
      } else {
        toast.success(`Found ${resultArray.length} vendor(s)`);
      }
    } catch (error) {
      tabsStore.updateTab(tab.id, { error });
      toast.error(error.message || 'Search failed');
    } finally {
      loading = false;
      tabsStore.updateTab(tab.id, { loading: false });
    }
  }

  async function searchByMultipleFields() {
    // Проверяем, что хотя бы одно поле заполнено
    const hasSearchCriteria = searchType.trim() || 
                             searchUuid.trim() || 
                             searchToken.trim() || 
                             searchLogin.trim() || 
                             searchSource.trim();

    if (!hasSearchCriteria) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      // Создаем объект параметров поиска - включаем только заполненные поля
      const searchParams = {};
      
      if (searchType.trim()) searchParams.type = searchType.trim();
      if (searchUuid.trim()) searchParams.uuid = searchUuid.trim();
      if (searchToken.trim()) searchParams.token = searchToken.trim();
      if (searchLogin.trim()) searchParams.login = searchLogin.trim();
      if (searchSource.trim()) searchParams.source = searchSource.trim();
      
      // Добавляем пагинацию
      searchParams.limit = limit;
      searchParams.offset = 0;

      console.log('🔍 Searching vendors with params:', searchParams);

      const results = await vendorsApi.search(searchParams);
      
      console.log('✅ Search results:', results);
      
      tabsStore.updateTab(tab.id, { 
        results,
        searchParams,
        offset: results.length,
        hasMore: results.length === limit
      });
      
      if (results.length === 0) {
        toast.warning('No vendors found with these criteria');
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
    
    // Также очищаем результаты поиска
    tabsStore.updateTab(tab.id, { 
      results: [],
      searchParams: {},
      offset: 0,
      hasMore: false
    });
  }

  // Функции для обновления значений полей
  function updateSearchId(e) {
    searchId = e.target.value;
    console.log('🆔 ID updated:', searchId);
  }

  function updateSearchType(e) {
    searchType = e.target.value;
    console.log('📝 Type updated:', searchType);
  }

  function updateSearchUuid(e) {
    searchUuid = e.target.value;
    console.log('🔑 UUID updated:', searchUuid);
  }

  function updateSearchToken(e) {
    searchToken = e.target.value;
    console.log('🎫 Token updated:', searchToken);
  }

  function updateSearchLogin(e) {
    searchLogin = e.target.value;
    console.log('👤 Login updated:', searchLogin);
  }

  function updateSearchSource(e) {
    searchSource = e.target.value;
    console.log('📦 Source updated:', searchSource);
  }
</script>

<div class="search-form">
  <div class="search-section">
    <h4>Search by ID</h4>
    <sl-input
      placeholder="Enter Vendor ID"
      value={searchId}
      on:input={updateSearchId}
      on:keypress={handleKeyPress}
    >
      <sl-icon slot="prefix" name="tag"></sl-icon>
    </sl-input>
    <div class="section-note">Search by specific vendor ID (priority search)</div>
  </div>

  <div class="divider">
    <span>OR</span>
  </div>

  <div class="search-section">
    <h4>Search by multiple criteria</h4>
    <div class="search-grid">
      <sl-input
        placeholder="Type"
        value={searchType}
        on:input={updateSearchType}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="type"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="UUID"
        value={searchUuid}
        on:input={updateSearchUuid}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="file-binary"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Token"
        value={searchToken}
        on:input={updateSearchToken}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="key"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Login"
        value={searchLogin}
        on:input={updateSearchLogin}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="person"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Source"
        value={searchSource}
        on:input={updateSearchSource}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="database"></sl-icon>
      </sl-input>
    </div>
    <div class="section-note">{inputPlaceholder}</div>
    
    <!-- Отладочная информация -->
    <div class="debug-info" style="font-size: 0.7rem; color: #666; margin-top: 0.5rem;">
      Debug: {JSON.stringify(debugState)}
    </div>
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

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1rem 0;
    color: var(--sl-color-neutral-500);
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--sl-color-neutral-300);
  }

  .divider span {
    padding: 0 1rem;
    font-size: 0.8rem;
    font-weight: 600;
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