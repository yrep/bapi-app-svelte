<script>
  import { tabsStore } from '$lib/stores/tabs.js';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { tasksApi } from '$lib/utils/api.js';
  import { toast } from '$lib/stores/toast.js';
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';

  let { tab } = $props();

  // Reactive state
  let searchId = $state('');
  let searchBindId = $state('');
  let searchHookId = $state('');
  let searchState = $state('');
  let searchDateFrom = $state(null);
  let searchDateTo = $state(null);
  let loading = $state(false);
  let hasAutoSearched = $state(false);

  const limit = $workspaceStore.settings.defaultLimit;

  // Derived values
  const hasSearchCriteria = $derived(
    searchId.trim().length > 0 ||
    searchBindId.trim().length > 0 ||
    searchHookId.trim().length > 0 ||
    searchState.trim().length > 0 ||
    searchDateFrom !== null ||
    searchDateTo !== null
  );

  // Effects
  $effect(() => {
    console.log('🔍 Task search form state:', {
      searchId: searchId.trim(),
      searchBindId: searchBindId.trim(),
      searchHookId: searchHookId.trim(),
      searchState: searchState.trim(),
      searchDateFrom,
      searchDateTo,
      hasSearchCriteria
    });
  });

  $effect(() => {
    const params = tab.searchParams?.searchParams || tab.searchParams;
    
    if (params && Object.keys(params).length > 0 && !hasAutoSearched) {
      console.log('🔄 Filling task form from searchParams:', params);
      hasAutoSearched = true;
      
      // Заполняем поля формы из searchParams
      if (params.id) searchId = params.id;
      if (params.bind_id) searchBindId = params.bind_id;
      if (params.hook_id) searchHookId = params.hook_id;
      if (params.state) searchState = params.state;
      if (params.dt_ins_from) searchDateFrom = new Date(params.dt_ins_from);
      if (params.dt_ins_to) searchDateTo = new Date(params.dt_ins_to);
      
      setTimeout(() => {
        if (hasSearchCriteria && !loading) {
          console.log('🔍 Auto-searching tasks with filled form');
          handleSearch();
        } else {
          console.log('❌ Cannot auto-search tasks:', { hasSearchCriteria, loading });
        }
      }, 100);
    }
  });

  // Methods
  function formatDateForAPI(date) {
    if (!date) return null;
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  async function handleSearch() {
    if (!hasSearchCriteria) {
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
      if (searchId.trim()) searchParams.id = searchId.trim();
      if (searchBindId.trim()) searchParams.bind_id = searchBindId.trim();
      if (searchHookId.trim()) searchParams.hook_id = searchHookId.trim();
      if (searchState.trim()) searchParams.state = searchState.trim();
      if (searchDateFrom) searchParams.dt_ins_from = formatDateForAPI(searchDateFrom);
      if (searchDateTo) searchParams.dt_ins_to = formatDateForAPI(searchDateTo);

      console.log('🔍 Searching tasks with params:', searchParams);

      const response = await tasksApi.search(searchParams);
      const results = response.tasks || [];

      console.log('✅ Task search results:', results);

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
    searchDateFrom = null;
    searchDateTo = null;
    
    tabsStore.updateTab(tab.id, { 
      results: [],
      searchParams: {},
      offset: 0,
      hasMore: false
    });
  }

  // Quick time range functions
  function setQuickRange(hours) {
    const to = new Date();
    const from = new Date(to.getTime() - (hours * 60 * 60 * 1000));
    
    searchDateFrom = from;
    searchDateTo = to;
  }

  function setToday() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    searchDateFrom = startOfDay;
    searchDateTo = endOfDay;
  }

  function setYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
    
    searchDateFrom = startOfDay;
    searchDateTo = endOfDay;
  }
</script>

<div class="search-form">
  <div class="search-section">
    <h4>Search Tasks</h4>
    <div class="search-grid">
      <sl-input
        placeholder="Task ID"
        value={searchId}
        on:input={(e) => searchId = e.target.value}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="tag"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Bind ID"
        value={searchBindId}
        on:input={(e) => searchBindId = e.target.value}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="link"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="Hook ID"
        value={searchHookId}
        on:input={(e) => searchHookId = e.target.value}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="hook"></sl-icon>
      </sl-input>

      <sl-input
        placeholder="State"
        value={searchState}
        on:input={(e) => searchState = e.target.value}
        on:keypress={handleKeyPress}
      >
        <sl-icon slot="prefix" name="circle"></sl-icon>
      </sl-input>

      <div class="date-range-section">
        <DateRangePicker
          bind:startDate={searchDateFrom}
          bind:endDate={searchDateTo}
          placeholderFrom="From date"
          placeholderTo="To date"
        />
      </div>
    </div>

    <!-- Quick time range buttons -->
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