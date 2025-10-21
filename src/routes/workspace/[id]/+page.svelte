<script>
  import { onMount, afterUpdate } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { workspaces } from '$lib/stores/app';
  import { workspaceStore } from '$lib/stores/_workspace.js';
  import { tabsStore } from '$lib/stores/tabs.js';
  import { toast } from '$lib/stores/toast';
  
  import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
  import TabsBar from '$lib/components/workspace/TabsBar.svelte';
  import Tab from '$lib/components/workspace/tab/Tab.svelte';

  let workspace = null;

  // Отладка tabsStore
  $: {
    console.log('🔴 Workspace page - tabsStore updated:', {
      tabsCount: $tabsStore.length,
      activeTabs: $tabsStore.filter(t => t.active),
      allTabs: $tabsStore
    });
  }

  onMount(() => {
    console.log('=== WORKSPACE PAGE MOUNTED ===');
    workspace = $workspaces.find(w => w.id === $page.params.id);
    
    if (!workspace) {
      toast.error('Workspace not found');
      goto('/');
      return;
    }

    const restored = workspaceStore.restoreState(workspace.id);
    workspaceStore.setWorkspace(workspace, workspace.type);
  });
</script>

<svelte:head>
  <title>{workspace?.name || 'Workspace'} - Bapi</title>
</svelte:head>

{#if workspace}
  <div class="workspace-page">
    <WorkspaceHeader {workspace} />
    <TabsBar /> <!-- ← ИСПОЛЬЗУЕМ НОВЫЙ КОМПОНЕНТ -->
    
    <main class="main">
      <div class="tab-content-area">
        {#each $tabsStore as tab (tab.id)}
          {#if tab.active}
            <Tab {tab} /> <!-- ← Переименовали TabContent в Tab -->
          {/if}
        {/each}
      </div>
    </main>
  </div>
{/if}

<style>
  .workspace-page {
    min-height: 100vh;
    background-color: var(--sl-color-neutral-50);
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .tab-content-area {
    flex: 1;
    padding: 1rem;
    overflow: auto;
  }
</style>