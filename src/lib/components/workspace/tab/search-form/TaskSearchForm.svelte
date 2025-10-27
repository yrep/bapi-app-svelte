<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { tasksApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import { DEBUG, dlog } from '$lib/utils/debug.js';

  let { tab } = $props();

  let searchId = $state('');
  let searchBindId = $state('');
  let searchHookId = $state('');
  let searchState = $state('');
  let searchDateFrom = $state('');
  let searchDateTo = $state('');
  let loading = $state(false);
  let hasAutoSearched = $state(false);

  const limit = $workspaceStore.settings.defaultLimit;

  const hasSearchCriteria = $derived(
    searchId.trim().length > 0 ||
    searchBindId.trim().length > 0 ||
    searchHookId.trim().length > 0 ||
    searchState.trim().length > 0 ||
    searchDateFrom.length > 0 ||
    searchDateTo.length > 0
  );

  function completeTime(dateStr, isFrom = true) {
    if (!dateStr) return dateStr;

    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return isFrom ? `${dateStr} 00:00:00` : `${dateStr} 23:59:59`;
    }

    else if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      return isFrom ? `${dateStr}:00` : `${dateStr}:59`;
    }

    return dateStr;
  }

  function updateStore() {
    const searchParams = buildSearchParams();
    dlog('🔄 Updating tab searchParams:', searchParams);
    tabsStore.updateTab(tab.id, { searchParams });
  }


  // $effect(() => {
  //   const params = tab.searchParams?.searchParams || tab.searchParams;

  //   if (params && Object.keys(params).length > 0 && !hasAutoSearched) {
  //     dlog('🔄 Filling task form from searchParams:', params);
  //     hasAutoSearched = true;

  //     if (params.id) searchId = params.id;
  //     if (params.bind_id) searchBindId = params.bind_id;
  //     if (params.hook_id) searchHookId = params.hook_id;
  //     if (params.state) searchState = params.state;
  //     if (params.dt_ins_from) searchDateFrom = params.dt_ins_from;
  //     if (params.dt_ins_to) searchDateTo = params.dt_ins_to;
  //   }
  // });

  $effect(() => {
    const params = tab.searchParams?.searchParams || tab.searchParams;

    if (params && Object.keys(params).length > 0 && !hasAutoSearched) {
      dlog('🔄 Filling task form from searchParams:', params);

      if (params.id) searchId = params.id;
      if (params.bind_id) searchBindId = params.bind_id;
      if (params.hook_id) searchHookId = params.hook_id;
      if (params.state) searchState = params.state;
      if (params.dt_ins_from) searchDateFrom = params.dt_ins_from;
      if (params.dt_ins_to) searchDateTo = params.dt_ins_to;

      $effect(() => {
        if (!hasAutoSearched && hasSearchCriteria) {
          dlog('🚀 Auto-searching with criteria...');
          hasAutoSearched = true;
          handleSearch();
        }
      });
    }
  });



  $effect(() => {
    if (DEBUG) {
      dlog('🔍 TASK SEARCH STATE:', {
        searchId,
        searchBindId,
        searchHookId,
        searchState,
        searchDateFrom,
        searchDateTo,
        hasSearchCriteria
      });
    }
  });

  function buildSearchParams() {
    const searchParams = {
      meta: {
        userId: $workspaceStore.selectedUser?.id,
        limit: limit,
        offset: 0
      }
    };

    if (searchId.trim()) searchParams.id = searchId.trim();
    if (searchBindId.trim()) searchParams.bind_id = searchBindId.trim();
    if (searchHookId.trim()) searchParams.hook_id = searchHookId.trim();
    if (searchState.trim()) searchParams.state = searchState.trim();
    if (searchDateFrom) searchParams.dt_ins_from = completeTime(searchDateFrom, true);
    if (searchDateTo) searchParams.dt_ins_to = completeTime(searchDateTo, false);

    return searchParams;
  }

  async function handleSearch() {
    if (!hasSearchCriteria) {
      toast.error('Please enter search criteria');
      return;
    }

    loading = true;
    tabsStore.updateTab(tab.id, { loading: true, error: null });

    try {
      const searchParams = buildSearchParams();

      dlog('🔍 Searching tasks with params:', searchParams);

      const response = await tasksApi.search(searchParams);
      const results = response.tasks || [];

      dlog('✅ Task search results:', results);

      tabsStore.updateTab(tab.id, {
        results,
        searchParams,
        offset: results.length,
        hasMore: results.length === limit
      });

      if (results.length === 0) {
        toast.warning('No tasks found');
      } else {
        toast.success(`Found ${results.length} task(s)`);
      }
    } catch (error) {
      console.error('❌ Task search error:', error);
      tabsStore.updateTab(tab.id, { error });
      toast.error(error.message || 'Task search failed');
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

      const response = await tasksApi.search(searchParams);
      const newResults = response.tasks || [];

      tabsStore.appendResults(tab.id, newResults, limit);

      if (newResults.length > 0) {
        toast.success(`Loaded ${newResults.length} more tasks`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load more tasks');
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
    searchBindId = '';
    searchHookId = '';
    searchState = '';
    searchDateFrom = '';
    searchDateTo = '';
    updateStore();
  }

  function setQuickRange(hours) {
    const to = new Date();
    const from = new Date(to.getTime() - (hours * 60 * 60 * 1000));

    searchDateFrom = toMySQLFormat(from);
    searchDateTo = toMySQLFormat(to);
    updateStore();
  }

  function setToday() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    searchDateFrom = toMySQLFormat(startOfDay);
    searchDateTo = toMySQLFormat(endOfDay);
    updateStore();
  }

  function setYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);

    searchDateFrom = toMySQLFormat(startOfDay);
    searchDateTo = toMySQLFormat(endOfDay);
    updateStore();
  }

  function toMySQLFormat(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
</script>

<div class="search-form">
  {#if DEBUG}
    <div class="debug-info">
      <h4>🔍 Debug State</h4>
      <pre>{
        JSON.stringify({
          searchId,
          searchBindId,
          searchHookId,
          searchState,
          searchDateFrom,
          searchDateTo,
          hasSearchCriteria
        }, null, 2)
      }</pre>
    </div>
  {/if}

  <div class="search-section">
    <h4>Search Tasks</h4>
    <div class="search-grid">
      <sl-input
        placeholder="Task ID"
        value={searchId}
        on:input={(e) => {
          searchId = e.target.value;
          updateStore();
        }}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="tag"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Bind ID"
        value={searchBindId}
        on:input={(e) => {
          searchBindId = e.target.value;
          updateStore();
        }}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="link"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Hook ID"
        value={searchHookId}
        on:input={(e) => {
          searchHookId = e.target.value;
          updateStore();
        }}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="code"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="State"
        value={searchState}
        on:input={(e) => {
          searchState = e.target.value;
          updateStore();
        }}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="circle"></sl-icon>
      </sl-input>

      <div class="date-range-section">
        <DateRangePicker
          bind:startDate={searchDateFrom}
          bind:endDate={searchDateTo}
          placeholderFrom="From date (YYYY-MM-DD HH:mm:ss)"
          placeholderTo="To date (YYYY-MM-DD HH:mm:ss)"
        />
      </div>
    </div>

    <div class="quick-buttons">
      <sl-button-group label="Quick time ranges">
        <sl-button size="small" variant="default" on:click={() => setQuickRange(1)}>
          Last hour
        </sl-button>
        <sl-button size="small" variant="default" on:click={() => setQuickRange(3)}>
          Last 3 hours
        </sl-button>
        <sl-button size="small" variant="default" on:click={() => setQuickRange(12)}>
          Last 12 hours
        </sl-button>
        <sl-button size="small" variant="default" on:click={() => setQuickRange(24)}>
          Last 24 hours
        </sl-button>
        <sl-button size="small" variant="default" on:click={setToday}>
          Today
        </sl-button>
        <sl-button size="small" variant="default" on:click={setYesterday}>
          Yesterday
        </sl-button>
      </sl-button-group>
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
      disabled={!hasSearchCriteria}
      on:click={handleSearch}
    >
      <sl-icon slot="prefix" name="search"></sl-icon>
      Search Tasks
    </sl-button>
  </div>

  {#if tab.hasMore}
    <div class="load-more">
      <sl-button variant="default" on:click={handleLoadMore} loading={loading}>
        Load more tasks...
      </sl-button>
    </div>
  {/if}
</div>

<style>
  .search-form {
    margin-bottom: 1rem;
  }

  .debug-info {
    background: var(--sl-color-neutral-100);
    border: 1px solid var(--sl-color-neutral-300);
    border-radius: var(--sl-border-radius-medium);
    padding: 1rem;
    margin-bottom: 1rem;
    font-size: 0.8rem;
  }

  .debug-info h4 {
    margin: 0 0 0.5rem 0;
    color: var(--sl-color-neutral-600);
  }

  .debug-info pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
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

  .search-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .date-range-section {
    grid-column: 1 / -1;
  }

  .quick-buttons {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--sl-color-neutral-200);
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

    .quick-buttons sl-button-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>