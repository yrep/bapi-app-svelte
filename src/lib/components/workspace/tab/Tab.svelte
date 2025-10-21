<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  
  import BaseSearchForm from './search-form/BaseSearchForm.svelte';
  import UserSearchForm from './search-form/_UserSearchForm.svelte';
  import EntityList from './results/EntityList.svelte';

  export let tab;

  // Отладка получения tab
  $: {
    console.log('✅ Tab component - tab data:', {
      id: tab?.id,
      entityType: tab?.entityType,
      resultsCount: tab?.results?.length,
      results: tab?.results
    });
  }

  const searchFormComponents = {
    BaseSearchForm,
    UserSearchForm
  };

  const config = getEntityConfig(tab.entityType);
  const SearchFormComponent = searchFormComponents[config.searchForm] || BaseSearchForm;

  async function handleLoadMore() {
    console.log('Load more for tab:', tab.id);
  }
</script>

<div class="tab-content">
  <div style="background: orange; padding: 10px; margin-bottom: 10px;">
    ✅ Tab Active: {tab.entityType} - Results: {tab.results?.length || 0}
  </div>
  
  <SearchFormComponent {tab} />
  
  <EntityList
    entities={tab.results || []}
    entityType={tab.entityType}
    loading={tab.loading}
    onLoadMore={tab.hasMore ? handleLoadMore : null}
  />
</div>

<style>
  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }
</style>