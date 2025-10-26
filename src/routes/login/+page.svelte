<script>
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated, isLoading } from '$lib/stores/app';
  import { authApi } from '$lib/utils/api.js';

  let userKey = '';
  let error = '';
  let inputElement;

  onMount(async () => {
    if ($isAuthenticated) {
      goto('/');
    }

    await tick();
    if (inputElement) {
      inputElement.focus();
    }
  });

  async function handleLogin() {
    if (!userKey.trim()) {
      error = 'Please enter your user key';
      return;
    }

    isLoading.set(true);
    error = '';

    try {
      const result = await authApi.login(userKey.trim());

      if (result.success) {
        isAuthenticated.set(true);
        await tick();
        goto('/');
      }
    } catch (err) {
      error = err.message || 'Authentication failed';
    } finally {
      isLoading.set(false);
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <title>Login - Bapi</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <sl-icon name="shield-lock"></sl-icon>
      <h1>Bapi Login</h1>
      <p>Enter your user key to access the Binder API tool</p>
    </div>

    <form on:submit|preventDefault={handleLogin}>
      <sl-input
        bind:this={inputElement}
        label="User Key"
        type="password"
        placeholder="Enter your secure user key"
        help-text="Contact administrator if you don't have a key"
        value={userKey}
        on:sl-input={(e) => userKey = e.target.value}
        on:keypress={handleKeyPress}
        autofocus
      ></sl-input>

      {#if error}
        <sl-alert variant="danger" open class="error-alert">
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          {error}
        </sl-alert>
      {/if}

      <sl-button
        variant="primary"
        type="submit"
        loading={$isLoading}
        class="login-button"
      >
        {#if $isLoading}
          Authenticating...
        {:else}
          Authorize Me
        {/if}
      </sl-button>
    </form>

    <div class="test-keys">
      <h3>Test Keys:</h3>
      <ul>
        <li><strong>admin_key</strong> - Full access</li>
        <li><strong>support_key</strong> - Support engineer</li>
        <li><strong>firstline_key</strong> - First line support</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background: linear-gradient(135deg, var(--sl-color-primary-50) 0%, var(--sl-color-neutral-50) 100%);
  }

  .login-card {
    background: white;
    padding: 2rem;
    border-radius: var(--sl-border-radius-large);
    box-shadow: var(--sl-shadow-x-large);
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-header sl-icon {
    font-size: 3rem;
    color: var(--sl-color-primary-500);
    margin-bottom: 1rem;
  }

  .login-header h1 {
    margin: 0 0 0.5rem 0;
    color: var(--sl-color-neutral-800);
    font-size: 1.5rem;
  }

  .login-header p {
    margin: 0;
    color: var(--sl-color-neutral-600);
    font-size: 0.9rem;
  }

  .error-alert {
    margin-top: 1rem;
  }

  .login-button {
    width: 100%;
    margin-top: 1rem;
  }

  .test-keys {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--sl-color-neutral-200);
  }

  .test-keys h3 {
    margin: 0 0 0.5rem 0;
    color: var(--sl-color-neutral-700);
    font-size: 0.9rem;
  }

  .test-keys ul {
    margin: 0;
    padding-left: 1rem;
    color: var(--sl-color-neutral-600);
    font-size: 0.8rem;
  }

  .test-keys li {
    margin-bottom: 0.25rem;
  }
</style>