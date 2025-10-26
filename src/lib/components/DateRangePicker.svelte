<script>
  import { onMount, onDestroy } from 'svelte';
  import AirDatepicker from 'air-datepicker';
  import 'air-datepicker/air-datepicker.css';
  import localeEn from 'air-datepicker/locale/en';

  let { startDate, endDate, placeholderFrom = "From", placeholderTo = "To" } = $props();

  let fromInputElement;
  let toInputElement;
  let fromDatepicker;
  let toDatepicker;

  onMount(() => {
    // Initialize From datepicker
    fromDatepicker = new AirDatepicker(fromInputElement, {
      locale: localeEn,
      selectedDates: startDate ? [startDate] : [],
      timepicker: true,
      onSelect: ({ date }) => {
        if (date instanceof Date) {
          startDate = date;
          // If To date is before From date, adjust To date
          if (endDate && date > endDate) {
            endDate = new Date(date.getTime() + 60 * 60 * 1000); // +1 hour
            if (toDatepicker && toDatepicker.selectedDates) {
              toDatepicker.selectedDates = [endDate];
            }
          }
        } else {
          startDate = null;
        }
      }
    });

    // Initialize To datepicker
    toDatepicker = new AirDatepicker(toInputElement, {
      locale: localeEn,
      selectedDates: endDate ? [endDate] : [],
      timepicker: true,
      onSelect: ({ date }) => {
        if (date instanceof Date) {
          endDate = date;
          // If From date is after To date, adjust From date
          if (startDate && date < startDate) {
            startDate = new Date(date.getTime() - 60 * 60 * 1000); // -1 hour
            if (fromDatepicker && fromDatepicker.selectedDates) {
              fromDatepicker.selectedDates = [startDate];
            }
          }
        } else {
          endDate = null;
        }
      }
    });
  });

  onDestroy(() => {
    if (fromDatepicker) fromDatepicker.destroy();
    if (toDatepicker) toDatepicker.destroy();
  });

  $effect(() => {
    if (fromDatepicker && startDate) {
      fromDatepicker.selectedDates = [startDate];
    } else if (fromDatepicker && startDate === null) {
      fromDatepicker.selectedDates = [];
    }
  });

  $effect(() => {
    if (toDatepicker && endDate) {
      toDatepicker.selectedDates = [endDate];
    } else if (toDatepicker && endDate === null) {
      toDatepicker.selectedDates = [];
    }
  });

  function formatDisplayDate(date) {
    if (!date) return '';
    return date.toLocaleString();
  }
</script>

<div class="date-range-picker">
  <div class="date-inputs">
    <div class="date-input-group">
      <label>From:</label>
      <input
        bind:this={fromInputElement}
        placeholder={placeholderFrom}
        readonly
        value={formatDisplayDate(startDate)}
        class="date-input"
      />
    </div>
    
    <div class="date-input-group">
      <label>To:</label>
      <input
        bind:this={toInputElement}
        placeholder={placeholderTo}
        readonly
        value={formatDisplayDate(endDate)}
        class="date-input"
      />
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
    gap: 0.5rem;
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

  .date-input {
    padding: 0.5rem;
    border: 1px solid var(--sl-color-neutral-300);
    border-radius: var(--sl-border-radius-medium);
    background: var(--sl-color-neutral-0);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .date-input:focus {
    border-color: var(--sl-color-primary-500);
    outline: none;
    box-shadow: 0 0 0 3px var(--sl-color-primary-300);
  }

  .date-input::placeholder {
    color: var(--sl-color-neutral-400);
  }

  @media (max-width: 768px) {
    .date-inputs {
      grid-template-columns: 1fr;
    }
  }
</style>