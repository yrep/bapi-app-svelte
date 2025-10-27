<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, workspaces, isLoading, checkAuth } from '$lib/stores/app';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { browser } from '$app/environment';

  let showDeleteConfirm = false;
  let workspaceToDelete = null;
  let pageLoading = true;

  onMount(async () => {
    const authenticated = await checkAuth();

    if (!authenticated) {
      goto('/login');
      return;
    }

    pageLoading = false;
  });

  function createWorkspace() {
    const id = Date.now().toString();
    const workspace = {
      id,
      name: `Issue ${$workspaces.length + 1}`,
      createdAt: new Date().toISOString(),
      data: {}
    };

    workspaces.update(ws => [...ws, workspace]);
  }

  function openWorkspace(id) {
    goto(`/workspace/${id}`);
  }

  function confirmDeleteWorkspace(workspace, event) {
    event.stopPropagation();
    workspaceToDelete = workspace;
    showDeleteConfirm = true;
  }

  // function deleteWorkspace() {
  //   if (workspaceToDelete) {
  //     workspaces.update(ws => ws.filter(w => w.id !== workspaceToDelete.id));
  //     showDeleteConfirm = false;
  //     workspaceToDelete = null;
  //   }
  // }

  // function deleteAllWorkspaces() {
  //   workspaces.set([]);
  //   showDeleteConfirm = false;
  // }

function deleteWorkspace() {
  if (workspaceToDelete) {

    workspaceStore.clearWorkspaceState(workspaceToDelete.id);
    
    workspaces.update(ws => ws.filter(w => w.id !== workspaceToDelete.id));
    showDeleteConfirm = false;
    workspaceToDelete = null;
  }
}

function deleteAllWorkspaces() {
  if (browser) {
    $workspaces.forEach(workspace => {
      workspaceStore.clearWorkspaceState(workspace.id);
    });
  }
  
  workspaces.set([]);
  showDeleteConfirm = false;
}

  async function logout() {
    isLoading.set(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      isLoading.set(false);
      goto('/login');
    }
  }

  function getWorkspaceInitial(name) {
    return name.charAt(0).toUpperCase();
  }
</script>

<svelte:head>
  <title>Workspaces - Bapi</title>
</svelte:head>

{#if pageLoading}
  <div class="loading-overlay">
    <sl-spinner style="font-size: 2rem;"></sl-spinner>
    <p>Checking authentication...</p>
  </div>
{:else}
  <div class="dashboard">
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <sl-icon name="folder"></sl-icon>
          <h1>Bapi Workspaces</h1>
        </div>

        <div class="header-actions">
          <div class="user-info">
            <sl-icon name="person-circle"></sl-icon>
            <span>Role: {$user?.role || 'Unknown'}</span>
          </div>
          <sl-button variant="default" on:click={logout} loading={$isLoading}>
            <sl-icon slot="prefix" name="box-arrow-right"></sl-icon>
            Logout
          </sl-button>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="workspaces-section">
        <div class="section-header">
          <h2>Your Workspaces</h2>
          <sl-button variant="neutral" on:click={deleteAllWorkspaces} disabled={$workspaces.length === 0}>
            <sl-icon slot="prefix" name="trash"></sl-icon>
            Delete All
          </sl-button>
        </div>

        {#if $workspaces.length === 0}
          <div class="empty-state">
            <sl-icon name="folder-x" style="font-size: 3rem; color: var(--sl-color-neutral-400);"></sl-icon>
            <h3>No workspaces yet</h3>
            <p>Create your first workspace to get started</p>
          </div>
        {:else}
          <div class="workspaces-grid">
            {#each $workspaces as workspace (workspace.id)}
              <sl-card class="workspace-card" on:click={() => openWorkspace(workspace.id)}>
                <div class="workspace-header">
                  <div class="workspace-avatar">
                    {getWorkspaceInitial(workspace.name)}
                  </div>
                  <div class="workspace-info">
                    <h3>{workspace.name}</h3>
                    <span class="workspace-date">
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div class="workspace-actions" slot="footer">
                  <sl-icon-button
                    name="trash"
                    label="Delete workspace"
                    on:click|stopPropagation={(e) => confirmDeleteWorkspace(workspace, e)}
                  ></sl-icon-button>
                </div>
              </sl-card>
            {/each}
          </div>
        {/if}

        <!-- Add Workspace Card -->
        <div class="add-workspace-container">
          <sl-card class="workspace-card add-workspace" on:click={createWorkspace}>
            <div class="add-workspace-content">
              <sl-icon name="plus-circle"></sl-icon>
              <span>Add New Workspace</span>
            </div>
          </sl-card>
        </div>
      </div>
    </main>
  </div>

  <!-- Delete Confirmation Dialog -->
  <sl-dialog label="Delete Workspace" open={showDeleteConfirm}>
    Are you sure you want to delete workspace "{workspaceToDelete?.name}"?

    <div slot="footer">
      <sl-button variant="neutral" on:click={() => showDeleteConfirm = false}>
        Cancel
      </sl-button>
      <sl-button variant="danger" on:click={deleteWorkspace}>
        <sl-icon slot="prefix" name="trash"></sl-icon>
        Delete
      </sl-button>
    </div>
  </sl-dialog>
{/if}

<style>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    gap: 1rem;
  }

  .dashboard {
    min-height: 100vh;
    background-color: var(--sl-color-neutral-50);
  }

  .header {
    background: white;
    border-bottom: 1px solid var(--sl-color-neutral-200);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-title h1 {
    margin: 0;
    color: var(--sl-color-neutral-800);
    font-size: 1.5rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--sl-color-neutral-600);
    font-size: 0.9rem;
  }

  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .section-header h2 {
    margin: 0;
    color: var(--sl-color-neutral-700);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--sl-color-neutral-500);
  }

  .empty-state h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--sl-color-neutral-600);
  }

  .workspaces-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .add-workspace-container {
    display: flex;
    justify-content: center;
  }

  .workspace-card {
    cursor: pointer;
    transition: all 0.3s ease;
    height: 140px;
    display: flex;
    flex-direction: column;
  }

  .workspace-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--sl-shadow-medium);
  }

  .workspace-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .workspace-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--sl-color-primary-500);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .workspace-info {
    flex: 1;
    min-width: 0;
  }

  .workspace-info h3 {
    margin: 0 0 0.25rem 0;
    color: var(--sl-color-neutral-800);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .workspace-date {
    color: var(--sl-color-neutral-500);
    font-size: 0.8rem;
  }

  .workspace-actions {
    display: flex;
    justify-content: flex-end;
  }

  .add-workspace {
    background: var(--sl-color-primary-50);
    border: 2px dashed var(--sl-color-primary-300);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 300px;
  }

  .add-workspace-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--sl-color-primary-600);
    text-align: center;
  }

  .add-workspace sl-icon {
    font-size: 3rem;
  }

  .add-workspace:hover {
    background: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-500);
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .workspaces-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .add-workspace {
      width: 100%;
    }
  }
</style>