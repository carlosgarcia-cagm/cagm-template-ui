<script setup lang="ts">
import { RovingFocusGroup, RovingFocusItem } from 'reka-ui'

/**
 * SidebarItem shape is widened additively:
 *  - `icon` was previously a `string` placeholder; now it's typed as `unknown`
 *    so consumers can pass a component, a functional component (VNode factory),
 *    or any other value that Vue's `<component :is>` accepts. Existing
 *    call-sites that pass a string (or nothing) keep working — strings fall
 *    through `<component :is>` as HTML tags, which simply renders nothing
 *    for unknown names. For full control, use `#item-icon` or `#item`.
 *  - `badge` is a new optional field rendered next to the label.
 */
export interface SidebarItem {
  label: string
  icon?: unknown
  href?: string
  badge?: string | number
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

/**
 * Decide whether `item.icon` should be rendered as a real component (via
 * `<component :is>`). String values that match a known HTML element name
 * would technically render — but for the existing string-typed placeholder
 * usage (no consumers today) we treat unknown strings as "no icon" to avoid
 * surprise layout from accidental HTML names. Component-like values
 * (objects, functions) are always rendered.
 */
function shouldRenderIcon(icon: unknown): boolean {
  if (icon === null || icon === undefined || icon === false) return false
  if (typeof icon === 'string') return false
  return true
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
            <!--
              `#item` scoped slot wins entirely: consumers can render an
              arbitrary row layout (icon + label + badge + extras) without
              fighting the built-in markup.
            -->
            <slot name="item" :item="item" :active="isActive(item)">
              <!-- `#item-icon` lets consumers supply an icon component/VNode
                   when `item.icon` isn't enough (e.g. they want different
                   styling for active vs. inactive, or want a tooltip). -->
              <span v-if="$slots['item-icon'] || shouldRenderIcon(item.icon)" class="sidebar__icon">
                <slot name="item-icon" :item="item" :active="isActive(item)">
                  <component :is="item.icon" v-if="shouldRenderIcon(item.icon)" />
                </slot>
              </span>
              <span class="sidebar__label">{{ item.label }}</span>
              <!-- Badge rendered only when `item.badge` is provided and
                   truthy; numeric counts (e.g. folder counts) and short
                   strings are both supported. -->
              <span
                v-if="item.badge !== undefined && item.badge !== null && item.badge !== ''"
                class="sidebar__badge"
              >
                {{ item.badge }}
              </span>
            </slot>
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

/* Icon wrapper: keeps a consistent hit-area regardless of which icon a
   consumer passes. `display: inline-flex` lets the icon's own width/height
   (e.g. from the Icon atom or a raw <svg width="16">) define its size, and
   `flex-shrink: 0` prevents the row from compressing it when the label is
   long. Color follows currentColor so SVGs inherit the row's text color
   (including the active state). */
.sidebar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.sidebar__label {
  flex: 1;
  min-width: 0;
}

/* Numeric / textual badge pinned to the right edge, mirroring the layout
   the DashboardLayout's folder rail currently hand-rolls. Inherits the row's
   text color so it picks up the active-state highlight automatically. */
.sidebar__badge {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.sidebar__item--active .sidebar__badge {
  color: var(--color-selected-text);
}
</style>
