<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from 'reka-ui'
import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'

const modelValue = defineModel<Date | undefined>({ default: undefined })

/**
 * Additive extension of the original inline DatePicker:
 *  - `minValue` / `maxValue`: optional native `Date` bounds, converted to
 *    Reka `DateValue` internally. Pasted through to `CalendarRoot`.
 *  - `isDateDisabled`: optional `(date: Date) => boolean` predicate. Reka
 *    expects a `DateValue` predicate, so we adapt it on the fly.
 *  - `locale`: BCP-47 tag passed straight to `CalendarRoot` so weekday /
 *    month labels render in the caller's language.
 *  - `#day` slot: scoped `{ day, month }` for custom day-cell rendering.
 *    The fallback renders the built-in `CalendarCellTrigger`, so existing
 *    consumers without a slot keep the default look.
 */
const props = withDefaults(
  defineProps<{
    minValue?: Date
    maxValue?: Date
    isDateDisabled?: (date: Date) => boolean
    locale?: string
  }>(),
  {
    minValue: undefined,
    maxValue: undefined,
    isDateDisabled: undefined,
    locale: undefined,
  },
)

function toDateValue(date: Date | undefined): DateValue | undefined {
  if (!date) return undefined
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function toNativeDate(value: DateValue | undefined): Date | undefined {
  if (!value) return undefined
  return value.toDate(getLocalTimeZone())
}

const calendarValue = computed<DateValue | undefined>({
  get: () => toDateValue(modelValue.value),
  set: (value) => {
    modelValue.value = toNativeDate(value)
  },
})

/**
 * Reka expects `minValue` / `maxValue` as `DateValue`. We accept native
 * `Date` on the public API for symmetry with `modelValue: Date` and convert
 * here. The computed is `undefined` when the prop is omitted so Reka falls
 * back to its default (no bound).
 */
const minDateValue = computed<DateValue | undefined>(() => toDateValue(props.minValue))
const maxDateValue = computed<DateValue | undefined>(() => toDateValue(props.maxValue))

/**
 * Adapt the consumer's `(date: Date) => boolean` predicate to Reka's
 * `(date: DateValue) => boolean` shape. We allocate a `CalendarDate` from
 * the DateValue year/month/day so the predicate sees the same calendar
 * day the consumer expects (modulo the local timezone).
 */
const isDateDisabledAdapter = computed(() => {
  const predicate = props.isDateDisabled
  if (!predicate) return undefined
  return (value: DateValue) => {
    const native = value.toDate(getLocalTimeZone())
    return predicate(native)
  }
})
</script>

<template>
  <!--
    Card surface: the calendar used to render bare (header + grid floating
    directly on whatever background it was placed in). Wrapping it in an
    elevated surface makes it read as "a card sitting on top of the page",
    matching the Modal/Dropdown treatment. Border + tonal background come
    from the global surface axis so the card participates in the
    outlined/flat/filled theme modes like every other component.
  -->
  <div class="cagm-datepicker-card">
    <CalendarRoot
      v-slot="{ weekDays, grid }"
      v-model="calendarValue"
      class="cagm-datepicker"
      :weekday-format="'short'"
      :min-value="minDateValue"
      :max-value="maxDateValue"
      :is-date-disabled="isDateDisabledAdapter"
      :locale="locale"
    >
      <CalendarHeader class="cagm-datepicker-header">
        <CalendarPrev class="cagm-datepicker-nav" aria-label="Previous month">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </CalendarPrev>
        <CalendarHeading class="cagm-datepicker-heading" />
        <CalendarNext class="cagm-datepicker-nav" aria-label="Next month">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </CalendarNext>
      </CalendarHeader>
      <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="cagm-datepicker-grid">
        <CalendarGridHead>
          <CalendarGridRow class="cagm-datepicker-row">
            <CalendarHeadCell v-for="day in weekDays" :key="day" class="cagm-datepicker-headcell">
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="cagm-datepicker-row">
            <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate" class="cagm-datepicker-cell">
              <!--
                `#day` wins entirely: consumers can render their own day cell
                with whatever markup they want. The fallback renders Reka's
                `CalendarCellTrigger`, which handles selection / focus /
                disabled / today / outside-view styling for us, so default
                behavior is preserved when no slot is provided.
              -->
              <slot name="day" :day="weekDate" :month="month.value">
                <CalendarCellTrigger :day="weekDate" :month="month.value" class="cagm-datepicker-day" />
              </slot>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </CalendarRoot>
  </div>
</template>

<style scoped>
/*
 * Card surface. `--color-surface-raised` + `--shadow-md` match the raised
 * treatment used by other floating surfaces (Dropdown, Modal), while the
 * border reads the global surface axis so the card switches between
 * outlined / flat / filled with the rest of the system. Width is
 * `fit-content` so the card hugs the calendar instead of stretching to
 * the parent's width.
 */
.cagm-datepicker-card {
  width: fit-content;
  padding: 1rem;
  background: var(--color-surface-raised);
  border: var(--surface-border-width) solid var(--surface-border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  font-family: var(--font-body);
  color: var(--color-text);
}

/*
 * DatePicker sizing is now driven by its own `--datepicker-cell-size`
 * custom property instead of borrowing `--table-cell-padding-*` (which is
 * the DataTable's axis). The default below matches the previous layout
 * (2.25rem) byte-for-byte, so consumers without theme overrides see no
 * visual change.
 */
.cagm-datepicker {
  font-family: var(--font-body);
  color: var(--color-text);
  width: fit-content;
  --datepicker-cell-size: 2.25rem;
}

.cagm-datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0.5rem;
}

.cagm-datepicker-heading {
  font-size: 0.9375rem;
  font-weight: 600;
}

.cagm-datepicker-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: var(--radius-card);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cagm-datepicker-nav:hover {
  background: var(--state-layer-hover);
}

.cagm-datepicker-nav:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-datepicker-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cagm-datepicker-grid {
  width: 100%;
  border-collapse: collapse;
}

.cagm-datepicker-row {
  display: flex;
}

.cagm-datepicker-headcell {
  width: var(--datepicker-cell-size);
  min-width: var(--datepicker-cell-size);
  padding: 0.375rem 0;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.cagm-datepicker-cell {
  min-width: var(--datepicker-cell-size);
  text-align: center;
  padding: 2px;
}

.cagm-datepicker-day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid transparent;
  border-radius: var(--radius-card);
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.cagm-datepicker-day:hover:not([data-disabled]) {
  background: var(--state-layer-hover);
}

.cagm-datepicker-day:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-datepicker-day[data-today]:not([data-selected]) {
  border-color: var(--color-border);
}

.cagm-datepicker-day[data-selected] {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.cagm-datepicker-day[data-outside-view] {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.cagm-datepicker-day[data-disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
