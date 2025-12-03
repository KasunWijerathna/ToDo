import { Routes } from '@angular/router';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';
import { TaskDetailComponent } from './features/tasks/task-detail/task-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    component: TaskListComponent,
    title: 'Task List - Task Manager'
  },
  {
    path: 'tasks/:id',
    component: TaskDetailComponent,
    title: 'Task Details - Task Manager'
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
