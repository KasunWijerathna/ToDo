import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TaskDetailComponent } from './task-detail.component';
import { TaskService } from '@core/services/task.service';
import { Task, createTaskId } from '@core/models/task.model';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockTask: Task = {
    id: createTaskId('test-123'),
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    createdAt: new Date('2024-03-15T14:05:00'),
    updatedAt: new Date('2024-03-15T14:05:00')
  };

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTaskById',
      'deleteTask'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-123')
        }
      }
    };

    taskServiceSpy.getTaskById.and.returnValue(mockTask);

    await TestBed.configureTestingModule({
      imports: [TaskDetailComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load task on init when task exists', () => {
    fixture.detectChanges();

    expect(taskService.getTaskById).toHaveBeenCalledWith(createTaskId('test-123'));
    expect(component.task()).toEqual(mockTask);
  });

  it('should navigate to tasks list when task not found', () => {
    taskService.getTaskById.and.returnValue(undefined);

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should not load task when no task ID in route', () => {
    activatedRoute.snapshot.paramMap.get.and.returnValue(null);

    fixture.detectChanges();

    expect(taskService.getTaskById).not.toHaveBeenCalled();
    expect(component.task()).toBeNull();
  });

  it('should navigate back to tasks list', () => {
    fixture.detectChanges();

    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should open edit modal', () => {
    fixture.detectChanges();

    expect(component.isEditModalOpen()).toBe(false);

    component.openEditModal();

    expect(component.isEditModalOpen()).toBe(true);
  });

  it('should close edit modal', () => {
    fixture.detectChanges();

    component.openEditModal();
    expect(component.isEditModalOpen()).toBe(true);

    component.closeEditModal();

    expect(component.isEditModalOpen()).toBe(false);
  });

  it('should delete task after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    fixture.detectChanges();

    component.deleteTask();

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Test Task"?'
    );
    expect(taskService.deleteTask).toHaveBeenCalledWith(createTaskId('test-123'));
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should not delete task if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    fixture.detectChanges();

    component.deleteTask();

    expect(taskService.deleteTask).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not delete task if no task is loaded', () => {
    spyOn(window, 'confirm');
    component.task.set(null);

    component.deleteTask();

    expect(window.confirm).not.toHaveBeenCalled();
    expect(taskService.deleteTask).not.toHaveBeenCalled();
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('pending')).toBe('Pending');
    expect(component.getStatusLabel('in-progress')).toBe('In Progress');
    expect(component.getStatusLabel('done')).toBe('Done');
  });

  it('should return correct status badge variant', () => {
    expect(component.getStatusBadgeVariant('pending')).toBe('default');
    expect(component.getStatusBadgeVariant('in-progress')).toBe('warning');
    expect(component.getStatusBadgeVariant('done')).toBe('success');
  });

  it('should format date correctly', () => {
    const date = new Date('2024-03-15T14:05:00');
    const formatted = component.formatDate(date);

    expect(formatted).toContain('2024');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('15');
  });
});
