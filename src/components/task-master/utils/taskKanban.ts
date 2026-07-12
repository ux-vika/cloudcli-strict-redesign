import type { TFunction } from 'i18next';
import type { TaskKanbanColumn, TaskMasterTask } from '../types';

const KANBAN_COLUMN_CONFIG = [
  {
    id: 'pending',
    titleKey: 'kanban.pending',
    status: 'pending',
    color: 'border-transparent bg-transparent',
    headerColor: 'rounded-lg bg-secondary text-muted-foreground',
  },
  {
    id: 'in-progress',
    titleKey: 'kanban.inProgress',
    status: 'in-progress',
    color: 'border-transparent bg-transparent',
    headerColor: 'rounded-lg bg-primary-tint text-primary',
  },
  {
    id: 'done',
    titleKey: 'kanban.done',
    status: 'done',
    color: 'border-transparent bg-transparent',
    headerColor: 'rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    id: 'blocked',
    titleKey: 'kanban.blocked',
    status: 'blocked',
    color: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700',
    headerColor: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
  },
  {
    id: 'deferred',
    titleKey: 'kanban.deferred',
    status: 'deferred',
    color: 'bg-amber-50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-700',
    headerColor: 'bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200',
  },
  {
    id: 'cancelled',
    titleKey: 'kanban.cancelled',
    status: 'cancelled',
    color: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700',
    headerColor: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  },
] as const;

const CORE_WORKFLOW_STATUSES = new Set(['pending', 'in-progress', 'done']);

export function buildKanbanColumns(tasks: TaskMasterTask[], t: TFunction<'tasks'>): TaskKanbanColumn[] {
  const tasksByStatus = tasks.reduce<Record<string, TaskMasterTask[]>>((accumulator, task) => {
    const status = task.status ?? 'pending';
    if (!accumulator[status]) {
      accumulator[status] = [];
    }
    accumulator[status].push(task);
    return accumulator;
  }, {});

  return KANBAN_COLUMN_CONFIG.filter((column) => {
    const hasTasks = (tasksByStatus[column.status] ?? []).length > 0;
    return hasTasks || CORE_WORKFLOW_STATUSES.has(column.status);
  }).map((column) => ({
    id: column.id,
    title: t(column.titleKey),
    status: column.status,
    color: column.color,
    headerColor: column.headerColor,
    tasks: tasksByStatus[column.status] ?? [],
  }));
}
