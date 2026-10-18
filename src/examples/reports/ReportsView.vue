<script setup lang="ts">
/*
 * Reports — the "complex" example page.
 *
 * Deliberately exercises the parts of the design system the login/todo/
 * dashboard examples do not: an Input+Dropdown+Button filter toolbar, the
 * Tabs molecule switching datasets, and a wide/tall DataTable that needs
 * both horizontal and vertical scrolling. It consumes the existing atoms,
 * molecules and organisms only — no new shared primitives.
 */
import { computed, ref } from 'vue'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Dropdown, { type DropdownItem } from '@/components/molecules/Dropdown'
import SearchBox from '@/components/molecules/SearchBox'
import Tabs, { type TabItem } from '@/components/molecules/Tabs'
import DatePicker from '@/components/organisms/DatePicker'
import Modal from '@/components/organisms/Modal'
import ReportsTable from './ReportsTable.vue'
import {
  createReportRows,
  formatReportDate,
  toIsoDate,
  REPORT_CHANNELS,
  REPORT_STATUSES,
  type ReportChannel,
  type ReportRow,
  type ReportStatus,
} from './mockReports'

type StatusFilter = 'all' | ReportStatus
type ChannelFilter = 'all' | ReportChannel

const reports = ref<ReportRow[]>(createReportRows())

// --- Filters ----------------------------------------------------------------
// Dropdowns and the date range edit "draft" values; the Apply button commits
// them to the "applied" refs that actually drive the table. Search is live.
const searchQuery = ref('')
const draftStatus = ref<StatusFilter>('all')
const draftChannel = ref<ChannelFilter>('all')
const draftFrom = ref<Date | undefined>(undefined)
const draftTo = ref<Date | undefined>(undefined)

const appliedStatus = ref<StatusFilter>('all')
const appliedChannel = ref<ChannelFilter>('all')
const appliedFrom = ref<Date | undefined>(undefined)
const appliedTo = ref<Date | undefined>(undefined)

const dateModalOpen = ref(false)
const activeTab = ref('all')
const lastAction = ref('')

const statusOptions: DropdownItem[] = [
  { value: 'all', label: 'All statuses' },
  ...REPORT_STATUSES.map((status) => ({ value: status, label: status })),
]

const channelOptions: DropdownItem[] = [
  { value: 'all', label: 'All channels' },
  ...REPORT_CHANNELS.map((channel) => ({ value: channel, label: channel })),
]

const statusLabel = computed(
  () => statusOptions.find((option) => option.value === draftStatus.value)?.label ?? 'All statuses',
)
const channelLabel = computed(
  () =>
    channelOptions.find((option) => option.value === draftChannel.value)?.label ?? 'All channels',
)
const dateLabel = computed(() => {
  const from = draftFrom.value
  const to = draftTo.value
  if (from && to) return `${formatReportDate(toIsoDate(from))} – ${formatReportDate(toIsoDate(to))}`
  if (from) return `From ${formatReportDate(toIsoDate(from))}`
  if (to) return `Until ${formatReportDate(toIsoDate(to))}`
  return 'Any due date'
})

function onStatusSelect(value: string) {
  draftStatus.value = value as StatusFilter
}

function onChannelSelect(value: string) {
  draftChannel.value = value as ChannelFilter
}

function applyFilters() {
  appliedStatus.value = draftStatus.value
  appliedChannel.value = draftChannel.value
  appliedFrom.value = draftFrom.value
  appliedTo.value = draftTo.value
}

function clearFilters() {
  searchQuery.value = ''
  draftStatus.value = 'all'
  draftChannel.value = 'all'
  draftFrom.value = undefined
  draftTo.value = undefined
  appliedStatus.value = 'all'
  appliedChannel.value = 'all'
  appliedFrom.value = undefined
  appliedTo.value = undefined
  lastAction.value = ''
}

function clearDraftDates() {
  draftFrom.value = undefined
  draftTo.value = undefined
}

// --- Derived rows -----------------------------------------------------------
function matchesFilters(row: ReportRow): boolean {
  const query = searchQuery.value.trim().toLowerCase()
  if (query && !`${row.id} ${row.name} ${row.client}`.toLowerCase().includes(query)) return false
  if (appliedStatus.value !== 'all' && row.status !== appliedStatus.value) return false
  if (appliedChannel.value !== 'all' && row.channel !== appliedChannel.value) return false
  if (appliedFrom.value && row.due < toIsoDate(appliedFrom.value)) return false
  if (appliedTo.value && row.due > toIsoDate(appliedTo.value)) return false
  return true
}

const filteredRows = computed(() => reports.value.filter(matchesFilters))
const activeRows = computed(() => filteredRows.value.filter((row) => row.status !== 'Archived'))
const archivedRows = computed(() => filteredRows.value.filter((row) => row.status === 'Archived'))

// Rows the table is currently showing, i.e. the active tab's slice of the
// filtered set. Drives the footer summary so it never contradicts the tab.
const visibleRows = computed(() => {
  if (activeTab.value === 'active') return activeRows.value
  if (activeTab.value === 'archived') return archivedRows.value
  return filteredRows.value
})

const tabItems: TabItem[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

const tabCounts = computed<Record<string, number>>(() => ({
  all: filteredRows.value.length,
  active: activeRows.value.length,
  archived: archivedRows.value.length,
}))

// --- Row actions ------------------------------------------------------------
let duplicateCounter = 2000

function onRowAction(action: string, row: ReportRow) {
  if (action === 'duplicate') {
    const clone: ReportRow = {
      ...row,
      id: `RPT-${duplicateCounter++}`,
      name: `${row.name} (copy)`,
    }
    const index = reports.value.findIndex((item) => item.id === row.id)
    reports.value.splice(index + 1, 0, clone)
    lastAction.value = `Duplicated ${row.id}`
    return
  }
  if (action === 'archive') {
    row.status = 'Archived'
    lastAction.value = `Archived ${row.id}`
    return
  }
  if (action === 'reopen') {
    row.status = 'In review'
    lastAction.value = `Reopened ${row.id}`
    return
  }
  if (action === 'delete') {
    reports.value = reports.value.filter((item) => item.id !== row.id)
    lastAction.value = `Deleted ${row.id}`
  }
}
</script>

<template>
  <div class="reports-view">
    <header class="reports-view__header">
      <div>
        <h1 class="reports-view__title">Reports</h1>
        <p class="reports-view__subtitle">
          Filter, compare and drill into generated reports across every channel.
        </p>
      </div>
      <Badge variant="info" size="lg">{{ reports.length }} reports</Badge>
    </header>

    <!-- 1. Filter toolbar: SearchBox (Input) + Dropdown ×2 + date button + actions -->
    <section class="panel" aria-label="Report filters">
      <div class="reports-view__filters">
        <SearchBox
          v-model="searchQuery"
          placeholder="Search reports, clients…"
          class="reports-view__search"
        />

        <Dropdown :items="statusOptions" :selected="draftStatus" @select="onStatusSelect">
          <template #trigger>
            <Button variant="secondary" size="sm">
              {{ statusLabel }}
              <Icon :size="14" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="fill: none"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Icon>
            </Button>
          </template>
        </Dropdown>

        <Dropdown :items="channelOptions" :selected="draftChannel" @select="onChannelSelect">
          <template #trigger>
            <Button variant="secondary" size="sm">
              {{ channelLabel }}
              <Icon :size="14" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="fill: none"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Icon>
            </Button>
          </template>
        </Dropdown>

        <!-- 5. DatePicker lives inside a modal opened from this toolbar button. -->
        <Button variant="secondary" size="sm" @click="dateModalOpen = true">
          <Icon :size="14" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="fill: none"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
          </Icon>
          {{ dateLabel }}
        </Button>

        <div class="reports-view__filters-spacer" />

        <Button variant="primary" size="sm" @click="applyFilters">Apply filters</Button>
        <Button variant="ghost" size="sm" @click="clearFilters">Clear filters</Button>
      </div>
    </section>

    <!-- 2 + 3. Tabs switch the dataset; each view renders the wide/tall table. -->
    <section class="panel" aria-label="Generated reports">
      <header class="panel__header">
        <h2 class="panel__title">Generated reports</h2>
        <p class="panel__subtitle">Switch views, then scroll the table both ways.</p>
      </header>

      <Tabs v-model="activeTab" :items="tabItems" aria-label="Report views">
        <template #trigger-all>
          <span>All<span class="reports-view__tab-count">{{ tabCounts.all }}</span></span>
        </template>
        <template #trigger-active>
          <span>Active<span class="reports-view__tab-count">{{ tabCounts.active }}</span></span>
        </template>
        <template #trigger-archived>
          <span>Archived<span class="reports-view__tab-count">{{ tabCounts.archived }}</span></span>
        </template>

        <template #all>
          <ReportsTable :rows="filteredRows" @row-action="onRowAction" />
        </template>
        <template #active>
          <ReportsTable :rows="activeRows" @row-action="onRowAction" />
        </template>
        <template #archived>
          <ReportsTable :rows="archivedRows" @row-action="onRowAction" />
        </template>
      </Tabs>

      <p class="reports-view__summary" aria-live="polite">
        Showing {{ visibleRows.length }} of {{ reports.length }} reports
        <template v-if="lastAction"> · {{ lastAction }}</template>
      </p>
    </section>

    <Modal
      v-model="dateModalOpen"
      size="lg"
      title="Due date range"
      description="Pick a start and end date to narrow the report list, then apply the filters."
    >
      <div class="reports-view__date-grid">
        <div class="reports-view__date-field">
          <p class="reports-view__date-label">From</p>
          <DatePicker v-model="draftFrom" locale="en-GB" />
        </div>
        <div class="reports-view__date-field">
          <p class="reports-view__date-label">To</p>
          <DatePicker v-model="draftTo" locale="en-GB" />
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" size="sm" @click="clearDraftDates">Clear dates</Button>
        <Button variant="primary" size="sm" @click="dateModalOpen = false">Done</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.reports-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.5rem;
}

.reports-view__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.reports-view__title {
  margin: 0;
  font-family: var(--font-display, var(--font-body));
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.reports-view__subtitle {
  margin: 0.25rem 0 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Panel styling mirrors the Dashboard example so this page feels native. */
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-surface-raised);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.panel__header {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.panel__title {
  margin: 0;
  font-family: var(--font-display, var(--font-body));
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.panel__subtitle {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.reports-view__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}

.reports-view__search {
  flex: 1 1 240px;
  min-width: 200px;
}

.reports-view__filters-spacer {
  flex: 1 1 0;
  min-width: 0;
}

.reports-view__tab-count {
  margin-left: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.reports-view__summary {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: right;
}

.reports-view__date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .reports-view__date-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.reports-view__date-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reports-view__date-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
</style>
