<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  
  import BaseSearchForm from './search-form/BaseSearchForm.svelte';
  import UserSearchForm from './search-form/UserSearchForm.svelte';
  import EntityList from './results/EntityList.svelte';

  export let tab;

  const searchFormComponents = {
    BaseSearchForm,
    UserSearchForm
  };

  const config = getEntityConfig(tab.entityType);
  const SearchFormComponent = searchFormComponents[config.searchForm] || BaseSearchForm;

  async function handleLoadMore() {
    // Реализация будет в конкретных формах поиска
    console.log('Load more for tab:', tab.id);
  }
</script>

<div class="tab-content">
  <SearchFormComponent {tab} />
  
  <EntityList
    entities={tab.results}
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