<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  
  import BaseSearchForm from './search-form/BaseSearchForm.svelte';
  import UserSearchForm from './search-form/_UserSearchForm.svelte';
  import VendorSearchForm from './search-form/VendorSearchForm.svelte';
  import BindSearchForm from './search-form/BindSearchForm.svelte';
  import TaskSearchForm from './search-form/TaskSearchForm.svelte';
  import EntityList from './results/EntityList.svelte';

  export let tab;

  // Отладка получения tab
  $: {
    console.log('✅ Tab component - tab data:', {
      id: tab?.id,
      entityType: tab?.entityType,
      resultsCount: tab?.results?.length,
      results: tab?.results?.slice(0, 2) // Показываем только первые 2 результата для отладки
    });
  }

  const searchFormComponents = {
    BaseSearchForm,
    UserSearchForm,
    VendorSearchForm,
    BindSearchForm,
    TaskSearchForm
  };

  const config = getEntityConfig(tab.entityType);
  const SearchFormComponent = searchFormComponents[config.searchForm] || BaseSearchForm;

  async function handleLoadMore() {
    console.log('Load more for tab:', tab.id);
    // Добавь вызов соответствующего метода из tabsStore
    // tabsStore.loadMore(tab.id);
  }
</script>

<div class="tab-content">
  <div style="background: orange; padding: 10px; margin-bottom: 10px;">
    ✅ Tab Active: {tab.entityType} - Results: {tab.results?.length || 0}
  </div>
  
  <div style="background: lightblue; padding: 10px; margin-bottom: 10px;">
    <strong>Config fields:</strong> {JSON.stringify(Object.keys(config.fields || {}), null, 2)}
  </div>
  
  <SearchFormComponent {tab} />
  
  {#if tab.results}
    <EntityList
      entities={tab.results}
      entityType={tab.entityType}
      loading={tab.loading}
      onLoadMore={tab.hasMore ? handleLoadMore : null}
    />
  {:else}
    <div style="color: red; padding: 10px;">
      ❌ Results is undefined or null
    </div>
  {/if}
</div>

<style>
  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }
</style>