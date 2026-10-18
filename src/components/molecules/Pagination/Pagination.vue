<script setup lang="ts">
import { computed } from 'vue'
import { PaginationRoot, PaginationList, PaginationListItem, PaginationEllipsis } from 'reka-ui'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'

type PaginationSize = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    disabled?: boolean
    /**
     * Visual size of the prev/next/page Buttons. Mirrors the Button
     * atom's `size` convention but exposed only as `'sm' | 'md'` here
     * because Pagination does not need the large hero scale. Defaults
     * to `'sm'` so existing call sites render identically.
     */
    size?: PaginationSize
    /**
     * Number of items shown per page. Optional — surfaced through the
     * `#summary` slot scope so consumers can render
     * "Showing X–Y of total" without recomputing it themselves.
     */
    pageSize?: number
    /** Total number of items being paginated. Optional — same use as `pageSize`. */
    totalItems?: number
  }>(),
  {
    disabled: false,
    size: 'sm',
    pageSize: undefined,
    totalItems: undefined,
  },
)

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

/**
 * Reka's `PaginationRoot` requires `total >= 1`. Consumers may pass
 * `totalPages === 0` (e.g. after filtering empties a list before they
 * hide the control), so we never mount the root in that case. The
 * `#summary` slot is still rendered so it can show "0 of 0".
 */
const hasPages = computed(() => props.totalPages >= 1)
const showPageList = computed(() => props.totalPages > 1)
/**
 * Both arrows are disabled when there is nowhere to go: either at the
 * edges of a multi-page range, or when there are zero/one pages.
 */
const prevDisabled = computed(
  () => props.disabled || props.currentPage <= 1 || props.totalPages <= 1,
)
const nextDisabled = computed(
  () =>
    props.disabled ||
    props.currentPage >= props.totalPages ||
    props.totalPages <= 1,
)

function onUpdatePage(page: number) {
  emit('update:currentPage', page)
}

function goPrev() {
  if (prevDisabled.value) return
  emit('update:currentPage', props.currentPage - 1)
}

function goNext() {
  if (nextDisabled.value) return
  emit('update:currentPage', props.currentPage + 1)
}
</script>

<template>
  <div class="cagm-pagination__wrapper">
    <PaginationRoot
      v-if="hasPages"
      class="cagm-pagination"
      :page="currentPage"
      :total="totalPages"
      :items-per-page="1"
      :sibling-count="1"
      :show-edges="true"
      @update:page="onUpdatePage"
    >
      <Button
        variant="secondary"
        :size="size"
        :disabled="prevDisabled"
        aria-label="Previous page"
        @click="goPrev"
      >
        <Icon :size="14" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Icon>
      </Button>

      <PaginationList
        v-if="showPageList"
        v-slot="{ items }"
        class="cagm-pagination__list"
      >
        <template v-for="(item, index) in items" :key="index">
          <PaginationListItem
            v-if="item.type === 'page'"
            :value="item.value"
            as-child
          >
            <Button
              :variant="item.value === currentPage ? 'primary' : 'ghost'"
              :size="size"
              :disabled="disabled"
              class="cagm-pagination__page"
            >
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis v-else :index="index" class="cagm-pagination__ellipsis">
            &#8230;
          </PaginationEllipsis>
        </template>
      </PaginationList>

      <Button
        variant="secondary"
        :size="size"
        :disabled="nextDisabled"
        aria-label="Next page"
        @click="goNext"
      >
        <Icon :size="14" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Icon>
      </Button>
    </PaginationRoot>

    <!--
      Summary slot sits beside the controls. Receives the optional
      `pageSize` and `totalItems` props so consumers can render
      "Showing X of Y" without recomputing those values. Renders only
      when the consumer supplies a `#summary` slot.
    -->
    <div v-if="$slots.summary" class="cagm-pagination__summary">
      <slot
        name="summary"
        :page-size="pageSize"
        :total-items="totalItems"
      />
    </div>
  </div>
</template>

<style scoped>
.cagm-pagination__wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-family: var(--font-body);
}

.cagm-pagination {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cagm-pagination__list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.cagm-pagination__page {
  min-width: 2rem;
}

.cagm-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  color: var(--color-text-muted);
}

.cagm-pagination__summary {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
</style>
