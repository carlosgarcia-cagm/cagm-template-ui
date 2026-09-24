<script setup lang="ts">
import { PaginationRoot, PaginationList, PaginationListItem, PaginationEllipsis } from 'reka-ui'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

function onUpdatePage(page: number) {
  emit('update:currentPage', page)
}

function goPrev() {
  if (props.currentPage > 1) emit('update:currentPage', props.currentPage - 1)
}

function goNext() {
  if (props.currentPage < props.totalPages) emit('update:currentPage', props.currentPage + 1)
}
</script>

<template>
  <PaginationRoot
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
      size="sm"
      :disabled="disabled || currentPage <= 1"
      aria-label="Previous page"
      @click="goPrev"
    >
      <Icon :size="14" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Icon>
    </Button>

    <PaginationList v-slot="{ items }" class="cagm-pagination__list">
      <template v-for="(item, index) in items" :key="index">
        <PaginationListItem
          v-if="item.type === 'page'"
          :value="item.value"
          as-child
        >
          <Button
            :variant="item.value === currentPage ? 'primary' : 'ghost'"
            size="sm"
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
      size="sm"
      :disabled="disabled || currentPage >= totalPages"
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
</template>

<style scoped>
.cagm-pagination {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-body);
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
</style>
