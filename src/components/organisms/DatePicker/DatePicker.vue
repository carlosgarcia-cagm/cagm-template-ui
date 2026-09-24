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
</script>

<template>
  <CalendarRoot v-slot="{ weekDays, grid }" v-model="calendarValue" class="cagm-datepicker" :weekday-format="'short'">
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
            <CalendarCellTrigger :day="weekDate" :month="month.value" class="cagm-datepicker-day" />
          </CalendarCell>
        </CalendarGridRow>
      </CalendarGridBody>
    </CalendarGrid>
  </CalendarRoot>
</template>

<style scoped>
.cagm-datepicker {
  font-family: var(--font-body);
  color: var(--color-text);
  width: fit-content;
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
  width: var(--table-cell-padding-x, 2.25rem);
  min-width: 2.25rem;
  padding: var(--table-cell-padding-y, 0.375rem) 0;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.cagm-datepicker-cell {
  min-width: 2.25rem;
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
