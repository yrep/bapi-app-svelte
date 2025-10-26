<script>
  import { onMount, onDestroy } from 'svelte';
  import AirDatepicker from 'air-datepicker';
  import 'air-datepicker/air-datepicker.css';

  let { startDate = $bindable(), endDate = $bindable(), placeholderFrom = "From date...", placeholderTo = "To date..." } = $props();

  let fromInputElement;
  let toInputElement;
  let fromDatepicker;
  let toDatepicker;

  // Функция для преобразования Date в MySQL формат
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

  // Функция для парсинга даты из строки (пробуем разные форматы)
  function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Пробуем MySQL формат: YYYY-MM-DD HH:mm:ss
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
    
    // Пробуем формат с точками: DD.MM.YYYY
    const dotMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (dotMatch) {
      const [, day, month, year] = dotMatch;
      date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  }

  function handleFromInput(e) {
    startDate = e.target.value;
  }

  function handleToInput(e) {
    endDate = e.target.value;
  }

  onMount(() => {
    const isMobile = window.innerWidth <= 420;
    
    fromDatepicker = new AirDatepicker(fromInputElement, {
      isMobile: isMobile,
      timepicker: true,
      onSelect: ({ date }) => {
        startDate = toMySQLFormat(date);
      }
    });

    toDatepicker = new AirDatepicker(toInputElement, {
      isMobile: isMobile,
      timepicker: true,
      onSelect: ({ date }) => {
        endDate = toMySQLFormat(date);
      }
    });

    // Заполняем пикеры текущими значениями
    if (startDate) {
      const date = parseDate(startDate);
      if (date) fromDatepicker.selectDate(date);
    }
    
    if (endDate) {
      const date = parseDate(endDate);
      if (date) toDatepicker.selectDate(date);
    }
  });

  function openFromPicker() {
    if (fromDatepicker) fromDatepicker.show();
  }

  function openToPicker() {
    if (toDatepicker) toDatepicker.show();
  }

  onDestroy(() => {
    if (fromDatepicker) fromDatepicker.destroy();
    if (toDatepicker) toDatepicker.destroy();
  });

  function setFromNow() {
    startDate = toMySQLFormat(new Date());
  }

  function setToNow() {
    endDate = toMySQLFormat(new Date());
  }

  function clearFrom() {
    startDate = '';
  }

  function clearTo() {
    endDate = '';
  }
</script>

<div class="date-range-picker">
  <div class="date-inputs">
    <div class="date-input-group">
      <label>From:</label>
      <div class="input-with-picker">
        <input
          bind:this={fromInputElement}
          type="text"
          on:input={handleFromInput}
          placeholder={placeholderFrom}
          class="date-input"
          value={startDate}
        />
        <div class="picker-buttons">
          <sl-icon-button 
            name="clock"
            label="Set to now"
            on:click={setFromNow}
            class="picker-button"
          ></sl-icon-button>
          <sl-icon-button 
            name="calendar"
            label="Open date picker"
            on:click={openFromPicker}
            class="picker-button"
          ></sl-icon-button>
          <sl-icon-button 
            name="x-circle"
            label="Clear"
            on:click={clearFrom}
            class="picker-button"
          ></sl-icon-button>
        </div>
      </div>
    </div>
    
    <div class="date-input-group">
      <label>To:</label>
      <div class="input-with-picker">
        <input
          bind:this={toInputElement}
          type="text"
          on:input={handleToInput}
          placeholder={placeholderTo}
          class="date-input"
          value={endDate}
        />
        <div class="picker-buttons">
          <sl-icon-button 
            name="clock"
            label="Set to now"
            on:click={setToNow}
            class="picker-button"
          ></sl-icon-button>
          <sl-icon-button 
            name="calendar"
            label="Open date picker"
            on:click={openToPicker}
            class="picker-button"
          ></sl-icon-button>
          <sl-icon-button 
            name="x-circle"
            label="Clear"
            on:click={clearTo}
            class="picker-button"
          ></sl-icon-button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .date-range-picker {
    width: 100%;
  }

  .date-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .date-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .date-input-group label {
    font-size: 0.8rem;
    color: var(--sl-color-neutral-600);
    font-weight: 500;
  }

  .input-with-picker {
    position: relative;
    display: flex;
    align-items: center;
  }

  .date-input {
    padding: 0.5rem;
    border: 1px solid var(--sl-color-neutral-300);
    border-radius: var(--sl-border-radius-medium);
    background: var(--sl-color-neutral-0);
    font-size: 0.875rem;
    flex: 1;
    padding-right: 7rem;
  }

  .date-input:focus {
    border-color: var(--sl-color-primary-500);
    outline: none;
    box-shadow: 0 0 0 3px var(--sl-color-primary-300);
  }

  .date-input::placeholder {
    color: var(--sl-color-neutral-400);
    font-size: 0.8rem;
  }

  .picker-buttons {
    position: absolute;
    right: 0.25rem;
    display: flex;
    gap: 0.1rem;
  }

  .picker-button {
    background: none;
    border: none;
    color: var(--sl-color-neutral-400);
    cursor: pointer;
    padding: 0.2rem;
  }

  .picker-button:hover {
    color: var(--sl-color-primary-500);
  }

  @media (max-width: 768px) {
    .date-inputs {
      grid-template-columns: 1fr;
    }
    
    .date-input {
      padding-right: 6rem;
    }
  }
</style>