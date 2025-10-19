<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { workspaces } from '$lib/stores/app';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { tabsStore } from '$lib/stores/tabs.js';
  import { toast } from '$lib/stores/toast';
  
  import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
  import WorkspaceTabs from '$lib/components/workspace/WorkspaceTabs.svelte';
  import TabContent from '$lib/components/workspace/tab/TabContent.svelte';

  let workspace = null;

  onMount(() => {
    workspace = $workspaces.find(w => w.id === $page.params.id);

    if (!workspace) {
      toast.error('Workspace not found');
      goto('/');
      return;
    }

    // Пытаемся восстановить состояние
    const restored = workspaceStore.restoreState(workspace.id);
    
    if (!restored) {
      // Если не восстановили, создаем новое workspace
      workspaceStore.setWorkspace(workspace, workspace.type);
    } else {
      workspaceStore.setWorkspace(workspace, workspace.type);
    }
  });
</script>

<svelte:head>
  <title>{workspace?.name || 'Workspace'} - Bapi</title>
</svelte:head>

{#if workspace}
  <div class="workspace-page">
    <WorkspaceHeader {workspace} />
    <WorkspaceTabs />
    
    <main class="main">
      <div class="tab-content-area">
        {#each $tabsStore as tab (tab.id)}
          {#if tab.active}
            <TabContent {tab} />
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
  }

  .tab-content-area {
    height: 100%;
    padding: 1rem;
  }
</style>