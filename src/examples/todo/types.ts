import type { BadgeVariant } from '@/components/atoms/Badge'

export type Priority = 'low' | 'medium' | 'high'

export type SortMode = 'created' | 'priority' | 'alphabetical'

export interface Todo {
  id: number
  text: string
  done: boolean
  /** Optional — legacy/seed entries may not have one. */
  priority?: Priority
}

export const STORAGE_KEY = 'cagm-ui-todo-demo'

export const PRIORITY_META: Record<Priority, { label: string; badge: BadgeVariant; rank: number }> = {
  high: { label: 'High', badge: 'negative', rank: 0 },
  medium: { label: 'Medium', badge: 'warning', rank: 1 },
  low: { label: 'Low', badge: 'info', rank: 2 },
}

/** Options for the priority button-group; `undefined` means "no priority". */
export const PRIORITY_OPTIONS: { value: Priority | undefined; key: string; label: string }[] = [
  { value: undefined, key: 'none', label: 'None' },
  { value: 'low', key: 'low', label: 'Low' },
  { value: 'medium', key: 'medium', label: 'Medium' },
  { value: 'high', key: 'high', label: 'High' },
]

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'alphabetical', label: 'A–Z' },
]

export function isPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high'
}
