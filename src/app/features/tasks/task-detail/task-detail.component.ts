import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '@core/services/task.service';
import { Task, TaskId, TASK_STATUS_LABELS, TASK_STATUS_BADGE_VARIANTS, createTaskId } from '@core/models/task.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TaskEditComponent } from '../task-edit/task-edit.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, TaskEditComponent],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnInit {
  task = signal<Task | null>(null);
  isEditModalOpen = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      const foundTask = this.taskService.getTaskById(createTaskId(taskId));
      if (foundTask) {
        this.task.set(foundTask);
      } else {
        // Task not found, navigate back to list
        this.router.navigate(['/tasks']);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  openEditModal(): void {
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    // Refresh task data after edit
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      const updatedTask = this.taskService.getTaskById(createTaskId(taskId));
      if (updatedTask) {
        this.task.set(updatedTask);
      }
    }
  }

  deleteTask(): void {
    const currentTask = this.task();
    if (currentTask && confirm(`Are you sure you want to delete "${currentTask.title}"?`)) {
      this.taskService.deleteTask(currentTask.id);
      this.router.navigate(['/tasks']);
    }
  }

  getStatusLabel(status: string): string {
    return TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS];
  }

  getStatusBadgeVariant(status: string): 'default' | 'warning' | 'success' {
    return TASK_STATUS_BADGE_VARIANTS[status as keyof typeof TASK_STATUS_BADGE_VARIANTS];
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
