<script setup lang="ts">
import { computed, useSlots } from 'vue'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'reka-ui'
import Button from '@/components/atoms/Button'

export interface DropdownItem {
  value: string
  label: string
  disabled?: boolean
  /**
   * Optional leading affordance. Accepts anything Vue's
   * `<component :is>` can render — typically a `VNode` produced by
   * `h(...)`, a component instance, or a string tag. Use the `#item`
   * scoped slot when you need full control over item rendering.
   */
  icon?: unknown
  /** Optional secondary line rendered below the label. */
  description?: string
  /**
   * Renders a leading check indicator (✓) when true. Useful for menus
   * that act like radio/checkbox groups. The library does not enforce
   * single-select semantics; consumers control selection state.
   */
  checked?: boolean
}

const props = withDefaults(
  defineProps<{
    items: DropdownItem[]
    align?: 'start' | 'center' | 'end'
    /**
     * Currently selected item value. Used by the default trigger to
     * render the matching item's label, and exposed via the `#item`
     * scoped slot as `selected: boolean`. Optional — when omitted the
     * consumer is expected to supply a `#trigger` slot.
     */
    selected?: string
  }>(),
  {
    align: 'start',
    selected: undefined,
  },
)

const emit = defineEmits<{
  select: [value: string]
}>()

const slots = useSlots()
const hasItemSlot = computed(() => !!slots.item)

/** Label of the item matching `selected`, if any. */
const selectedLabel = computed(() =>
  props.items.find((item) => item.value === props.selected)?.label,
)
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="cagm-dropdown__trigger" as-child>
      <slot name="trigger">
        <!--
          Fallback only used when the consumer does not provide a
          `#trigger` slot. Existing call sites always supply one, so
          this branch preserves current behaviour for them.
        -->
        <Button variant="secondary" size="sm">
          {{ selectedLabel ?? 'Select…' }}
        </Button>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="cagm-dropdown__content"
        :align="align"
        :side-offset="4"
      >
        <template v-if="items.length === 0">
          <div class="cagm-dropdown__empty">
            <slot name="empty">No items</slot>
          </div>
        </template>
        <template v-else>
          <DropdownMenuItem
            v-for="item in items"
            :key="item.value"
            class="cagm-dropdown__item"
            :class="{
              'cagm-dropdown__item--rich':
                hasItemSlot || item.icon || item.description || item.checked,
            }"
            :disabled="item.disabled"
            @select="emit('select', item.value)"
          >
            <!--
              Consumer-supplied rendering overrides everything below.
              Slot scope exposes both the raw item and a `selected`
              boolean so callers can render their own checked indicator
              matching the `selected` prop.
            -->
            <slot
              v-if="hasItemSlot"
              name="item"
              :item="item"
              :selected="item.value === selected"
            />

            <!--
              Built-in rich layout used when the consumer does not
              provide a custom `#item` slot. Three rows: leading icon,
              main column (label + optional description), and a
              trailing checked indicator. When none of the optional
              fields are present, falls through to a plain text node so
              the visual matches the previous label-only implementation.
            -->
            <template
              v-else-if="item.icon || item.description || item.checked"
            >
              <component
                v-if="item.icon"
                :is="item.icon"
                class="cagm-dropdown__item-icon"
                aria-hidden="true"
              />
              <span class="cagm-dropdown__item-main">
                <span class="cagm-dropdown__item-label">{{ item.label }}</span>
                <span
                  v-if="item.description"
                  class="cagm-dropdown__item-description"
                >
                  {{ item.description }}
                </span>
              </span>
              <span
                v-if="item.checked"
                class="cagm-dropdown__item-check"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 8.5 6.5 12 13 4.5" />
                </svg>
              </span>
            </template>

            <template v-else>{{ item.label }}</template>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style scoped>
.cagm-dropdown__trigger {
  display: inline-flex;
}

/*
 * The content surface is portaled out by reka-ui's PopperContent: the
 * outer wrapper gets our component's data-v attribute (so it matches
 * scoped selectors) but the inner .cagm-dropdown__content div is
 * rendered by a child component boundary and therefore does NOT inherit
 * data-v. A plain scoped selector like `.cagm-dropdown__content[data-v-X]`
 * therefore silently matches nothing — the popover renders with no
 * background, no border, no shadow, no z-index, no min-width, no padding
 * (i.e. the "el dropdown no se aprecia" symptom). `:deep()` is required
 * to pierce the portal boundary and apply styles to the inner div.
 *
 * Background uses --surface-tonal-bg-overlay (the standalone
 * floating-surface token in surface.css, intended for surfaces that
 * float above the page) rather than the per-category
 * --surface-tonal-bg-dropdown, which is too subtle at the flat-mode 4%
 * tint to read as a distinct popover. Outlined mode still adds the
 * per-category border for additional delineation.
 */
:deep(.cagm-dropdown__content) {
  min-width: 10rem;
  background: var(--surface-tonal-bg-overlay);
  border: var(--surface-border-width-dropdown) solid var(--surface-border-color-dropdown);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  padding: 0.25rem;
  font-family: var(--font-body);
  z-index: 50;
}

.cagm-dropdown__item {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text);
  border-radius: var(--radius-button);
  padding: 0.5rem 0.625rem;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  gap: 0.5rem;
  transition: background-color 0.15s ease;
}

.cagm-dropdown__item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  z-index: -1;
  transition: background-color 0.15s ease;
}

.cagm-dropdown__item[data-highlighted]::before {
  background: var(--state-layer-hover);
}

.cagm-dropdown__item:focus-visible {
  box-shadow: var(--focus-ring);
}

.cagm-dropdown__item[data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.cagm-dropdown__empty {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: 0.5rem 0.625rem;
  text-align: center;
}

.cagm-dropdown__item--rich {
  padding: 0.5rem 0.625rem;
}

.cagm-dropdown__item-main {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  line-height: 1.25;
}

.cagm-dropdown__item-label {
  font-size: 0.875rem;
  color: var(--color-text);
}

.cagm-dropdown__item-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.cagm-dropdown__item-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--color-text-muted);
}

.cagm-dropdown__item-icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
  stroke: currentColor;
}

.cagm-dropdown__item-check {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--color-accent);
}

.cagm-dropdown__item-check :deep(svg) {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
}

/*
 * Popover-specific cap on the filled-mode tonal opacity.
 *
 * The generic filled value (`color-mix(... var(--color-accent) 12%, ...)`)
 * is tuned for in-page "filled" surfaces like buttons and inputs, where a
 * strong accent tint reinforces the surface as an interactive target. A
 * dropdown popover floats above the page, so its identity should come
 * primarily from elevation (--shadow-md) and the border in outlined mode —
 * a 12% accent tint reads as muddy here and visibly reduces contrast
 * between menu items and var(--color-text).
 *
 * When the dropdown category is explicitly set to "filled" via
 * [data-surface-dropdown="filled"], cap the per-category tonal bg at 8%.
 * That keeps filled meaningfully stronger than flat (4%) while staying
 * readable. When the attribute is absent, the per-category variable falls
 * back to the global --surface-tonal-bg and this rule never fires, so the
 * generic in-page filled behavior is unchanged.
 *
 * Scoped via :global(...) because :root lives outside this component's
 * scope and Vue would otherwise append an unreachable [data-v-*] attribute.
 */
:global(:root[data-surface-dropdown='filled']) {
  --surface-tonal-bg-dropdown: color-mix(
    in srgb,
    var(--color-accent) 8%,
    var(--color-surface)
  );
}
</style>
