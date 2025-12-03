import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskStatus, TaskFormData, TaskSort, SortField, SortOrder, TaskId, createTaskId } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Signals for state management
  private readonly tasksSignal = signal<Task[]>(this.loadTasksFromStorage());
  private readonly searchTermSignal = signal<string>('');
  private readonly statusFilterSignal = signal<TaskStatus | 'all'>('all');
  private readonly sortSignal = signal<TaskSort>({ field: 'createdAt', order: 'desc' });
  private readonly errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly tasks = this.tasksSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly statusFilter = this.statusFilterSignal.asReadonly();
  readonly sort = this.sortSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals for derived state
  readonly filteredTasks = computed(() => {
    let result = this.tasksSignal();
    const search = this.searchTermSignal().toLowerCase();
    const status = this.statusFilterSignal();

    // Apply search filter
    if (search) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (status !== 'all') {
      result = result.filter(task => task.status === status);
    }

    // Apply sorting
    const sortConfig = this.sortSignal();
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  readonly taskStats = computed(() => {
    const allTasks = this.tasksSignal();
    return {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      done: allTasks.filter(t => t.status === 'done').length
    };
  });

  constructor() {
    // Auto-save to localStorage whenever tasks change
    this.tasks().forEach(() => this.saveTasksToStorage());
  }

  // CRUD Operations
  createTask(formData: TaskFormData): void {
    try {
      if (!formData.title.trim()) {
        this.setError('Task title is required');
        return;
      }

      const newTask: Task = {
        id: createTaskId(this.generateId()),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.tasksSignal.update(tasks => [...tasks, newTask]);
      this.saveTasksToStorage();
      this.clearError();
    } catch (error) {
      this.setError('Failed to create task');
      console.error('Error creating task:', error);
    }
  }

  updateTask(id: TaskId, updates: Partial<TaskFormData>): void {
    try {
      this.tasksSignal.update(tasks =>
        tasks.map(task =>
          task.id === id
            ? {
                ...task,
                ...updates,
                title: updates.title?.trim() ?? task.title,
                description: updates.description?.trim() ?? task.description,
                updatedAt: new Date()
              }
            : task
        )
      );
      this.saveTasksToStorage();
      this.clearError();
    } catch (error) {
      this.setError('Failed to update task');
      console.error('Error updating task:', error);
    }
  }

  deleteTask(id: TaskId): void {
    try {
      this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
      this.saveTasksToStorage();
      this.clearError();
    } catch (error) {
      this.setError('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  }

  getTaskById(id: TaskId): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);
  }

  // Filter and Sort methods
  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
  }

  setStatusFilter(status: TaskStatus | 'all'): void {
    this.statusFilterSignal.set(status);
  }

  setSort(field: SortField, order: SortOrder): void {
    this.sortSignal.set({ field, order });
  }

  toggleSortOrder(): void {
    this.sortSignal.update(sort => ({
      ...sort,
      order: sort.order === 'asc' ? 'desc' : 'asc'
    }));
  }

  // Error handling
  private setError(message: string): void {
    this.errorSignal.set(message);
    setTimeout(() => this.clearError(), 5000);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  // LocalStorage operations
  private loadTasksFromStorage(): Task[] {
    try {
      const stored = localStorage.getItem('angular-tasks');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
    }
    return this.getMockTasks();
  }

  private saveTasksToStorage(): void {
    try {
      localStorage.setItem('angular-tasks', JSON.stringify(this.tasksSignal()));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
      this.setError('Failed to save tasks');
    }
  }

  // Mock data for initial state
  private getMockTasks(): Task[] {
    return [
      {
        id: createTaskId('1'),
        title: 'Fix login bug',
        description: 'Users are unable to log in when entering correct credentials',
        status: 'done',
        createdAt: new Date('2024-03-15T14:05:00'),
        updatedAt: new Date('2024-03-15T14:05:00')
      },
      {
        id: createTaskId('2'),
        title: 'Implement search',
        description: 'Add search functionality to the task list',
        status: 'in-progress',
        createdAt: new Date('2024-03-16T10:30:00'),
        updatedAt: new Date('2024-03-16T10:30:00')
      },
      {
        id: createTaskId('3'),
        title: 'Update documentation',
        description: 'Update user documentation with new features',
        status: 'pending',
        createdAt: new Date('2024-03-17T09:15:00'),
        updatedAt: new Date('2024-03-17T09:15:00')
      }
    ];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
