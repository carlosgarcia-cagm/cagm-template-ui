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

const { mode, shape, density, interaction, elevation } = useTheme()

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
        <p><strong>elevation:</strong> {{ elevation }}</p>
      </div>
    </aside>

    <main class="playground__content">
      <h1 class="playground__title">Design System Playground</h1>

      <section class="playground__section">
        <h2 class="playground__section-heading">Buttons</h2>
        <p class="playground__size-reference-caption">
          Size reference (fixed, not affected by the global "Button size" setting).
        </p>
        <div
          v-for="variant in buttonVariants"
          :key="variant"
          class="playground__row playground__size-reference"
        >
          <Button
            v-for="size in buttonSizes"
            :key="size"
            :variant="variant"
            :class="`playground__size-reference-button--${size}`"
          >
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

      <section class="playground__section" aria-labelledby="playground-elevation-heading">
        <h2 id="playground-elevation-heading" class="playground__section-heading">Elevation</h2>
        <p class="playground__elevation-caption">
          Side-by-side comparison of the four <code>--shadow-md</code> levels.
          The active elevation matches what the rest of the page currently uses.
        </p>
        <div class="playground__elevation-grid">
          <div class="playground__elevation-card playground__elevation-card--zero">
            <span class="playground__elevation-card-name">Zero</span>
            <span v-if="elevation === 'zero'" class="playground__elevation-card-current">Current</span>
          </div>
          <div class="playground__elevation-card playground__elevation-card--subtle">
            <span class="playground__elevation-card-name">Subtle</span>
            <span v-if="elevation === 'subtle'" class="playground__elevation-card-current">Current</span>
          </div>
          <div class="playground__elevation-card playground__elevation-card--standard">
            <span class="playground__elevation-card-name">Standard</span>
            <span v-if="elevation === 'standard'" class="playground__elevation-card-current">Current</span>
          </div>
          <div class="playground__elevation-card playground__elevation-card--bold">
            <span class="playground__elevation-card-name">Bold</span>
            <span v-if="elevation === 'bold'" class="playground__elevation-card-current">Current</span>
          </div>
        </div>
        <p class="playground__elevation-readout" data-testid="elevation-readout">
          Current elevation: <strong>{{ elevation }}</strong>
        </p>
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

/*
 * Flex children inside a `.playground__row` are FormFields, Inputs, SearchBoxes,
 * SegmentedControls, etc. Each of them wraps an <input>-bearing subtree whose
 * intrinsic min-content size is the width of its placeholder/value text. By
 * default a flex item uses `min-width: auto`, which forces the parent to
 * expand to fit that intrinsic width and ultimately overflows the row at
 * narrow viewports — visually, this is the "you@example.co" placeholder
 * getting clipped because the field refused to shrink below the unbreakable
 * "you@example.com" token. Forcing `min-width: 0` lets the flex/grid item
 * shrink as much as the row needs, and `max-width: 100%` is its belt-and-braces
 * partner for non-flex contexts. Inputs themselves already declare this on
 * their internal wrapper (see Input.vue), but the FormField molecule and
 * similar flex-column wrappers don't, so they need it from the outside.
 */
.playground__row > * {
  min-width: 0;
  max-width: 100%;
}

/*
 * Size-reference demo.
 *
 * <Button> deliberately pins its size to the global "Button size" theme axis
 * (see Button.vue), so every instance in the playground renders at the same
 * size. That is correct for the app, but it defeats this one side-by-side
 * comparison, which must always show sm / md / lg. We therefore hardcode the
 * size back onto just these buttons with a higher-specificity override; the
 * values mirror Button.vue's own `.cagm-button--{sm,md,lg}` rules (if you
 * change one, change the other). `:deep()` is required because we are
 * overriding the child component's scoped styles.
 */
.playground__size-reference-caption {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.playground__size-reference :deep(.playground__size-reference-button--sm.cagm-button) {
  font-size: 0.8125rem;
  padding: 0.375rem 0.75rem;
}

.playground__size-reference :deep(.playground__size-reference-button--md.cagm-button) {
  font-size: 0.9375rem;
  padding: 0.5rem 1rem;
}

.playground__size-reference :deep(.playground__size-reference-button--lg.cagm-button) {
  font-size: 1.0625rem;
  padding: 0.75rem 1.5rem;
}

.playground__sidebar-demo {
  width: 240px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
}

/*
 * Elevation showcase.
 *
 * Each card pins its OWN --shadow-md value inline so all three levels are
 * visible side-by-side regardless of the global data-elevation setting on
 * :root. Values mirror src/tokens/elevation.css exactly; if you change one,
 * change the other. Theme-aware so the glow (dark) vs. offset (light) split
 * stays faithful.
 *
 * :global() is required because the rule's ancestor (:root[data-theme=...])
 * is the document root — Vue's scoped attribute can't be appended there.
 */
.playground__elevation-caption {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.playground__elevation-caption code {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  font-size: 0.8125rem;
  padding: 0.05rem 0.3rem;
  border-radius: 0.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.playground__elevation-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3rem;
  padding: 3rem 1.5rem;
  margin: 0.5rem 0;
  background: var(--color-bg);
  border-radius: var(--radius-card);
}

.playground__elevation-card {
  position: relative;
  flex: 0 0 auto;
  width: 200px;
  height: 140px;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  font-family: var(--font-body);
  transition: box-shadow 0.15s ease;
}

.playground__elevation-card-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
}

.playground__elevation-card-current {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.playground__elevation-readout {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.playground__elevation-readout strong {
  color: var(--color-text);
  text-transform: capitalize;
  font-weight: 600;
}

/* ---- Light theme shadow values (matches elevation.css) ---- */

/*
 * Responsive: below ~1100px the 280px sticky aside eats too much of the
 * viewport (~25%), leaving main with ~800px and starving dense rows (button
 * size comparisons, badge rows, form fields). Below this breakpoint we
 * stack the aside above main so main gets the full viewport width, and we
 * drop the sticky positioning — with the aside in normal flow there's no
 * scroll context for it to stick to anyway, and leaving `position: sticky`
 * on a non-fixed-height column child produces a sticky element that
 * doesn't move with the rest of the layout, which looks broken.
 *
 * Threshold rationale: 1100px matches the breakpoint reported in the bug
 * report (~1098px) with a small safety margin, and matches the existing
 * `max-width: 960px` on `.playground__content` plus 280px aside plus
 * comfortable outer padding.
 */
@media (max-width: 1100px) {
  .playground {
    flex-direction: column;
    min-height: auto;
  }

  .playground__control-panel {
    position: static;
    width: 100%;
    height: auto;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .playground__content {
    max-width: none;
    padding: 1.5rem;
    gap: 2rem;
  }

  .playground__title {
    font-size: 1.75rem;
  }
}
</style>

<!--
  Theme-aware elevation shadow rules. Kept in a non-scoped <style> block
  because Vue's scoped CSS compiler silently drops the `:root[data-theme=…]`
  ancestor and leaves only the descendant selector, which would then match
  in BOTH themes. The `.playground__elevation-card--*` class names are unique
  to this view, so unscoped placement is safe.
-->
<style>
:root[data-theme="light"] .playground__elevation-card--zero {
  box-shadow: none;
}

:root[data-theme="dark"] .playground__elevation-card--zero {
  box-shadow: none;
}

:root[data-theme="light"] .playground__elevation-card--subtle {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.04);
}

:root[data-theme="light"] .playground__elevation-card--standard {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .playground__elevation-card--bold {
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.1),
    0 6px 12px rgba(0, 0, 0, 0.08);
}

:root[data-theme="dark"] .playground__elevation-card--subtle {
  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.05),
    0 0 16px rgba(255, 255, 255, 0.03);
}

:root[data-theme="dark"] .playground__elevation-card--standard {
  box-shadow:
    0 0 16px rgba(255, 255, 255, 0.08),
    0 0 32px rgba(255, 255, 255, 0.05);
}

:root[data-theme="dark"] .playground__elevation-card--bold {
  box-shadow:
    0 0 24px rgba(255, 255, 255, 0.1),
    0 0 48px rgba(255, 255, 255, 0.07);
}
</style>
