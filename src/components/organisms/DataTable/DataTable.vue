<script setup lang="ts" generic="T extends object">
import { computed, ref } from 'vue'

export interface DataTableColumn<T> {
  key: keyof T & string
  label: string
}

export type DataTableRowKey = string | number

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
  }>(),
  {
    selectable: false,
  },
)

const emit = defineEmits<{
  'update:selected': [selectedKeys: DataTableRowKey[]]
  'selection-change': [selectedKeys: DataTableRowKey[]]
}>()

const internalSelected = ref<DataTableRowKey[]>([])

const isControlled = computed(() => props.selected !== undefined)

const selectedKeys = computed<DataTableRowKey[]>(() =>
  isControlled.value ? (props.selected ?? []) : internalSelected.value,
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
</script>

<template>
  <table class="data-table">
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
        <th v-for="column in columns" :key="column.key" scope="col">
          {{ column.label }}
        </th>
        <th v-if="$slots.actions" scope="col" class="data-table__actions-head">
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody>
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
        <td v-for="column in columns" :key="column.key">
          <slot :name="`cell-${column.key}`" :row="row" :index="rowIndex" :value="row[column.key]">
            {{ row[column.key] }}
          </slot>
        </td>
        <td v-if="$slots.actions" class="data-table__actions-cell">
          <slot name="actions" :row="row" :index="rowIndex" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.data-table thead {
  background: var(--color-surface-raised);
}

.data-table th {
  text-align: left;
  font-weight: 600;
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: 1px solid var(--color-border);
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
