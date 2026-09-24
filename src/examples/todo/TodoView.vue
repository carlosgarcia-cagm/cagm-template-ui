<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Directive } from 'vue'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import Icon from '@/components/atoms/Icon'
import SearchBox from '@/components/molecules/SearchBox'
import Pagination from '@/components/molecules/Pagination'
import Modal from '@/components/organisms/Modal'

type Priority = 'low' | 'medium' | 'high'

interface Todo {
  id: number
  text: string
  done: boolean
  priority: Priority
}

const STORAGE_KEY = 'cagm-ui-todos'
const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high']

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Med' },
  { value: 'high', label: 'High' },
]

const priorityMeta: Record<Priority, { label: string; variant: 'info' | 'warning' | 'negative' }> =
  {
    low: { label: 'Low', variant: 'info' },
    medium: { label: 'Medium', variant: 'warning' },
    high: { label: 'High', variant: 'negative' },
  }

// Autofocus the inline edit input as soon as a row switches into edit mode.
const vFocus: Directive<HTMLElement> = {
  mounted: (el) => el.focus(),
}

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}

function createMockTodos(): Todo[] {
  return [
    { id: 1, text: 'Write project proposal', done: true, priority: 'high' },
    { id: 2, text: 'Review pull request #482', done: false, priority: 'high' },
    { id: 3, text: 'Update onboarding docs', done: false, priority: 'low' },
    { id: 4, text: 'Sync with design on new tokens', done: true, priority: 'medium' },
    { id: 5, text: 'Fix flaky checkout test', done: false, priority: 'high' },
    { id: 6, text: 'Prepare sprint demo slides', done: false, priority: 'medium' },
    { id: 7, text: 'Reply to support escalation', done: true, priority: 'high' },
    { id: 8, text: 'Migrate legacy auth endpoint', done: false, priority: 'medium' },
    { id: 9, text: 'Clean up unused feature flags', done: false, priority: 'low' },
    { id: 10, text: 'Triage backlog for next quarter', done: false, priority: 'medium' },
    { id: 11, text: 'Pair on performance profiling', done: true, priority: 'low' },
    { id: 12, text: 'Draft release notes for v2.4', done: false, priority: 'medium' },
  ]
}

function normalizeTodo(value: unknown): Todo | null {
  if (typeof value !== 'object' || value === null) return null
  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.id !== 'number' ||
    typeof candidate.text !== 'string' ||
    typeof candidate.done !== 'boolean'
  ) {
    return null
  }
  return {
    id: candidate.id,
    text: candidate.text,
    done: candidate.done,
    priority: isPriority(candidate.priority) ? candidate.priority : 'medium',
  }
}

// Hydrate from localStorage when present; fall back to the mock list only
// when the key is absent or unreadable/corrupt.
function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createMockTodos()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return createMockTodos()
    return parsed
      .map((item) => normalizeTodo(item))
      .filter((item): item is Todo => item !== null)
  } catch {
    return createMockTodos()
  }
}

const todos = ref<Todo[]>(loadTodos())
let nextId = todos.value.reduce((max, todo) => Math.max(max, todo.id), 0) + 1

watch(
  todos,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // ignore persistence failures (e.g. storage disabled)
    }
  },
  { deep: true },
)

const searchTerm = ref('')
const newTaskText = ref('')
const newTaskPriority = ref<Priority>('medium')
const currentPage = ref(1)
const pageSize = 5

const editingId = ref<number | null>(null)
const editingText = ref('')
const editingPriority = ref<Priority>('medium')

// Delete confirmation: the row's delete button only records the target id;
// the task is removed after the user confirms inside the Modal.
const pendingDeleteId = ref<number | null>(null)

const isDeleteModalOpen = computed({
  get: () => pendingDeleteId.value !== null,
  set: (open: boolean) => {
    if (!open) pendingDeleteId.value = null
  },
})

const pendingDeleteTodo = computed(
  () => todos.value.find((todo) => todo.id === pendingDeleteId.value) ?? null,
)

const filteredTodos = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return todos.value
  return todos.value.filter((todo) => todo.text.toLowerCase().includes(term))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTodos.value.length / pageSize)))

const pagedTodos = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTodos.value.slice(start, start + pageSize)
})

const remainingCount = computed(() => todos.value.filter((todo) => !todo.done).length)
const completedCount = computed(() => todos.value.filter((todo) => todo.done).length)
const hasAnyTasks = computed(() => todos.value.length > 0)

function onSearch(value: string) {
  searchTerm.value = value
  currentPage.value = 1
}

function addTask() {
  const text = newTaskText.value.trim()
  if (!text) return
  todos.value.unshift({ id: nextId++, text, done: false, priority: newTaskPriority.value })
  newTaskText.value = ''
  currentPage.value = 1
}

function toggleDone(id: number) {
  const todo = todos.value.find((item) => item.id === id)
  if (todo) todo.done = !todo.done
}

function clampPage() {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
}

function deleteTask(id: number) {
  todos.value = todos.value.filter((item) => item.id !== id)
  if (editingId.value === id) cancelEdit()
  clampPage()
}

function requestDelete(id: number) {
  pendingDeleteId.value = id
}

function cancelDelete() {
  pendingDeleteId.value = null
}

function confirmDelete() {
  if (pendingDeleteId.value === null) return
  deleteTask(pendingDeleteId.value)
  pendingDeleteId.value = null
}

function clearCompleted() {
  todos.value = todos.value.filter((todo) => !todo.done)
  if (editingId.value !== null && !todos.value.some((todo) => todo.id === editingId.value)) {
    cancelEdit()
  }
  clampPage()
}

function startEdit(todo: Todo) {
  editingId.value = todo.id
  editingText.value = todo.text
  editingPriority.value = todo.priority
}

function saveEdit() {
  if (editingId.value === null) return
  const todo = todos.value.find((item) => item.id === editingId.value)
  if (todo) {
    const text = editingText.value.trim()
    // Empty text is treated as a cancel: keep the original value.
    if (text) {
      todo.text = text
      todo.priority = editingPriority.value
    }
  }
  cancelEdit()
}

function cancelEdit() {
  editingId.value = null
  editingText.value = ''
}
</script>

<template>
  <div class="todo-view">
    <div class="todo-view__card">
      <div class="todo-view__header">
        <h1 class="todo-view__title">Tasks</h1>
        <Badge
          class="todo-view__pending-badge"
          :variant="remainingCount > 0 ? 'info' : 'positive'"
          aria-live="polite"
        >
          {{ remainingCount }} pending
        </Badge>
      </div>

      <SearchBox
        v-model="searchTerm"
        placeholder="Filter tasks…"
        class="todo-view__search"
        @search="onSearch"
      />

      <form class="todo-view__add" @submit.prevent="addTask">
        <Input v-model="newTaskText" placeholder="Add a new task…" class="todo-view__add-input" />
        <div class="todo-view__priority-group" role="group" aria-label="New task priority">
          <Button
            v-for="option in priorityOptions"
            :key="option.value"
            :variant="newTaskPriority === option.value ? 'primary' : 'ghost'"
            size="sm"
            class="todo-view__priority-button"
            :aria-pressed="newTaskPriority === option.value"
            :aria-label="`Set new task priority to ${option.value}`"
            @click="newTaskPriority = option.value"
          >
            {{ option.label }}
          </Button>
        </div>
        <Button variant="primary" size="md" @click="addTask">Add</Button>
      </form>

      <div v-if="completedCount > 0" class="todo-view__toolbar">
        <Button variant="ghost" size="sm" class="todo-view__clear" @click="clearCompleted">
          <Icon :size="14" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M4 6h12M8 6V4h4v2m-7 0 .8 10.2A2 2 0 0 0 7.8 18h4.4a2 2 0 0 0 2-1.8L15 6"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Icon>
          Clear completed ({{ completedCount }})
        </Button>
      </div>

      <ul v-if="pagedTodos.length > 0" class="todo-view__list">
        <li
          v-for="todo in pagedTodos"
          :key="todo.id"
          class="todo-view__item"
          :class="{ 'todo-view__item--editing': editingId === todo.id }"
        >
          <button
            type="button"
            class="todo-view__toggle"
            :aria-pressed="todo.done"
            :aria-label="todo.done ? 'Mark task as not done' : 'Mark task as done'"
            @click="toggleDone(todo.id)"
          >
            <Icon :size="18">
              <svg
                v-if="todo.done"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="2" y="2" width="16" height="16" rx="4" fill="currentColor" />
                <path
                  d="M6 10l2.5 2.5L14 7"
                  stroke="var(--color-surface)"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="16" height="16" rx="4" />
              </svg>
            </Icon>
          </button>

          <template v-if="editingId === todo.id">
            <Input
              v-model="editingText"
              v-focus
              class="todo-view__edit-input"
              placeholder="Task description…"
              @keydown.enter.prevent="saveEdit"
              @keydown.esc="cancelEdit"
              @blur="saveEdit"
            />

            <Button
              variant="ghost"
              size="sm"
              aria-label="Save changes"
              class="todo-view__save"
              @mousedown.prevent
              @click="saveEdit"
            >
              <Icon :size="16" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M4 10.5 8 14.5 16 6"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </Icon>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Cancel editing"
              class="todo-view__cancel-edit"
              @mousedown.prevent
              @click="cancelEdit"
            >
              <Icon :size="16" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 6l8 8M14 6l-8 8" fill="none" stroke-linecap="round" />
                </svg>
              </Icon>
            </Button>

            <div
              class="todo-view__priority-group todo-view__priority-inline"
              role="group"
              aria-label="Task priority"
            >
              <Button
                v-for="option in priorityOptions"
                :key="option.value"
                :variant="editingPriority === option.value ? 'primary' : 'ghost'"
                size="sm"
                class="todo-view__priority-button"
                :aria-pressed="editingPriority === option.value"
                :aria-label="`Set task priority to ${option.value}`"
                @mousedown.prevent
                @click="editingPriority = option.value"
              >
                {{ option.label }}
              </Button>
            </div>
          </template>

          <template v-else>
            <span
              class="todo-view__text"
              :class="{ 'todo-view__text--done': todo.done }"
              title="Double-click to edit"
              @dblclick="startEdit(todo)"
            >
              {{ todo.text }}
            </span>

            <Badge
              class="todo-view__priority-badge"
              :variant="priorityMeta[todo.priority].variant"
              :title="`Priority: ${priorityMeta[todo.priority].label}`"
            >
              {{ priorityMeta[todo.priority].label }}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Edit task"
              class="todo-view__edit"
              @click="startEdit(todo)"
            >
              <Icon :size="16" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M13.5 3.5a2.12 2.12 0 0 1 3 3L7 16l-4 1 1-4 9.5-9.5Z"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </Icon>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete task"
              class="todo-view__delete"
              @click="requestDelete(todo.id)"
            >
              <Icon :size="16" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M4 6h12M8 6V4h4v2m-7 0 .8 10.2A2 2 0 0 0 7.8 18h4.4a2 2 0 0 0 2-1.8L15 6"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </Icon>
            </Button>
          </template>
        </li>
      </ul>

      <div v-else class="todo-view__empty-state">
        <Icon :size="32" class="todo-view__empty-icon" aria-hidden="true">
          <svg
            v-if="!hasAnyTasks"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M9 11h6M9 15h4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="7" fill="none" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" fill="none" />
            <line x1="9" y1="11" x2="13" y2="11" fill="none" />
          </svg>
        </Icon>
        <p class="todo-view__empty-title">
          {{ hasAnyTasks ? 'No tasks match your search' : 'No tasks yet' }}
        </p>
        <p class="todo-view__empty-hint">
          {{
            hasAnyTasks
              ? 'Try a different keyword or clear the filter.'
              : 'Add your first task above to get started.'
          }}
        </p>
      </div>

      <Pagination
        v-if="filteredTodos.length > pageSize"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        class="todo-view__pagination"
      />
    </div>

    <Modal v-model="isDeleteModalOpen" title="Delete this task?">
      <p class="todo-view__delete-confirm">
        Are you sure you want to delete
        <strong>{{ pendingDeleteTodo?.text }}</strong
        >? This action cannot be undone.
      </p>
      <template #footer>
        <Button variant="secondary" size="md" @click="cancelDelete">Cancel</Button>
        <Button variant="primary" size="md" @click="confirmDelete">Delete</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.todo-view {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg);
  padding: 3rem 1rem;
}

.todo-view__card {
  width: 100%;
  max-width: 560px;
  background: var(--color-surface-raised);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  height: fit-content;
}

.todo-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.todo-view__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.todo-view__pending-badge {
  font-size: 0.8125rem;
  padding: 0.25rem 0.75rem;
  letter-spacing: 0.01em;
}

.todo-view__search {
  margin-bottom: 1rem;
}

.todo-view__add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-view__add-input {
  flex: 1;
  min-width: 0;
}

.todo-view__priority-group {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.125rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  flex-shrink: 0;
}

.todo-view__priority-button {
  min-width: 2.5rem;
}

.todo-view__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.todo-view__clear {
  color: var(--color-text-muted);
}

.todo-view__clear:hover:not(:disabled) {
  color: var(--color-negative);
}

.todo-view__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.todo-view__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.todo-view__item:last-child {
  border-bottom: none;
}

.todo-view__item--editing {
  flex-wrap: wrap;
}

.todo-view__toggle {
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

.todo-view__text {
  flex: 1;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text);
  cursor: text;
}

.todo-view__text--done {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.todo-view__edit-input {
  flex: 1;
  min-width: 8rem;
}

.todo-view__priority-badge {
  flex-shrink: 0;
}

.todo-view__priority-inline {
  flex-basis: 100%;
  justify-content: flex-end;
  margin-top: 0.125rem;
}

.todo-view__edit,
.todo-view__cancel-edit,
.todo-view__delete {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.todo-view__save {
  flex-shrink: 0;
  color: var(--color-positive);
}

.todo-view__edit:hover:not(:disabled) {
  color: var(--color-accent);
}

.todo-view__delete:hover:not(:disabled) {
  color: var(--color-negative);
}

.todo-view__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 2.5rem 1rem;
  text-align: center;
}

.todo-view__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.todo-view__empty-title {
  margin: 0.5rem 0 0;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}

.todo-view__empty-hint {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.todo-view__pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>
