<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { usersApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';

  export let tab;

  let searchType = 'id';
  let searchValue = '';
  let loading = false;

  const limit = $workspaceStore.settings.defaultLimit;

  async function handleSearch() {
    if (!searchValue.trim()) {
      toast.error('Please enter search value');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      let results;
      const searchParams = { 
        type: searchType, 
        value: searchValue
      };

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
      
      // Оборачиваем в массив если пришел одиночный объект
      const resultArray = Array.isArray(results) ? results : [results].filter(Boolean);
      
      tabsStore.updateTab(tab.id, { 
        results: resultArray,
        searchParams: searchParams,
        offset: resultArray.length,
        hasMore: resultArray.length === limit
      });
      
      if (resultArray.length === 0) {
        toast.warning('No users found');
      } else {
        toast.success(`Found ${resultArray.length} users`);
      }
    } catch (error) {
      tabsStore.updateTab(tab.id, { error });
      toast.error(error.message || 'Search failed');
    } finally {
      loading = false;
      tabsStore.updateTab(tab.id, { loading: false });
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  $: inputPlaceholder = searchType === 'id' 
    ? 'Enter user ID' 
    : searchType === 'email' 
      ? 'Enter email address' 
      : 'Enter CRM ID';
</script>

<div class="search-form">
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
      placeholder={inputPlaceholder}
      value={searchValue}
      on:sl-input={(e) => searchValue = e.target.value}
      on:keypress={handleKeyPress}
      style="flex: 1;"
    >
      <sl-button
        slot="suffix"
        variant="primary"
        loading={loading}
        disabled={!searchValue.trim()}
        on:click={handleSearch}
      >
        <sl-icon slot="prefix" name="search"></sl-icon>
        Search
      </sl-button>
    </sl-input>
  </div>
</div>

<style>
  .search-form {
    margin-bottom: 1rem;
  }

  .search-controls {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    .search-controls {
      flex-direction: column;
    }
  }
</style>