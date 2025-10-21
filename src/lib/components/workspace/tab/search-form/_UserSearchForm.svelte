<script>
  import { onMount } from 'svelte';
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { usersApi, brandsApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';

  export let tab;

  let searchType = 'id';
  let searchValue = '';
  let selectedBrand = '';
  let brands = [];
  let loading = false;
  let brandsLoading = false;

  const limit = $workspaceStore.settings.defaultLimit;

  onMount(async () => {
    // Загружаем бренды при монтировании
    await loadBrands();
  });

  async function loadBrands() {
    brandsLoading = true;
    try {
      brands = await brandsApi.list();
    } catch (error) {
      toast.error('Failed to load brands');
      console.error('Brands loading error:', error);
    } finally {
      brandsLoading = false;
    }
  }

  async function handleSearch() {
    if (!searchValue.trim()) {
      toast.error('Please enter search value');
      return;
    }

    // Для поиска по email и CRM требуется выбор бренда
    if (searchType !== 'id' && !selectedBrand) {
      toast.error('Please select a brand for this search type');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      let results;
      const searchParams = { 
        type: searchType, 
        value: searchValue,
        brand: selectedBrand 
      };

      switch (searchType) {
        case 'id':
          results = await usersApi.getById(searchValue.trim());
          break;
        case 'email':
          results = await usersApi.getByEmail(searchValue.trim(), selectedBrand);
          break;
        case 'crm':
          results = await usersApi.getByCRM(searchValue.trim(), selectedBrand);
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

  // Сбрасываем бренд при смене типа поиска на ID
  $: if (searchType === 'id') {
    selectedBrand = '';
  }

  // Плейсхолдер для поля ввода
  $: inputPlaceholder = searchType === 'id' 
    ? 'Enter user ID' 
    : searchType === 'email' 
      ? 'Enter email address' 
      : 'Enter CRM ID';

  // Нужен ли выбор бренда для текущего типа поиска
  $: showBrandSelect = searchType !== 'id';
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

    {#if showBrandSelect}
      <sl-select
        placeholder="Select brand"
        value={selectedBrand}
        on:sl-change={(e) => selectedBrand = e.target.value}
        style="min-width: 150px;"
        loading={brandsLoading}
        disabled={brandsLoading}
      >
        {#each brands as brand}
          <sl-option value={brand.slug}>{brand.name}</sl-option>
        {/each}
      </sl-select>
    {/if}

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
        disabled={!searchValue.trim() || (showBrandSelect && !selectedBrand)}
        on:click={handleSearch}
      >
        <sl-icon slot="prefix" name="search"></sl-icon>
        Search
      </sl-button>
    </sl-input>
  </div>

  {#if showBrandSelect && !brandsLoading && brands.length === 0}
    <sl-alert variant="warning" open style="margin-top: 0.5rem;">
      <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
      No brands available. Please check your API configuration.
    </sl-alert>
  {/if}
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