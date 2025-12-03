import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskEditComponent } from './task-edit.component';
import { TaskService } from '@core/services/task.service';
import { Task, createTaskId } from '@core/models/task.model';

describe('TaskEditComponent', () => {
  let component: TaskEditComponent;
  let fixture: ComponentFixture<TaskEditComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'createTask',
      'updateTask'
    ]);

    await TestBed.configureTestingModule({
      imports: [TaskEditComponent, ReactiveFormsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEditComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values for new task', () => {
    component.task = null;
    component.ngOnInit();

    expect(component.taskForm.get('title')?.value).toBe('');
    expect(component.taskForm.get('description')?.value).toBe('');
    expect(component.taskForm.get('status')?.value).toBe('pending');
  });

  it('should initialize form with task values for editing', () => {
    const mockTask: Task = {
      id: createTaskId('1'),
      title: 'Test Task',
      description: 'Test Description',
      status: 'in-progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.task = mockTask;
    component.ngOnInit();

    expect(component.taskForm.get('title')?.value).toBe('Test Task');
    expect(component.taskForm.get('description')?.value).toBe('Test Description');
    expect(component.taskForm.get('status')?.value).toBe('in-progress');
  });

  it('should validate title is required', () => {
    component.ngOnInit();
    const titleControl = component.taskForm.get('title');

    titleControl?.setValue('');
    titleControl?.markAsTouched();

    expect(titleControl?.hasError('required')).toBe(true);
    expect(component.getTitleError()).toBe('Title is required');
  });

  it('should validate title minimum length', () => {
    component.ngOnInit();
    const titleControl = component.taskForm.get('title');

    titleControl?.setValue('ab');
    titleControl?.markAsTouched();

    expect(titleControl?.hasError('minlength')).toBe(true);
    expect(component.getTitleError()).toBe('Title must be at least 3 characters');
  });

  it('should validate description is required', () => {
    component.ngOnInit();
    const descControl = component.taskForm.get('description');

    descControl?.setValue('');
    descControl?.markAsTouched();

    expect(descControl?.hasError('required')).toBe(true);
    expect(component.getDescriptionError()).toBe('Description is required');
  });

  it('should validate description minimum length', () => {
    component.ngOnInit();
    const descControl = component.taskForm.get('description');

    descControl?.setValue('short');
    descControl?.markAsTouched();

    expect(descControl?.hasError('minlength')).toBe(true);
    expect(component.getDescriptionError()).toBe('Description must be at least 10 characters');
  });

  it('should not submit if form is invalid', () => {
    component.ngOnInit();
    component.taskForm.patchValue({
      title: '',
      description: '',
      status: 'pending'
    });

    component.onSubmit();

    expect(taskService.createTask).not.toHaveBeenCalled();
    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  it('should create new task on valid submit', () => {
    component.task = null;
    component.ngOnInit();

    component.taskForm.patchValue({
      title: 'New Task',
      description: 'New Description',
      status: 'pending'
    });

    spyOn(component.closed, 'emit');
    component.onSubmit();

    expect(taskService.createTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Description',
      status: 'pending'
    });
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should update existing task on valid submit', () => {
    const mockTask: Task = {
      id: createTaskId('1'),
      title: 'Old Title',
      description: 'Old Description',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.task = mockTask;
    component.ngOnInit();

    component.taskForm.patchValue({
      title: 'Updated Title',
      description: 'Updated Description',
      status: 'done'
    });

    spyOn(component.closed, 'emit');
    component.onSubmit();

    expect(taskService.updateTask).toHaveBeenCalledWith(createTaskId('1'), {
      title: 'Updated Title',
      description: 'Updated Description',
      status: 'done'
    });
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should emit closed event on cancel', () => {
    component.ngOnInit();
    spyOn(component.closed, 'emit');

    component.onCancel();

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should reset form on close', () => {
    component.ngOnInit();
    component.taskForm.patchValue({
      title: 'Some Title',
      description: 'Some Description',
      status: 'in-progress'
    });

    spyOn(component.taskForm, 'reset');
    spyOn(component.closed, 'emit');

    component.close();

    expect(component.taskForm.reset).toHaveBeenCalled();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const date = new Date('2024-03-15T14:05:00');
    const formatted = component.formatDate(date);

    expect(formatted).toContain('2024');
    expect(formatted).toContain('March');
    expect(formatted).toContain('15');
  });

  it('should mark all fields as touched on invalid submit', () => {
    component.ngOnInit();

    spyOn(component.titleControl!, 'markAsTouched');
    spyOn(component.descriptionControl!, 'markAsTouched');
    spyOn(component.statusControl!, 'markAsTouched');

    component.onSubmit();

    expect(component.titleControl!.markAsTouched).toHaveBeenCalled();
    expect(component.descriptionControl!.markAsTouched).toHaveBeenCalled();
    expect(component.statusControl!.markAsTouched).toHaveBeenCalled();
  });
});
