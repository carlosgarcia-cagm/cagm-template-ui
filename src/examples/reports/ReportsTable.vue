<script setup lang="ts">
/*
 * Page-local wrapper around the shared DataTable organism.
 *
 * It is NOT a new library primitive — it only binds the Reports columns and
 * the `#cell-*` / `#actions` slots once so all three tab panels share the
 * exact same table instead of triplicating the markup. The scroll container
 * (horizontal + vertical) and its min-width live here, in the consumer.
 */
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Dropdown, { type DropdownItem } from '@/components/molecules/Dropdown'
import DataTable, { type DataTableColumn } from '@/components/organisms/DataTable'
import {
  formatCurrency,
  formatReportDate,
  priorityMeta,
  statusMeta,
  type ReportRow,
} from './mockReports'

defineProps<{ rows: ReportRow[] }>()

const emit = defineEmits<{
  'row-action': [action: string, row: ReportRow]
}>()

// 8 data columns + the trailing `#actions` column = 9 total, which is wide
// enough to need horizontal scrolling on any normal viewport.
const columns: DataTableColumn<ReportRow>[] = [
  { key: 'id', label: 'Report', width: '8rem', sortable: true },
  { key: 'name', label: 'Name', width: '16rem', sortable: true },
  { key: 'client', label: 'Client', width: '13rem' },
  { key: 'channel', label: 'Channel', width: '9rem' },
  { key: 'status', label: 'Status', width: '9rem' },
  { key: 'priority', label: 'Priority', width: '8rem' },
  { key: 'amount', label: 'Amount', width: '9rem', align: 'right', sortable: true },
  { key: 'due', label: 'Due date', width: '9rem' },
]

function menuItems(row: ReportRow): DropdownItem[] {
  return [
    { value: 'duplicate', label: 'Duplicate' },
    {
      value: row.status === 'Archived' ? 'reopen' : 'archive',
      label: row.status === 'Archived' ? 'Reopen' : 'Archive',
    },
    { value: 'delete', label: 'Delete' },
  ]
}
</script>

<template>
  <div class="reports-table">
    <!--
     * The scroll container. `max-height` forces the tall body (26 rows) to
     * scroll vertically; the `min-width` override below makes the table
     * overflow horizontally regardless of viewport width. Both axes are
     * therefore exercised, which is the point of this example page.
     -->
    <div class="reports-table__scroll">
      <DataTable
        :columns="columns"
        :rows="rows"
        row-key="id"
        caption="Generated reports"
      >
        <template #cell-id="{ value }">
          <span class="reports-table__id">{{ value }}</span>
        </template>

        <template #cell-name="{ value }">
          <span class="reports-table__name">{{ value }}</span>
        </template>

        <template #cell-status="{ row }">
          <Badge :variant="statusMeta[row.status].variant" size="sm">
            {{ row.status }}
          </Badge>
        </template>

        <template #cell-priority="{ row }">
          <Badge :variant="priorityMeta[row.priority].variant" size="sm" appearance="outline">
            {{ row.priority }}
          </Badge>
        </template>

        <template #cell-amount="{ value }">
          <span class="reports-table__amount">{{ formatCurrency(Number(value)) }}</span>
        </template>

        <template #cell-due="{ value }">
          <span class="reports-table__due">{{ formatReportDate(String(value)) }}</span>
        </template>

        <!-- Last column: per-row overflow menu built on the Dropdown molecule. -->
        <template #actions="{ row }">
          <Dropdown
            :items="menuItems(row)"
            align="end"
            @select="(action: string) => emit('row-action', action, row)"
          >
            <template #trigger>
              <Button variant="ghost" size="sm" :aria-label="`Actions for ${row.id}`">
                <Icon :size="16" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  >
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </Icon>
              </Button>
            </template>
          </Dropdown>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.reports-table__scroll {
  max-height: 440px;
  overflow: auto;
  border: var(--surface-border-width) solid var(--surface-border-color);
  background: var(--surface-tonal-bg);
  border-radius: var(--radius-card);
}

/* Force horizontal overflow so the sticky/scroll behaviour is observable
 * regardless of how wide the surrounding page happens to be. Consuming the
 * organism's own class from the page is intentional — no component edits. */
.reports-table__scroll :deep(.data-table) {
  min-width: 1500px;
}

.reports-table__id {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.reports-table__name {
  font-weight: 600;
}

.reports-table__amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.reports-table__due {
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
