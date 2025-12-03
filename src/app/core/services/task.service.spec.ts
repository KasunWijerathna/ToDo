import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task, TaskStatus, createTaskId } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Task CRUD Operations', () => {
    it('should create a new task', () => {
      const initialCount = service.tasks().length;
      service.createTask({
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending'
      });

      expect(service.tasks().length).toBe(initialCount + 1);
      const newTask = service.tasks()[service.tasks().length - 1];
      expect(newTask.title).toBe('Test Task');
      expect(newTask.description).toBe('Test Description');
      expect(newTask.status).toBe('pending');
    });

    it('should not create task with empty title', () => {
      const initialCount = service.tasks().length;
      service.createTask({
        title: '   ',
        description: 'Test Description',
        status: 'pending'
      });

      expect(service.tasks().length).toBe(initialCount);
      expect(service.error()).toBeTruthy();
    });

    it('should update an existing task', () => {
      service.createTask({
        title: 'Original Title',
        description: 'Original Description',
        status: 'pending'
      });

      const task = service.tasks()[service.tasks().length - 1];
      service.updateTask(task.id, {
        title: 'Updated Title',
        status: 'done'
      });

      const updatedTask = service.getTaskById(task.id);
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.status).toBe('done');
      expect(updatedTask?.updatedAt).toBeTruthy();
    });

    it('should delete a task', () => {
      service.createTask({
        title: 'Task to Delete',
        description: 'Will be deleted',
        status: 'pending'
      });

      const initialCount = service.tasks().length;
      const task = service.tasks()[service.tasks().length - 1];
      service.deleteTask(task.id);

      expect(service.tasks().length).toBe(initialCount - 1);
      expect(service.getTaskById(task.id)).toBeUndefined();
    });

    it('should get task by id', () => {
      service.createTask({
        title: 'Find Me',
        description: 'Test',
        status: 'pending'
      });

      const task = service.tasks()[service.tasks().length - 1];
      const foundTask = service.getTaskById(task.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.title).toBe('Find Me');
    });
  });

  describe('Filtering and Searching', () => {
    beforeEach(() => {
      service.createTask({
        title: 'First Task',
        description: 'First Description',
        status: 'pending'
      });
      service.createTask({
        title: 'Second Task',
        description: 'Second Description',
        status: 'in-progress'
      });
      service.createTask({
        title: 'Third Task',
        description: 'Third Description',
        status: 'done'
      });
    });

    it('should filter tasks by search term', () => {
      service.setSearchTerm('First');
      const filtered = service.filteredTasks();

      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('First Task');
    });

    it('should filter tasks by status', () => {
      service.setStatusFilter('done');
      const filtered = service.filteredTasks();

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(task => {
        expect(task.status).toBe('done');
      });
    });

    it('should show all tasks when filter is "all"', () => {
      service.setStatusFilter('all');
      const filtered = service.filteredTasks();

      expect(filtered.length).toBe(service.tasks().length);
    });

    it('should filter by both search term and status', () => {
      service.setSearchTerm('Task');
      service.setStatusFilter('pending');
      const filtered = service.filteredTasks();

      filtered.forEach(task => {
        expect(task.status).toBe('pending');
        expect(task.title.toLowerCase()).toContain('task');
      });
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      service.createTask({
        title: 'C Task',
        description: 'Test',
        status: 'pending'
      });
      service.createTask({
        title: 'A Task',
        description: 'Test',
        status: 'done'
      });
      service.createTask({
        title: 'B Task',
        description: 'Test',
        status: 'in-progress'
      });
    });

    it('should sort tasks by title ascending', () => {
      service.setSort('title', 'asc');
      const sorted = service.filteredTasks();

      expect(sorted[0].title.localeCompare(sorted[1].title)).toBeLessThan(0);
    });

    it('should sort tasks by title descending', () => {
      service.setSort('title', 'desc');
      const sorted = service.filteredTasks();

      expect(sorted[0].title.localeCompare(sorted[1].title)).toBeGreaterThan(0);
    });

    it('should toggle sort order', () => {
      service.setSort('title', 'asc');
      const initialOrder = service.sort().order;

      service.toggleSortOrder();

      expect(service.sort().order).not.toBe(initialOrder);
    });
  });

  describe('Task Statistics', () => {
    it('should calculate task statistics correctly', () => {
      service.createTask({
        title: 'Pending Task',
        description: 'Test',
        status: 'pending'
      });
      service.createTask({
        title: 'In Progress Task',
        description: 'Test',
        status: 'in-progress'
      });
      service.createTask({
        title: 'Done Task',
        description: 'Test',
        status: 'done'
      });

      const stats = service.taskStats();

      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.pending).toBeGreaterThanOrEqual(1);
      expect(stats.inProgress).toBeGreaterThanOrEqual(1);
      expect(stats.done).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should set error message when task creation fails', () => {
      service.createTask({
        title: '',
        description: 'Test',
        status: 'pending'
      });

      expect(service.error()).toBeTruthy();
    });

    it('should clear error after timeout', fakeAsync(() => {
      service.createTask({
        title: '',
        description: 'Test',
        status: 'pending'
      });

      expect(service.error()).toBeTruthy();

      tick(5100);

      expect(service.error()).toBeNull();
    }));

    it('should clear error manually', () => {
      service.createTask({
        title: '',
        description: 'Test',
        status: 'pending'
      });

      expect(service.error()).toBeTruthy();
      service.clearError();
      expect(service.error()).toBeNull();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should save tasks to localStorage', () => {
      service.createTask({
        title: 'Persistent Task',
        description: 'Should be saved',
        status: 'pending'
      });

      const stored = localStorage.getItem('angular-tasks');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should load tasks from localStorage on initialization', () => {
      const mockTasks: Task[] = [
        {
          id: createTaskId('1'),
          title: 'Stored Task',
          description: 'From storage',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      localStorage.setItem('angular-tasks', JSON.stringify(mockTasks));

      const newService = new TaskService();
      expect(newService.tasks().length).toBeGreaterThan(0);
    });
  });
});
