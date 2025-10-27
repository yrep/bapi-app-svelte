<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { usersApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';
  import { DEBUG, dlog, setupTestUser } from '$lib/utils/debug.js';

  let { tab } = $props();

  let searchType = $state('id');
  let searchValue = $state('');
  let loading = $state(false);
  const limit = $workspaceStore.settings.defaultLimit;

  let inputPlaceholder = $derived(
    searchType === 'id'
      ? 'Enter user ID'
      : searchType === 'email'
        ? 'Enter email address'
        : 'Enter CRM ID'
  );

  $effect(() => {
    if (DEBUG) {
      const testUser = setupTestUser();
      if (testUser && searchValue === '') {
        searchValue = '-1';
        dlog('Auto-filled test user ID');
      }
    }
  });

  async function handleSearch() {
    dlog('✅ handleSearch CALLED!');

    if (!searchValue.trim()) {
      toast.error('Please enter search value');
      return;
    }

    if (searchValue.trim() === '-1') {
      dlog('🔄 Setting test user -1');
      const integrillaUser = { id: -1, name: 'Integrilla User', email: '' };
      workspaceStore.setSelectedUser(integrillaUser);
      tabsStore.updateTab(tab.id, {
        results: [integrillaUser],
        searchParams: { type: searchType, value: searchValue }
      });
      toast.success('Integrilla user set');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      let results;
      dlog('✅ Making API call for:', searchType, searchValue);

      switch (searchType) {
        case 'id':
          results = await usersApi.getById(searchValue.trim());
          break;
        case 'email':
          results = await usersApi.getByEmail(searchValue.trim());
          break;
        case 'crm':
          results = await usersApi.getByCRM(searchValue.trim());
          break;
      }

      dlog('✅ API RAW RESULTS:', results);

      const resultArray = Array.isArray(results) ? results : [results].filter(Boolean);

      dlog('✅ FINAL RESULT ARRAY:', resultArray);

      tabsStore.updateTab(tab.id, {
        results: resultArray,
        searchParams: { type: searchType, value: searchValue }
      });

      dlog('✅ Tab updated with results');

    } catch (error) {
      console.error('❌ Search error:', error);
      toast.error(error.message || 'Search failed');
    } finally {
      loading = false;
      tabsStore.updateTab(tab.id, { loading: false });
    }
  }

  function handleKeyPress(event) {
    dlog('⌨️ Key pressed:', event.key);
    if (event.key === 'Enter') {
      event.preventDefault();
      dlog('🔴 Enter pressed, calling handleSearch');
      handleSearch();
    }
  }

  function handleButtonClick(event) {
    event.preventDefault();
    dlog('🔴 Search button clicked');
    handleSearch();
  }
</script>
<div class="brands-button-container">
  <sl-tooltip content="Sets user id -1 as Integrilla has no binder users">
    <sl-button
      variant="primary"
      on:click={() => {
        searchValue = '-1';
        handleSearch();
      }}
      class="integrilla-btn"
    >
      Integrilla
    </sl-button>
 </sl-tooltip>
</div>
<div class="search-form">
  <div class="search-controls">
    <sl-select value={searchType} on:sl-change={(e) => searchType = e.target.value}>
      <sl-option value="id">By ID</sl-option>
      <sl-option value="email">By Email</sl-option>
      <sl-option value="crm">By CRM</sl-option>
    </sl-select>

    <sl-input
      placeholder={inputPlaceholder}
      value={searchValue}
      on:sl-input={(e) => searchValue = e.target.value}
      on:keypress={handleKeyPress}
    >
    </sl-input>

    <sl-button
      variant="primary"
      loading={loading}
      disabled={!searchValue.trim()}
      on:click={handleButtonClick}
    >
      <sl-icon slot="prefix" name="search"></sl-icon>
      Search
    </sl-button>
  </div>
</div>

<style>
  .integrilla-btn::part(base) {
    background-color: #8fcdbe;
    border-color: #8fcdbe;
    color: white;
  }

  .integrilla-btn::part(base):hover {
    background-color: #7bb8a9;
    border-color: #7bb8a9;
  }

  .integrilla-btn::part(base):active {
    background-color: #67a394;
    border-color: #67a394;
  }

  .search-form {
    margin-bottom: 1rem;
  }

  .search-controls {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .search-controls sl-select {
    width: 120px;
  }

  .search-controls sl-input {
    flex: 1;
  }

  @media (max-width: 768px) {
    .search-controls {
      flex-direction: column;
    }
  }
</style>