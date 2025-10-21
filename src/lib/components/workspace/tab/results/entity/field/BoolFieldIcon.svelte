<script>
  export let value;
  
  // Преобразуем различные форматы boolean значений
  $: booleanValue = value === '1' || value === 1 || value === true || value === 'true';
</script>

<sl-icon 
  name={booleanValue ? 'check' : 'x'} 
  class={booleanValue ? 'bool-true' : 'bool-false'}
></sl-icon>

<style>
  .bool-true {
    color: var(--sl-color-success-600);
  }

  .bool-false {
    color: var(--sl-color-danger-600);
  }
</style>