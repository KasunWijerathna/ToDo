import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '@core/services/task.service';
import {
  Task,
  TaskStatus,
  TaskId,
  SortField,
  TASK_STATUS_LABELS,
  TASK_STATUS_BADGE_VARIANTS
} from '@core/models/task.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TaskEditComponent } from '../task-edit/task-edit.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent, TaskEditComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(6);
  isAddModalOpen = signal(false);

  // Signals from service
  readonly allTasks = this.taskService.filteredTasks;
  readonly stats = this.taskService.taskStats;
  readonly currentFilter = this.taskService.statusFilter;
  readonly currentSort = this.taskService.sort;

  // Computed paginated tasks
  readonly tasks = computed(() => {
    const all = this.allTasks();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.allTasks().length / this.pageSize());
  });

  constructor(
    public taskService: TaskService,
    private router: Router
  ) {}

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.taskService.setSearchTerm(term);
    this.currentPage.set(1); // Reset to first page on search
  }

  onFilterChange(status: TaskStatus | 'all'): void {
    this.taskService.setStatusFilter(status);
    this.currentPage.set(1); // Reset to first page on filter
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [field, order] = value.split('-') as [SortField, 'asc' | 'desc'];
    this.taskService.setSort(field, order);
  }

  viewTaskDetails(task: Task): void {
    // Navigate to task details page
    this.router.navigate(['/tasks', task.id]);
  }

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  }

  getStatusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }

  getStatusBadgeVariant(status: TaskStatus): 'default' | 'warning' | 'success' {
    return TASK_STATUS_BADGE_VARIANTS[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByTaskId(index: number, task: Task): TaskId {
    return task.id;
  }
}
