<script setup lang="ts">
import { computed, ref } from 'vue'
import Avatar from '@/components/atoms/Avatar'
import Badge, { type BadgeVariant } from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Dropdown, { type DropdownItem } from '@/components/molecules/Dropdown'
import SearchBox from '@/components/molecules/SearchBox'
import DataTable from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import Modal from '@/components/organisms/Modal'
import type { SidebarItem } from '@/components/organisms/Sidebar'
import DashboardLayout from '@/components/templates/DashboardLayout.vue'
import DonutChart, { type DonutSegment } from './DonutChart.vue'
import LineChart from './LineChart.vue'
import StatSparkCard, { type StatCardLayout } from './StatSparkCard.vue'

type EntryStatus = 'Aprobado' | 'Pendiente' | 'Rechazado' | 'Enviado'
type EntryChannel = 'Canal Norte' | 'LaNube TV' | 'Canal Sur' | 'Streaming'
type FolderId = 'inbox' | 'sent' | 'approved' | 'rejected' | 'trash'

interface EntryRow {
  id: number
  client: string
  channel: EntryChannel
  status: EntryStatus
  date: string
}

interface FolderItem {
  id: FolderId
  label: string
}

interface StatCardData {
  label: string
  value: string
  trend: string
  trendVariant: 'positive' | 'negative'
  points: number[]
  layout: StatCardLayout
}

const sidebarItems: SidebarItem[] = [
  { label: 'Resumen', href: '#overview' },
  { label: 'Usuarios', href: '#users' },
  { label: 'Configuración', href: '#settings' },
]

const activeHref = ref('#overview')

// --- Stat cards: hardcoded mock series rendered as inline sparklines -------
const stats: StatCardData[] = [
  {
    label: 'Envíos totales',
    value: '12.480',
    trend: '+12%',
    trendVariant: 'positive',
    points: [42, 48, 45, 58, 54, 66, 72, 81],
    layout: 'outline-card',
  },
  {
    label: 'Tasa de aprobación',
    value: '86,4%',
    trend: '+4%',
    trendVariant: 'positive',
    points: [78, 80, 79, 82, 83, 85, 84, 86],
    layout: 'trend-top',
  },
  {
    label: 'Rechazados',
    value: '96',
    trend: '-4%',
    trendVariant: 'positive',
    points: [14, 12, 13, 11, 10, 9, 10, 8],
    layout: 'icon-left',
  },
  {
    label: 'Tiempo de respuesta',
    value: '2h 14m',
    trend: '+6%',
    trendVariant: 'negative',
    points: [105, 112, 108, 118, 121, 126, 124, 134],
    layout: 'hero-chart',
  },
]

// --- Timeseries widget -----------------------------------------------------
const shipmentSeries = [32, 38, 35, 44, 41, 52, 48, 57, 61, 55, 64, 70, 66, 75, 79, 74, 86, 92]
const shipmentLabels = ['1 sep', '15 sep', '30 sep']

// --- Donut widget -----------------------------------------------------------
const approvalSegments: DonutSegment[] = [
  { label: 'Aprobado', value: 1240, color: 'var(--color-positive)' },
  { label: 'Pendiente', value: 324, color: 'var(--color-warning)' },
  { label: 'Rechazado', value: 96, color: 'var(--color-negative)' },
  { label: 'Enviado', value: 412, color: 'var(--color-info)' },
]

// --- Recent entries: folder rail, filters and mock rows ---------------------
const folders: FolderItem[] = [
  { id: 'inbox', label: 'Bandeja' },
  { id: 'sent', label: 'Enviados' },
  { id: 'approved', label: 'Aprobados' },
  { id: 'rejected', label: 'Rechazados' },
  { id: 'trash', label: 'Papelera' },
]

const folderIcons: Record<FolderId, string> = {
  inbox:
    'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M3 12h4l2 3h6l2-3h4',
  sent: 'M22 2 11 13 M22 2l-7 20-4-9-9-4z',
  approved: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4',
  rejected: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6',
  trash:
    'M3 6h18 M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6',
}

const activeFolder = ref<FolderId>('inbox')

const entries: EntryRow[] = [
  { id: 1, client: 'Andrea Molina', channel: 'Canal Norte', status: 'Aprobado', date: '22 sep 2026' },
  { id: 2, client: 'Pedro Salinas', channel: 'LaNube TV', status: 'Pendiente', date: '22 sep 2026' },
  { id: 3, client: 'María José Fuentes', channel: 'Streaming', status: 'Aprobado', date: '21 sep 2026' },
  { id: 4, client: 'Ignacio Reyes', channel: 'Canal Sur', status: 'Rechazado', date: '21 sep 2026' },
  { id: 5, client: 'Camila Torres', channel: 'Canal Norte', status: 'Enviado', date: '20 sep 2026' },
  { id: 6, client: 'Rodrigo Vega', channel: 'Streaming', status: 'Aprobado', date: '20 sep 2026' },
  { id: 7, client: 'Valentina Soto', channel: 'LaNube TV', status: 'Pendiente', date: '19 sep 2026' },
  { id: 8, client: 'Matías Herrera', channel: 'Canal Sur', status: 'Enviado', date: '19 sep 2026' },
  { id: 9, client: 'Fernanda Ríos', channel: 'Streaming', status: 'Rechazado', date: '18 sep 2026' },
  { id: 10, client: 'Tomás Aguilera', channel: 'Canal Norte', status: 'Aprobado', date: '18 sep 2026' },
]

const statusVariant: Record<EntryStatus, BadgeVariant> = {
  Aprobado: 'positive',
  Pendiente: 'warning',
  Rechazado: 'negative',
  Enviado: 'info',
}

// The folder rail is a lightweight view over the same mock rows: inbox shows
// everything, status folders narrow by status, trash is intentionally empty.
const folderStatus: Partial<Record<FolderId, EntryStatus>> = {
  sent: 'Enviado',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

function matchesFolder(row: EntryRow, folder: FolderId): boolean {
  if (folder === 'trash') return false
  const status = folderStatus[folder]
  return status === undefined || row.status === status
}

const folderCounts = computed(
  () =>
    Object.fromEntries(
      folders.map((folder) => [
        folder.id,
        entries.filter((row) => matchesFolder(row, folder.id)).length,
      ]),
    ) as Record<FolderId, number>,
)

// --- Filter state (all client-side) -----------------------------------------
type StatusFilter = 'all' | EntryStatus
type ChannelFilter = 'all' | EntryChannel

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('all')
const channelFilter = ref<ChannelFilter>('all')

const statusOptions: DropdownItem[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'Aprobado', label: 'Aprobado' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Rechazado', label: 'Rechazado' },
  { value: 'Enviado', label: 'Enviado' },
]

const channelOptions: DropdownItem[] = [
  { value: 'all', label: 'Todos los canales' },
  { value: 'Canal Norte', label: 'Canal Norte' },
  { value: 'LaNube TV', label: 'LaNube TV' },
  { value: 'Canal Sur', label: 'Canal Sur' },
  { value: 'Streaming', label: 'Streaming' },
]

const statusLabel = computed(
  () =>
    statusOptions.find((option) => option.value === statusFilter.value)?.label ??
    'Todos los estados',
)
const channelLabel = computed(
  () =>
    channelOptions.find((option) => option.value === channelFilter.value)?.label ??
    'Todos los canales',
)

function onStatusSelect(value: string) {
  statusFilter.value = value as StatusFilter
}

function onChannelSelect(value: string) {
  channelFilter.value = value as ChannelFilter
}

const filteredEntries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return entries.filter((row) => {
    if (!matchesFolder(row, activeFolder.value)) return false
    if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false
    if (channelFilter.value !== 'all' && row.channel !== channelFilter.value) return false
    if (query && !`${row.client} ${row.channel}`.toLowerCase().includes(query)) return false
    return true
  })
})

// --- Recent entries table: columns + bulk selection -------------------------
const tableColumns: DataTableColumn<EntryRow>[] = [
  { key: 'client', label: 'Cliente' },
  { key: 'channel', label: 'Canal' },
  { key: 'status', label: 'Estado' },
  { key: 'date', label: 'Fecha' },
]

const selectedKeys = ref<Array<string | number>>([])

function clearSelection() {
  selectedKeys.value = []
}

// --- Row details modal -------------------------------------------------------
const isModalOpen = ref(false)
const selectedRow = ref<EntryRow | null>(null)

function openDetails(row: EntryRow) {
  selectedRow.value = row
  isModalOpen.value = true
}
</script>

<template>
  <DashboardLayout
    title="Panel"
    :items="sidebarItems"
    :active-href="activeHref"
    @select="(item: SidebarItem) => (activeHref = item.href ?? activeHref)"
  >
    <template #navbar-actions>
      <Avatar name="Carlos Garcia" size="sm" />
    </template>

    <div class="dashboard-view">
      <section class="dashboard-view__stats" aria-label="Indicadores">
        <StatSparkCard v-for="stat in stats" :key="stat.label" v-bind="stat" />
      </section>

      <section class="dashboard-view__charts" aria-label="Gráficos">
        <article class="panel">
          <header class="panel__header">
            <h2 class="panel__title">Envíos por período</h2>
            <p class="panel__subtitle">Últimos 30 días</p>
          </header>
          <LineChart :values="shipmentSeries" :labels="shipmentLabels" />
        </article>

        <article class="panel">
          <header class="panel__header">
            <h2 class="panel__title">Estado de aprobación</h2>
            <p class="panel__subtitle">Últimos 30 días</p>
          </header>
          <DonutChart
            :segments="approvalSegments"
            center-value="2.072"
            center-label="envíos"
          />
        </article>
      </section>

      <section class="panel panel--entries" aria-label="Entradas recientes">
        <header class="panel__header">
          <h2 class="panel__title">Entradas recientes</h2>
          <p class="panel__subtitle">Revisa y filtra los últimos envíos</p>
        </header>

        <div class="entries">
          <nav class="entries__rail" aria-label="Carpetas">
            <button
              v-for="folder in folders"
              :key="folder.id"
              type="button"
              class="entries__folder"
              :class="{ 'entries__folder--active': activeFolder === folder.id }"
              :aria-pressed="activeFolder === folder.id"
              @click="activeFolder = folder.id"
            >
              <Icon :size="16" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="fill: none"
                >
                  <path :d="folderIcons[folder.id]" />
                </svg>
              </Icon>
              <span class="entries__folder-label">{{ folder.label }}</span>
              <span class="entries__folder-count">{{ folderCounts[folder.id] }}</span>
            </button>
          </nav>

          <div class="entries__main">
            <div class="entries__toolbar">
              <SearchBox
                v-model="searchQuery"
                placeholder="Buscar por cliente o canal…"
                class="entries__search"
              />
              <Dropdown :items="statusOptions" @select="onStatusSelect">
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
              <Dropdown :items="channelOptions" @select="onChannelSelect">
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
            </div>

            <div
              v-if="selectedKeys.length > 0"
              class="entries__bulk-bar"
              role="toolbar"
              aria-label="Acciones masivas"
            >
              <span class="entries__bulk-count">{{ selectedKeys.length }} seleccionados</span>
              <div class="entries__bulk-actions">
                <Button size="sm" variant="primary" @click="clearSelection">Aprobar</Button>
                <Button size="sm" variant="secondary" @click="clearSelection">Rechazar</Button>
              </div>
            </div>

            <div class="entries__table-wrap">
              <DataTable
                v-model:selected="selectedKeys"
                :columns="tableColumns"
                :rows="filteredEntries"
                selectable
                row-key="id"
                aria-label="Entradas recientes"
              >
                <template #cell-client="{ value }">
                  <span class="entries-table__client">{{ value }}</span>
                </template>
                <template #cell-status="{ row }">
                  <Badge :variant="statusVariant[row.status]">{{ row.status }}</Badge>
                </template>
                <template #cell-date="{ value }">
                  <span class="entries-table__date">{{ value }}</span>
                </template>
                <template #actions="{ row }">
                  <Button size="sm" variant="ghost" @click="openDetails(row)">Ver</Button>
                </template>
              </DataTable>
            </div>

            <p v-if="filteredEntries.length === 0" class="entries-table__empty">
              No se encontraron resultados con los filtros seleccionados.
            </p>

            <p class="entries__summary">
              Mostrando {{ filteredEntries.length }} de {{ entries.length }} entradas
            </p>
          </div>
        </div>
      </section>
    </div>

    <Modal
      v-model="isModalOpen"
      title="Detalle de la entrada"
      :description="selectedRow?.client"
    >
      <dl v-if="selectedRow" class="entry-detail">
        <dt>Cliente</dt>
        <dd>{{ selectedRow.client }}</dd>
        <dt>Canal</dt>
        <dd>{{ selectedRow.channel }}</dd>
        <dt>Estado</dt>
        <dd>
          <Badge :variant="statusVariant[selectedRow.status]">{{ selectedRow.status }}</Badge>
        </dd>
        <dt>Fecha</dt>
        <dd>{{ selectedRow.date }}</dd>
      </dl>
      <template #footer>
        <Button variant="secondary" size="sm" @click="isModalOpen = false">Cerrar</Button>
      </template>
    </Modal>
  </DashboardLayout>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.dashboard-view__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
}

.dashboard-view__charts {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(240px, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 900px) {
  .dashboard-view__charts {
    grid-template-columns: minmax(0, 1fr);
  }
}

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

/* Recent entries: folder rail + filtered table */
.entries {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 1.25rem;
}

@media (max-width: 780px) {
  .entries {
    grid-template-columns: minmax(0, 1fr);
  }

  .entries__rail {
    padding-right: 0;
    padding-bottom: 0.75rem;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
}

.entries__rail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-right: 1.25rem;
  border-right: 1px solid var(--color-border);
}

.entries__folder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 0;
  border-radius: var(--radius-button);
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.entries__folder:hover {
  background: var(--state-layer-hover);
}

.entries__folder:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.entries__folder--active {
  background: var(--color-selected-bg);
  color: var(--color-selected-text);
  font-weight: 600;
}

.entries__folder-count {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.entries__folder--active .entries__folder-count {
  color: var(--color-selected-text);
}

.entries__main {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-width: 0;
}

.entries__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}

.entries__search {
  flex: 1 1 220px;
  min-width: 200px;
}

.entries__table-wrap {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow-x: auto;
}

.entries__bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-selected-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
}

.entries__bulk-count {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-selected-text);
}

.entries__bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.entries-table__client {
  font-weight: 600;
}

.entries-table__date {
  color: var(--color-text-muted);
  white-space: nowrap;
}

.entries-table__empty {
  margin: 0;
  padding: 2rem var(--table-cell-padding-x);
  text-align: center;
  color: var(--color-text-muted);
}

.entries__summary {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: right;
}

.entry-detail {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.375rem 1rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  margin: 0;
}

.entry-detail dt {
  color: var(--color-text-muted);
  font-weight: 600;
}

.entry-detail dd {
  margin: 0;
  color: var(--color-text);
}
</style>
