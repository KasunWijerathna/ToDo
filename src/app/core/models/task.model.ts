// Branded type for Task ID (prevents mixing IDs with regular strings)
export type TaskId = string & { readonly __brand: 'TaskId' };

// Task status with const assertion for better type inference
export const TaskStatusValues = ['pending', 'in-progress', 'done'] as const;
export type TaskStatus = typeof TaskStatusValues[number];

// Utility type to ensure status values are exhaustive
export type TaskStatusMap<T> = {
  [K in TaskStatus]: T;
};

// Main Task interface with readonly properties for immutability
export interface Task {
  readonly id: TaskId;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

// Form data type that excludes system fields
export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

// Partial update type - only includes modifiable fields
export type TaskUpdate = Partial<TaskFormData> & { readonly updatedAt: Date };

// Filter configuration
export interface TaskFilter {
  readonly searchTerm: string;
  readonly status?: TaskStatus | 'all';
}

// Sort configuration with type-safe field names
export type SortField = keyof Pick<Task, 'title' | 'createdAt' | 'status'>;
export type SortOrder = 'asc' | 'desc';

export interface TaskSort {
  readonly field: SortField;
  readonly order: SortOrder;
}

// Statistics interface
export interface TaskStats {
  readonly total: number;
  readonly pending: number;
  readonly inProgress: number;
  readonly done: number;
}

// Helper type for creating new tasks
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

// Deep readonly utility for nested objects
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Type guard for TaskStatus
export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && TaskStatusValues.includes(value as TaskStatus);
}

// Type guard for Task
export function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'description' in value &&
    'status' in value &&
    isTaskStatus((value as Task).status)
  );
}

// Helper to create branded TaskId
export function createTaskId(id: string): TaskId {
  return id as TaskId;
}

// Const assertion for task status labels with type safety
export const TASK_STATUS_LABELS: TaskStatusMap<string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'done': 'Done'
} as const;

// Const assertion for badge variants
export const TASK_STATUS_BADGE_VARIANTS: TaskStatusMap<'default' | 'warning' | 'success'> = {
  'pending': 'default',
  'in-progress': 'warning',
  'done': 'success'
} as const;
