import { Component, Input, Output, EventEmitter, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '@core/models/task.model';
import { TaskService } from '@core/services/task.service';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ButtonComponent, InputComponent],
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskEditComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() closed = new EventEmitter<void>();

  taskForm!: FormGroup;
  isSubmitting = signal(false);

  statusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'done', label: 'Done' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: [this.task?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.task?.description || '', [Validators.required, Validators.minLength(10)]],
      status: [this.task?.status || 'pending', Validators.required]
    });
  }

  get titleControl() {
    return this.taskForm.get('title');
  }

  get descriptionControl() {
    return this.taskForm.get('description');
  }

  get statusControl() {
    return this.taskForm.get('status');
  }

  getTitleError(): string | undefined {
    if (this.titleControl?.hasError('required') && this.titleControl?.touched) {
      return 'Title is required';
    }
    if (this.titleControl?.hasError('minlength') && this.titleControl?.touched) {
      return 'Title must be at least 3 characters';
    }
    return undefined;
  }

  getDescriptionError(): string | undefined {
    if (this.descriptionControl?.hasError('required') && this.descriptionControl?.touched) {
      return 'Description is required';
    }
    if (this.descriptionControl?.hasError('minlength') && this.descriptionControl?.touched) {
      return 'Description must be at least 10 characters';
    }
    return undefined;
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      Object.keys(this.taskForm.controls).forEach(key => {
        this.taskForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.taskForm.value;

      if (this.task) {
        // Update existing task
        this.taskService.updateTask(this.task.id, formValue);
      } else {
        // Create new task
        this.taskService.createTask(formValue);
      }

      this.close();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.close();
  }

  close(): void {
    this.taskForm.reset();
    this.closed.emit();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
