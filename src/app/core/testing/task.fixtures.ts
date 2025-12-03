import { Task, TaskId, TaskStatus, TaskFormData, createTaskId } from '../models/task.model';

/**
 * Test data builders for creating mock tasks
 * Follows the Builder pattern for flexible test data creation
 */
export class TaskBuilder {
  private task: Partial<Task> = {
    id: createTaskId('test-task-1'),
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00')
  };

  withId(id: string): this {
    this.task.id = createTaskId(id);
    return this;
  }

  withTitle(title: string): this {
    this.task.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.task.description = description;
    return this;
  }

  withStatus(status: TaskStatus): this {
    this.task.status = status;
    return this;
  }

  withCreatedAt(date: Date): this {
    this.task.createdAt = date;
    return this;
  }

  withUpdatedAt(date: Date): this {
    this.task.updatedAt = date;
    return this;
  }

  build(): Task {
    return this.task as Task;
  }
}

/**
 * Factory functions for common test scenarios
 */
export const TaskFixtures = {
  /**
   * Creates a pending task
   */
  pending(): Task {
    return new TaskBuilder()
      .withStatus('pending')
      .build();
  },

  /**
   * Creates an in-progress task
   */
  inProgress(): Task {
    return new TaskBuilder()
      .withStatus('in-progress')
      .withTitle('In Progress Task')
      .build();
  },

  /**
   * Creates a completed task
   */
  done(): Task {
    return new TaskBuilder()
      .withStatus('done')
      .withTitle('Completed Task')
      .build();
  },

  /**
   * Creates a list of tasks with different statuses
   */
  list(): Task[] {
    return [
      new TaskBuilder()
        .withId('1')
        .withTitle('Fix login bug')
        .withStatus('done')
        .build(),
      new TaskBuilder()
        .withId('2')
        .withTitle('Implement search')
        .withStatus('in-progress')
        .build(),
      new TaskBuilder()
        .withId('3')
        .withTitle('Update documentation')
        .withStatus('pending')
        .build()
    ];
  },

  /**
   * Creates a large list for performance testing
   */
  largeList(count: number = 100): Task[] {
    return Array.from({ length: count }, (_, index) =>
      new TaskBuilder()
        .withId(`task-${index}`)
        .withTitle(`Task ${index}`)
        .withDescription(`Description for task ${index}`)
        .withStatus(['pending', 'in-progress', 'done'][index % 3] as TaskStatus)
        .withCreatedAt(new Date(Date.now() - index * 1000 * 60))
        .build()
    );
  },

  /**
   * Creates form data for testing
   */
  formData(overrides?: Partial<TaskFormData>): TaskFormData {
    return {
      title: 'Test Task',
      description: 'Test task description',
      status: 'pending',
      ...overrides
    };
  }
};

/**
 * Mock data for specific test scenarios
 */
export const MOCK_TASKS = {
  PENDING: TaskFixtures.pending(),
  IN_PROGRESS: TaskFixtures.inProgress(),
  DONE: TaskFixtures.done(),
  LIST: TaskFixtures.list()
};
