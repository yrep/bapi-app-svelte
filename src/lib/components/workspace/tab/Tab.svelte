<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { getEntityConfig } from '$lib/config/entity-configs.js';
  
  import BaseSearchForm from './search-form/BaseSearchForm.svelte';
  import UserSearchForm from './search-form/UserSearchForm.svelte';
  import VendorSearchForm from './search-form/VendorSearchForm.svelte';
  import BindSearchForm from './search-form/BindSearchForm.svelte';
  import TaskSearchForm from './search-form/TaskSearchForm.svelte';
  import RequestSearchForm from './search-form/RequestSearchForm.svelte';
  import EntityList from './results/EntityList.svelte';
  import { dlog, DEBUG } from '$lib/utils/debug.js';


  let { tab } = $props();

  const searchFormComponents = {
    BaseSearchForm,
    UserSearchForm,
    VendorSearchForm,
    BindSearchForm,
    TaskSearchForm,
    RequestSearchForm
  };

  const config = getEntityConfig(tab.entityType);
  const SearchFormComponent = searchFormComponents[config.searchForm] || BaseSearchForm;

  async function handleLoadMore() {
    dlog('Load more for tab:', tab.id);
  }
</script>

<div class="tab-content">

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