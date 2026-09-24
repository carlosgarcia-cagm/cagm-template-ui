<script setup lang="ts">
import { nextTick, ref, type ComponentPublicInstance } from 'vue'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import PriorityPicker from './PriorityPicker.vue'
import { PRIORITY_META, type Priority, type Todo } from './types'

const props = withDefaults(
  defineProps<{
    todo: Todo
    /** Manual reordering is only meaningful while sorted by insertion order. */
    canReorder?: boolean
    canMoveUp?: boolean
    canMoveDown?: boolean
  }>(),
  {
    canReorder: false,
    canMoveUp: false,
    canMoveDown: false,
  },
)

const emit = defineEmits<{
  toggle: [id: number]
  save: [id: number, text: string, priority: Priority | undefined]
  requestDelete: [id: number]
  move: [id: number, direction: -1 | 1]
}>()

const isEditing = ref(false)
const draftText = ref('')
const draftPriority = ref<Priority | undefined>(undefined)
const editInput = ref<ComponentPublicInstance | null>(null)

async function startEdit() {
  if (isEditing.value) return
  draftText.value = props.todo.text
  draftPriority.value = props.todo.priority
  isEditing.value = true
  await nextTick()
  const el = editInput.value?.$el as HTMLInputElement | undefined
  el?.focus()
  el?.select()
}

function commitEdit() {
  if (!isEditing.value) return
  isEditing.value = false
  const text = draftText.value.trim()
  // Empty text is treated as a cancel — a task must keep a label.
  if (!text) return
  if (text === props.todo.text && draftPriority.value === props.todo.priority) return
  emit('save', props.todo.id, text, draftPriority.value)
}

function cancelEdit() {
  isEditing.value = false
  draftText.value = ''
  draftPriority.value = undefined
}

function onBlur() {
  // Escape flips `isEditing` first, so the follow-up blur must not re-commit.
  if (isEditing.value) commitEdit()
}
</script>

<template>
  <li class="todo-item" :class="{ 'todo-item--editing': isEditing }">
    <button
      type="button"
      class="todo-item__toggle"
      :aria-pressed="todo.done"
      :aria-label="todo.done ? 'Mark task as not done' : 'Mark task as done'"
      @click="emit('toggle', todo.id)"
    >
      <Icon :size="18">
        <svg v-if="todo.done" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="16" height="16" rx="4" fill="currentColor" />
          <path d="M6 10l2.5 2.5L14 7" stroke="var(--color-surface)" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="16" height="16" rx="4" />
        </svg>
      </Icon>
    </button>

    <template v-if="isEditing">
      <Input
        ref="editInput"
        v-model="draftText"
        class="todo-item__edit-input"
        aria-label="Edit task text"
        @keydown.enter="commitEdit"
        @keydown.escape="cancelEdit"
        @blur="onBlur"
      />
      <PriorityPicker v-model="draftPriority" aria-label="Task priority" />
      <Button
        variant="ghost"
        size="sm"
        class="todo-item__action"
        aria-label="Save changes"
        @mousedown.prevent
        @click="commitEdit"
      >
        <Icon :size="16">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 10.5l4 4 8-9" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Icon>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="todo-item__action"
        aria-label="Cancel editing"
        @mousedown.prevent
        @click="cancelEdit"
      >
        <Icon :size="16">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l8 8M14 6l-8 8" stroke-linecap="round" />
          </svg>
        </Icon>
      </Button>
    </template>

    <template v-else>
      <button
        type="button"
        class="todo-item__text"
        :class="{ 'todo-item__text--done': todo.done }"
        :aria-label="`Edit task: ${todo.text}`"
        @click="startEdit"
      >
        {{ todo.text }}
      </button>

      <Badge v-if="todo.priority" :variant="PRIORITY_META[todo.priority].badge" class="todo-item__badge">
        {{ PRIORITY_META[todo.priority].label }}
      </Badge>

      <div class="todo-item__actions">
        <Button
          variant="ghost"
          size="sm"
          class="todo-item__action"
          aria-label="Edit task"
          @click="startEdit"
        >
          <Icon :size="16">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M13.5 3.5a2.12 2.12 0 0 1 3 3L7 16l-4 1 1-4 9.5-9.5Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Icon>
        </Button>

        <template v-if="canReorder">
          <Button
            variant="ghost"
            size="sm"
            class="todo-item__action"
            aria-label="Move task up"
            :disabled="!canMoveUp"
            @click="emit('move', todo.id, -1)"
          >
            <Icon :size="16">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="5 12 10 7 15 12" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Icon>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="todo-item__action"
            aria-label="Move task down"
            :disabled="!canMoveDown"
            @click="emit('move', todo.id, 1)"
          >
            <Icon :size="16">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="5 8 10 13 15 8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Icon>
          </Button>
        </template>

        <Button
          variant="ghost"
          size="sm"
          class="todo-item__action todo-item__action--delete"
          aria-label="Delete task"
          @click="emit('requestDelete', todo.id)"
        >
          <Icon :size="16">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M4 6h12M8 6V4h4v2m-7 0 .8 10.2A2 2 0 0 0 7.8 18h4.4a2 2 0 0 0 2-1.8L15 6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Icon>
        </Button>
      </div>
    </template>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item--editing {
  gap: 0.5rem;
}

.todo-item__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-accent);
  flex-shrink: 0;
}

.todo-item__toggle:focus-visible {
  outline: none;
  border-radius: var(--radius-button);
  box-shadow: var(--focus-ring);
}

.todo-item__text {
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text);
  cursor: text;
}

.todo-item__text:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 3px;
}

.todo-item__text:focus-visible {
  outline: none;
  border-radius: var(--radius-button);
  box-shadow: var(--focus-ring);
}

.todo-item__text--done {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.todo-item__edit-input {
  flex: 1;
  min-width: 0;
}

.todo-item__badge {
  flex-shrink: 0;
}

.todo-item__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  margin-left: auto;
  flex-shrink: 0;
}

.todo-item__actions .todo-item__action {
  padding: 0.375rem;
  color: var(--color-text-muted);
}

.todo-item__actions .todo-item__action:hover:not(:disabled) {
  color: var(--color-text);
}

.todo-item__actions .todo-item__action--delete:hover:not(:disabled) {
  color: var(--color-negative);
}
</style>
