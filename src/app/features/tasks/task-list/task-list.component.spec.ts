import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '@core/services/task.service';
import { Task, createTaskId } from '@core/models/task.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;

  let mockFilteredTasks = signal<Task[]>([]);

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'setSearchTerm',
      'setStatusFilter',
      'setSort'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Reset mock tasks
    mockFilteredTasks = signal([]);

    // Mock signals
    taskServiceSpy.filteredTasks = mockFilteredTasks.asReadonly();
    taskServiceSpy.taskStats = signal({
      total: 0,
      pending: 0,
      inProgress: 0,
      done: 0
    });
    taskServiceSpy.statusFilter = signal('all' as const);
    taskServiceSpy.sort = signal({ field: 'createdAt' as const, order: 'desc' as const });

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search term', () => {
    expect(component.searchTerm()).toBe('');
  });

  it('should update search term and call service', () => {
    component.onSearchChange('test');

    expect(component.searchTerm()).toBe('test');
    expect(taskService.setSearchTerm).toHaveBeenCalledWith('test');
    expect(component.currentPage()).toBe(1);
  });

  it('should call service when filter changes', () => {
    component.onFilterChange('done');

    expect(taskService.setStatusFilter).toHaveBeenCalledWith('done');
    expect(component.currentPage()).toBe(1);
  });

  it('should open add modal', () => {
    expect(component.isAddModalOpen()).toBe(false);

    component.openAddModal();

    expect(component.isAddModalOpen()).toBe(true);
  });

  it('should close add modal', () => {
    component.openAddModal();
    expect(component.isAddModalOpen()).toBe(true);

    component.closeAddModal();

    expect(component.isAddModalOpen()).toBe(false);
  });

  it('should navigate to specific page when valid', () => {
    // Mock having multiple pages
    const mockTasks = Array.from({ length: 15 }, (_, i) => ({
      id: createTaskId(`${i}`),
      title: `Task ${i}`,
      description: 'Test',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    mockFilteredTasks.set(mockTasks);

    component.goToPage(2);

    expect(component.currentPage()).toBe(2);
  });

  it('should not navigate to invalid page', () => {
    component.goToPage(0);
    expect(component.currentPage()).toBe(1);

    component.goToPage(999);
    expect(component.currentPage()).toBe(1);
  });

  it('should go to next page when possible', () => {
    // Mock having multiple pages
    const mockTasks = Array.from({ length: 15 }, (_, i) => ({
      id: createTaskId(`${i}`),
      title: `Task ${i}`,
      description: 'Test',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    mockFilteredTasks.set(mockTasks);

    component.currentPage.set(1);

    component.nextPage();

    expect(component.currentPage()).toBe(2);
  });

  it('should go to previous page', () => {
    component.currentPage.set(2);

    component.previousPage();

    expect(component.currentPage()).toBe(1);
  });

  it('should not go to previous page from first page', () => {
    component.currentPage.set(1);

    component.previousPage();

    expect(component.currentPage()).toBe(1);
  });

  it('should parse and set sort when sort changes', () => {
    const event = {
      target: { value: 'title-asc' }
    } as any;

    component.onSortChange(event);

    expect(taskService.setSort).toHaveBeenCalledWith('title', 'asc');
  });

  it('should navigate to task details when viewTaskDetails is called', () => {
    const mockTask = {
      id: createTaskId('123'),
      title: 'Test Task',
      description: 'Test',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.viewTaskDetails(mockTask);

    expect(router.navigate).toHaveBeenCalledWith(['/tasks', createTaskId('123')]);
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('pending')).toBe('Pending');
    expect(component.getStatusLabel('in-progress')).toBe('In Progress');
    expect(component.getStatusLabel('done')).toBe('Done');
  });

  it('should format date correctly', () => {
    const date = new Date('2024-03-15T14:05:00');
    const formatted = component.formatDate(date);

    expect(formatted).toContain('2024');
    expect(formatted).toContain('Mar');
  });

  it('should track tasks by id', () => {
    const mockTask = {
      id: createTaskId('unique-id'),
      title: 'Test',
      description: 'Test',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const trackId = component.trackByTaskId(0, mockTask);

    expect(trackId).toBe(createTaskId('unique-id'));
  });
});
