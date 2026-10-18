<script setup lang="ts" generic="T extends object">
import { computed, ref, useSlots } from 'vue'

export type DataTableAlign = 'left' | 'center' | 'right'

export interface DataTableColumn<T> {
  key: keyof T & string
  label: string
  /** Horizontal alignment applied to both the header and body cells. */
  align?: DataTableAlign
  /** CSS width for the column (e.g. '12rem', '20%'). Applied to the header cell. */
  width?: string
  /**
   * Renders a sortable header affordance and emits `sort` when activated.
   * Actual row ordering is left to the consumer.
   */
  sortable?: boolean
}

export type DataTableRowKey = string | number

export type DataTableSortDirection = 'asc' | 'desc'

export interface DataTableSort {
  key: string
  direction: DataTableSortDirection
}

// A wrapper element now hosts the optional `#toolbar` slot above the <table>,
// so inheritAttrs is disabled and $attrs is bound to the table explicitly to
// keep fallthrough attributes (e.g. `aria-label`) on the <table> as before.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn<T>[]
    rows: T[]
    /** Enables the leading checkbox column and row selection. */
    selectable?: boolean
    /**
     * Field used as the stable identity of a row for selection. Falls back to
     * the row index when omitted.
     */
    rowKey?: keyof T & string
    /** Controlled selection; use with `v-model:selected`. */
    selected?: DataTableRowKey[]
    /** Shows the `#loading` state row in the table body. */
    loading?: boolean
    /** Visually-hidden <caption> text for assistive technology. */
    caption?: string
    /**
     * Optional CSS length (e.g. '24rem') that caps the scroll container height
     * and enables the internal vertical scrollbar for tall tables. When omitted
     * the table keeps its natural height (no vertical constraint).
     */
    maxHeight?: string
  }>(),
  {
    selectable: false,
    loading: false,
    caption: 'Data table',
  },
)

const emit = defineEmits<{
  'update:selected': [selectedKeys: DataTableRowKey[]]
  'selection-change': [selectedKeys: DataTableRowKey[]]
  sort: [sort: DataTableSort]
}>()

const slots = useSlots()

const internalSelected = ref<DataTableRowKey[]>([])

const isControlled = computed(() => props.selected !== undefined)

const selectedKeys = computed<DataTableRowKey[]>(() =>
  isControlled.value ? (props.selected ?? []) : internalSelected.value,
)

// Total rendered columns incl. the leading selection and trailing actions
// columns; used as the `colspan` of the loading/empty state rows.
const columnCount = computed(
  () => props.columns.length + (props.selectable ? 1 : 0) + (slots.actions ? 1 : 0),
)

function getRowKey(row: T, index: number): DataTableRowKey {
  if (props.rowKey) return row[props.rowKey] as DataTableRowKey
  return index
}

function isSelected(row: T, index: number): boolean {
  return selectedKeys.value.includes(getRowKey(row, index))
}

function setSelection(next: DataTableRowKey[]) {
  if (!isControlled.value) internalSelected.value = next
  emit('update:selected', next)
  emit('selection-change', next)
}

function toggleRow(row: T, index: number) {
  const key = getRowKey(row, index)
  const next = selectedKeys.value.includes(key)
    ? selectedKeys.value.filter((selectedKey) => selectedKey !== key)
    : [...selectedKeys.value, key]
  setSelection(next)
}

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((row, index) => selectedKeys.value.includes(getRowKey(row, index))),
)

const someSelected = computed(
  () =>
    !allSelected.value &&
    props.rows.some((row, index) => selectedKeys.value.includes(getRowKey(row, index))),
)

function toggleAll() {
  if (allSelected.value) {
    const visibleKeys = new Set(props.rows.map((row, index) => getRowKey(row, index)))
    setSelection(selectedKeys.value.filter((key) => !visibleKeys.has(key)))
    return
  }
  const next = new Set(selectedKeys.value)
  props.rows.forEach((row, index) => next.add(getRowKey(row, index)))
  setSelection([...next])
}

// --- Sorting (UI only: emits `sort`, never reorders `rows`) -----------------
const sortState = ref<DataTableSort | null>(null)

function toggleSort(column: DataTableColumn<T>) {
  if (!column.sortable) return
  const isAscending = sortState.value?.key === column.key && sortState.value.direction === 'asc'
  const next: DataTableSort = { key: column.key, direction: isAscending ? 'desc' : 'asc' }
  sortState.value = next
  emit('sort', next)
}

function ariaSort(column: DataTableColumn<T>): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  if (sortState.value?.key !== column.key) return 'none'
  return sortState.value.direction === 'asc' ? 'ascending' : 'descending'
}

function sortIndicator(column: DataTableColumn<T>): string {
  if (sortState.value?.key !== column.key) return '↕'
  return sortState.value.direction === 'asc' ? '↑' : '↓'
}

// --- Internal scroll + pinned last column ----------------------------------
// Inline max-height only when the consumer opts in; otherwise the table keeps
// its natural height and no internal vertical scrollbar appears. Horizontal
// overflow is always available via the scroll container's `overflow: auto`.
const scrollStyle = computed(() => (props.maxHeight ? { maxHeight: props.maxHeight } : undefined))

// The last rendered column is pinned to the right edge. When an `#actions` slot
// is present it owns that trailing position; otherwise the last data column is
// pinned. An empty `columns` list (selection-only table) pins nothing, so the
// leading checkbox column is never turned sticky — the two stay independent.
function isStickyDataColumn(index: number): boolean {
  return !slots.actions && index === props.columns.length - 1
}
</script>

<template>
  <div class="data-table-wrap">
    <div v-if="$slots.toolbar" class="data-table__toolbar">
      <slot name="toolbar" />
    </div>

    <div class="data-table__scroll" :style="scrollStyle">
      <table class="data-table" v-bind="$attrs">
        <caption class="sr-only">
          {{ caption }}
        </caption>
        <thead>
          <tr>
            <th v-if="selectable" scope="col" class="data-table__select-head">
              <input
                type="checkbox"
                class="data-table__checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                :aria-label="allSelected ? 'Deselect all rows' : 'Select all rows'"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              scope="col"
              :class="{ 'data-table__sticky-col': isStickyDataColumn(columnIndex) }"
              :style="{ width: column.width, textAlign: column.align }"
              :aria-sort="ariaSort(column)"
            >
              <slot
                :name="`header-${column.key}`"
                :column="column"
                :sort="sortState"
                :toggle-sort="() => toggleSort(column)"
              >
                <button
                  v-if="column.sortable"
                  type="button"
                  class="data-table__sort"
                  @click="toggleSort(column)"
                >
                  <span>{{ column.label }}</span>
                  <span class="data-table__sort-indicator" aria-hidden="true">
                    {{ sortIndicator(column) }}
                  </span>
                </button>
                <template v-else>{{ column.label }}</template>
              </slot>
            </th>
            <th
              v-if="$slots.actions"
              scope="col"
              class="data-table__actions-head data-table__sticky-col"
            >
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="data-table__state-row data-table__loading-row">
            <td :colspan="columnCount">
              <slot name="loading">
                <span class="data-table__spinner" role="status">
                  <span class="sr-only">Loading…</span>
                </span>
              </slot>
            </td>
          </tr>
          <tr v-else-if="rows.length === 0" class="data-table__state-row data-table__empty-row">
            <td :colspan="columnCount">
              <slot name="empty">
                <span class="data-table__empty-text">No data</span>
              </slot>
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, rowIndex) in rows"
              :key="getRowKey(row, rowIndex)"
              :class="{ 'data-table__row--selected': selectable && isSelected(row, rowIndex) }"
            >
              <td v-if="selectable" class="data-table__select-cell">
                <input
                  type="checkbox"
                  class="data-table__checkbox"
                  :checked="isSelected(row, rowIndex)"
                  :aria-label="`Select row ${rowIndex + 1}`"
                  @change="toggleRow(row, rowIndex)"
                />
              </td>
              <td
                v-for="(column, columnIndex) in columns"
                :key="column.key"
                :class="{ 'data-table__sticky-col': isStickyDataColumn(columnIndex) }"
                :style="{ textAlign: column.align }"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :index="rowIndex"
                  :value="row[column.key]"
                >
                  {{ row[column.key] }}
                </slot>
              </td>
              <td
                v-if="$slots.actions"
                class="data-table__actions-cell data-table__sticky-col"
              >
                <slot name="actions" :row="row" :index="rowIndex" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.data-table-wrap {
  display: block;
}

.data-table__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

/*
 * Scroll container: clips the rounded corners (moved off the <table>, which is
 * no longer a scrollport) and provides the internal overflow. As the nearest
 * scrollport it is also what the pinned column's `position: sticky` is resolved
 * against. `max-height` is applied inline only when the `maxHeight` prop is set,
 * so tall tables cap their own height while shorter ones stay unconstrained.
 */
.data-table__scroll {
  overflow: auto;
  border-radius: var(--radius-card);
}

/*
 * `border-collapse: separate` (spacing 0) is deliberate: with collapsed borders
 * the browser paints cell borders onto the table grid, so a sticky cell's
 * borders detach from it as it moves. Only bottom borders are set, so the
 * separated rendering is visually identical to the previous collapsed one.
 */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-surface);
}

.data-table thead {
  background: var(--color-surface-raised);
}

.data-table th {
  text-align: left;
  font-weight: 600;
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: var(--surface-border-width) solid var(--surface-border-color);
  white-space: nowrap;
}

.data-table td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: var(--surface-border-width) solid var(--surface-border-color);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/*
 * Row-wide states: the background lives on the <tr> so it spans every cell
 * (including the checkbox and actions columns), never just the padded cells.
 * Selected rows keep a persistent --color-selected-bg tint; hover layers the
 * transient --state-layer-hover on top instead of replacing it.
 */
.data-table tbody tr {
  transition: background-color 0.12s ease;
}

/*
 * Subtle zebra tint for flat mode, where dividers collapse to 0px and rows
 * would otherwise blur together. --surface-tonal-bg in outlined mode equals
 * --color-surface, so this rule is effectively a no-op there. Placed before
 * hover/selected so those state layers still paint on top.
 */
.data-table tbody tr:nth-child(even) {
  background: var(--surface-tonal-bg);
}

.data-table tbody tr:hover {
  background: var(--state-layer-hover);
}

.data-table tbody tr.data-table__row--selected {
  background: var(--color-selected-bg);
}

.data-table tbody tr.data-table__row--selected:hover {
  background: linear-gradient(var(--state-layer-hover), var(--state-layer-hover)),
    var(--color-selected-bg);
}

/*
 * Pinned last column: `position: sticky; right: 0` keeps it visible while the
 * table scrolls horizontally. The leading checkbox column stays at the far
 * left, so the two ends never interfere.
 *
 * Sticky cells must paint an opaque background or the columns scrolling
 * underneath would show through, so the base fills with the table surface and
 * each row state composites its (translucent) tint on top of that opaque base
 * instead of replacing it. z-index lifts the pinned cells above the columns
 * scrolling behind them; the inset shadow draws the separation line on the
 * cell itself so it travels with the column (a real border would be painted by
 * the table grid).
 */
.data-table__sticky-col {
  position: sticky;
  right: 0;
  z-index: 1;
  background: var(--color-surface);
  box-shadow: inset 1px 0 0 var(--color-border);
}

.data-table thead .data-table__sticky-col {
  background: var(--color-surface-raised);
}

.data-table tbody tr:nth-child(even) .data-table__sticky-col {
  background: var(--surface-tonal-bg);
}

.data-table tbody tr:hover .data-table__sticky-col {
  background: linear-gradient(var(--state-layer-hover), var(--state-layer-hover)),
    var(--color-surface);
}

.data-table tbody tr.data-table__row--selected .data-table__sticky-col {
  background: linear-gradient(var(--color-selected-bg), var(--color-selected-bg)),
    var(--color-surface);
}

.data-table tbody tr.data-table__row--selected:hover .data-table__sticky-col {
  background: linear-gradient(var(--state-layer-hover), var(--state-layer-hover)),
    linear-gradient(var(--color-selected-bg), var(--color-selected-bg)), var(--color-surface);
}

/* Loading / empty state rows span the whole table and are non-interactive. */
.data-table__state-row td {
  padding: 2rem var(--table-cell-padding-x);
  text-align: center;
  color: var(--color-text-muted);
}

.data-table tbody tr.data-table__state-row:hover {
  background: transparent;
}

.data-table__empty-text {
  font-size: 0.875rem;
}

.data-table__spinner {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid var(--surface-border-color, currentColor);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: data-table-spin 0.7s linear infinite;
}

@keyframes data-table-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .data-table__spinner {
    animation-duration: 2s;
  }
}

.data-table__sort {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}

.data-table__sort:focus-visible {
  outline: none;
  border-radius: 2px;
  box-shadow: var(--focus-ring);
}

.data-table__sort-indicator {
  font-size: 0.75em;
  line-height: 1;
  color: var(--color-text-muted);
}

.data-table__select-head,
.data-table__select-cell {
  width: 1%;
  white-space: nowrap;
  text-align: center;
}

.data-table__checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  vertical-align: middle;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.data-table__checkbox:focus-visible {
  outline: none;
  border-radius: 2px;
  box-shadow: var(--focus-ring);
}

.data-table__actions-head,
.data-table__actions-cell {
  text-align: right;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
