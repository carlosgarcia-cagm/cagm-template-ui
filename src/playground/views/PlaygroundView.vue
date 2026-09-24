<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/theme/useTheme'

import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import Avatar from '@/components/atoms/Avatar'
import Icon from '@/components/atoms/Icon'
import Spinner from '@/components/atoms/Spinner'

import FormField from '@/components/molecules/FormField'
import SearchBox from '@/components/molecules/SearchBox'
import Pagination from '@/components/molecules/Pagination'
import Tabs from '@/components/molecules/Tabs'
import Dropdown from '@/components/molecules/Dropdown'

import DataTable from '@/components/organisms/DataTable'
import Navbar from '@/components/organisms/Navbar'
import Sidebar from '@/components/organisms/Sidebar'
import Modal from '@/components/organisms/Modal'
import DatePicker from '@/components/organisms/DatePicker'

const { mode, shape, density, interaction } = useTheme()

const buttonVariants = ['primary', 'secondary', 'ghost'] as const
const buttonSizes = ['sm', 'md', 'lg'] as const
const badgeVariants = ['neutral', 'positive', 'negative', 'warning', 'info'] as const

const searchValue = ref('')
const currentPage = ref(1)
const tabsValue = ref('overview')
const tabItems = [
  { value: 'overview', label: 'Overview' },
  { value: 'details', label: 'Details' },
  { value: 'settings', label: 'Settings' },
]

const dropdownItems = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
]

const sidebarItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Projects', href: '#projects' },
  { label: 'Settings', href: '#settings' },
]

const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
] satisfies { key: 'name' | 'role' | 'status'; label: string }[]

const tableRows = [
  { name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
  { name: 'Grace Hopper', role: 'Admiral', status: 'Active' },
  { name: 'Alan Turing', role: 'Researcher', status: 'Inactive' },
]

const modalOpen = ref(false)
const datePickerValue = ref<Date | undefined>(undefined)
</script>

<template>
  <div class="playground" :class="{ 'playground--full-width': density === 'full-width' }">
    <aside class="playground__control-panel">
      <div class="playground__theme-readout">
        <p><strong>mode:</strong> {{ mode }}</p>
        <p><strong>shape:</strong> {{ shape }}</p>
        <p><strong>density:</strong> {{ density }}</p>
        <p><strong>interaction:</strong> {{ interaction }}</p>
      </div>
    </aside>

    <main class="playground__content">
      <h1 class="playground__title">Design System Playground</h1>

      <section class="playground__section">
        <h2 class="playground__section-heading">Buttons</h2>
        <div v-for="variant in buttonVariants" :key="variant" class="playground__row">
          <Button v-for="size in buttonSizes" :key="size" :variant="variant" :size="size">
            {{ variant }} {{ size }}
          </Button>
        </div>
        <div class="playground__row">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Inputs</h2>
        <div class="playground__row">
          <Input placeholder="Regular input" />
          <Input placeholder="Error state" error />
          <Input placeholder="Disabled" disabled />
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Badges</h2>
        <div class="playground__row">
          <Badge v-for="variant in badgeVariants" :key="variant" :variant="variant">
            {{ variant }}
          </Badge>
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Avatars, Icons, Spinner</h2>
        <div class="playground__row">
          <Avatar name="Ada Lovelace" size="sm" />
          <Avatar name="Grace Hopper" size="md" />
          <Avatar name="Alan Turing" size="lg" />
          <Icon :size="24">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
            </svg>
          </Icon>
          <Spinner :size="24" />
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Form Field</h2>
        <div class="playground__row">
          <FormField label="Email" placeholder="you@example.com" type="email" />
          <FormField label="Password" placeholder="••••••••" type="password" error="Password is too short" />
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Search Box</h2>
        <div class="playground__row">
          <SearchBox v-model="searchValue" />
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Pagination</h2>
        <Pagination v-model:current-page="currentPage" :total-pages="10" />
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Tabs</h2>
        <Tabs v-model="tabsValue" :items="tabItems">
          <template #overview>Overview content</template>
          <template #details>Details content</template>
          <template #settings>Settings content</template>
        </Tabs>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Dropdown</h2>
        <Dropdown :items="dropdownItems" @select="(value) => console.log('selected', value)">
          <template #trigger>
            <Button variant="secondary" size="sm">Open menu</Button>
          </template>
        </Dropdown>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Data Table</h2>
        <DataTable :columns="tableColumns" :rows="tableRows" />
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Navbar</h2>
        <Navbar title="Acme Inc.">
          <template #actions>
            <Button variant="ghost" size="sm">Docs</Button>
            <Button variant="primary" size="sm">Sign in</Button>
          </template>
        </Navbar>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Sidebar</h2>
        <div class="playground__sidebar-demo">
          <Sidebar :items="sidebarItems" active-href="#dashboard" />
        </div>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Modal</h2>
        <Button variant="primary" size="sm" @click="modalOpen = true">Open modal</Button>
        <Modal v-model="modalOpen" title="Example modal" description="This modal is triggered from the playground.">
          <p>Modal body content goes here.</p>
          <template #footer>
            <Button variant="secondary" size="sm" @click="modalOpen = false">Cancel</Button>
            <Button variant="primary" size="sm" @click="modalOpen = false">Confirm</Button>
          </template>
        </Modal>
      </section>

      <section class="playground__section">
        <h2 class="playground__section-heading">Date Picker</h2>
        <DatePicker v-model="datePickerValue" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.playground--full-width .playground__content {
  max-width: none;
  padding-inline: 1rem;
}

.playground__control-panel {
  position: sticky;
  top: 0;
  align-self: flex-start;
  width: 280px;
  flex-shrink: 0;
  padding: 1rem;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playground__theme-readout {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.playground__theme-readout p {
  margin: 0.25rem 0;
}

.playground__content {
  flex: 1;
  min-width: 0;
  max-width: 960px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.playground__title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.playground__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playground__section-heading {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.playground__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.playground__sidebar-demo {
  width: 240px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
}
</style>
