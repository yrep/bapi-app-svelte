<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { workspaceStore } from '$lib/stores/workspace.js';
  import { tabsStore } from '$lib/stores/tabs.js';
  import { setupTestUser, DEBUG } from '$lib/utils/debug.js';

  export let workspace;

  let showSettings = false;

 onMount(() => {
    console.log('DEBUG mode:', DEBUG);
    console.log('Current selectedUser:', $workspaceStore.selectedUser);
    
    if (!$workspaceStore.selectedUser) {
      const testUser = setupTestUser();
      console.log('Test user from setup:', testUser);
      if (testUser) {
        workspaceStore.setSelectedUser(testUser);
      }
    }
  });


  function toggleSettings() {
    showSettings = !showSettings;
  }

  function clearSelectedUser() {
    workspaceStore.clearSelectedUser();
  }
</script>

<header class="header">
  <div class="header-content">
    <div class="back-button">
      <sl-icon-button
        name="arrow-left"
        label="Back to workspaces"
        on:click={() => goto('/')}
      ></sl-icon-button>
      <div class="workspace-info">
        <h1>{workspace.name}</h1>
        <div class="selected-user">
          {#if $workspaceStore.selectedUser}
            <sl-tag variant="primary" size="small">
              <sl-icon name="person" slot="prefix"></sl-icon>
              User: {$workspaceStore.selectedUser.id}
              <sl-icon-button 
                name="x" 
                label="Clear user"
                size="small"
                on:click={clearSelectedUser}
              ></sl-icon-button>
            </sl-tag>
          {:else}
            <sl-tag variant="neutral" size="small">
              <sl-icon name="person" slot="prefix"></sl-icon>
              user is not set
            </sl-tag>
          {/if}
        </div>
      </div>
    </div>

    <div class="workspace-actions">
      <sl-button variant="neutral" on:click={() => goto('/')}>
        <sl-icon slot="prefix" name="house"></sl-icon>
        Dashboard
      </sl-button>
      <sl-icon-button
        name="gear"
        label="Workspace settings"
        on:click={toggleSettings}
      ></sl-icon-button>
    </div>
  </div>

  {#if showSettings}
    <div class="settings-overlay" on:click={toggleSettings}>
      <div class="settings-modal" on:click|stopPropagation>
        <h2>Workspace Settings</h2>
        
        <sl-switch
          checked={$workspaceStore.settings.saveTabChain}
          on:sl-change={(e) => workspaceStore.updateSettings({ saveTabChain: e.target.checked })}
        >
          Save tab chain
        </sl-switch>

        <sl-input
          label="Default limit"
          type="number"
          min="1"
          max="1000"
          value={$workspaceStore.settings.defaultLimit}
          on:sl-input={(e) => workspaceStore.updateSettings({ defaultLimit: parseInt(e.target.value) || 100 })}
        ></sl-input>

        <div class="settings-actions">
          <sl-button variant="neutral" on:click={toggleSettings}>Close</sl-button>
        </div>
      </div>
    </div>
  {/if}
</header>

<style>
  .header {
    background: white;
    border-bottom: 1px solid var(--sl-color-neutral-200);
    padding: 1rem 0;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .workspace-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .back-button h1 {
    margin: 0;
    color: var(--sl-color-neutral-800);
  }

  .selected-user {
    display: flex;
    align-items: center;
  }

  .workspace-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .settings-modal {
    background: white;
    padding: 1.5rem;
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-large);
    width: 90%;
    max-width: 400px;
  }

  .settings-modal h2 {
    margin: 0 0 1rem 0;
  }

  .settings-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
</style>