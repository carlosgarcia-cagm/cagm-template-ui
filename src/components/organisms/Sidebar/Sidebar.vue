<script setup lang="ts">
import { RovingFocusGroup, RovingFocusItem } from 'reka-ui'

export interface SidebarItem {
  label: string
  icon?: string
  href?: string
}

const props = withDefaults(
  defineProps<{
    items: SidebarItem[]
    activeHref?: string
  }>(),
  {
    activeHref: undefined,
  },
)

const emit = defineEmits<{
  select: [item: SidebarItem]
}>()

function isActive(item: SidebarItem) {
  return props.activeHref !== undefined && item.href === props.activeHref
}

function onSelect(item: SidebarItem) {
  emit('select', item)
}
</script>

<template>
  <nav class="sidebar" aria-label="Sidebar">
    <RovingFocusGroup as="ul" orientation="vertical" loop class="sidebar__list">
      <li v-for="item in items" :key="item.label">
        <RovingFocusItem as-child>
          <a
            class="sidebar__item"
            :class="{ 'sidebar__item--active': isActive(item) }"
            :href="item.href"
            :aria-current="isActive(item) ? 'page' : undefined"
            @click="onSelect(item)"
          >
            <!-- Icon rendering of item.icon is a placeholder for a future icon-set integration; -->
            <!-- real icon content should be passed via a slot or SVG prop once available. -->
            <span class="sidebar__label">{{ item.label }}</span>
          </a>
        </RovingFocusItem>
      </li>
    </RovingFocusGroup>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  background: var(--color-surface);
  font-family: var(--font-body);
  color: var(--color-text);
  padding: 0.75rem;
}

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sidebar__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-button);
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.sidebar__item:hover {
  background: var(--state-layer-hover);
}

.sidebar__item:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  background: var(--state-layer-focus);
}

.sidebar__item:active {
  background: var(--state-layer-pressed);
}

.sidebar__item--active {
  background: var(--color-selected-bg);
  color: var(--color-selected-text);
  font-weight: 600;
}
</style>
