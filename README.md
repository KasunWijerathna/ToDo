# Angular Task Manager

A modern task management application built with Angular 17+, featuring Signals for reactive state management, comprehensive form validation, and a fully accessible UI.

## Features

### Core Functionality
- ✅ **CRUD Operations** - Create, Read, Update, and Delete tasks
- 🔍 **Search** - Real-time search across task titles and descriptions
- 🎯 **Filter** - Filter tasks by status (Pending, In Progress, Done)
- 📊 **Sort** - Sort tasks by title, date, or status (ascending/descending)
- 💾 **Persistence** - Local storage for data persistence
- ✨ **Signals** - Angular Signals for reactive state management

### UI/UX
- 🎨 Modern, responsive design with Tailwind CSS
- ♿ Full accessibility support (ARIA labels, keyboard navigation)
- 📱 Mobile-first responsive layout
- 🎭 Clean modal for editing tasks
- 🔔 Error handling with user feedback

### Code Quality
- 📝 TypeScript with strict mode
- 🧪 Comprehensive unit tests (80%+ coverage)
- 🏗️ Clean architecture with feature modules
- ♻️ Reusable components
- 📐 Best practices and design patterns

## Technology Stack

- **Framework**: Angular 17.3+
- **Language**: TypeScript 5.4+
- **State Management**: Angular Signals
- **Styling**: Tailwind CSS
- **Testing**: Jasmine & Karma
- **Build Tool**: Angular CLI

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/           # Data models and interfaces
│   │   │   └── task.model.ts
│   │   └── services/         # Business logic services
│   │       └── task.service.ts
│   ├── features/
│   │   └── tasks/
│   │       ├── task-list/    # Task list page
│   │       └── task-edit/    # Task edit modal
│   ├── shared/
│   │   └── components/       # Reusable UI components
│   │       ├── button/
│   │       ├── input/
│   │       ├── modal/
│   │       └── badge/
│   ├── app.component.ts
│   └── app.routes.ts
├── styles.scss
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Assessment
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you change source files.

### Build

Build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Testing

Run unit tests:
```bash
npm test
```

Run tests with coverage report:
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Linting

```bash
npm run lint
```

## Architecture

### State Management with Signals

The application uses Angular Signals for reactive state management:

```typescript
// Read-only signals exposed to components
readonly tasks = this.tasksSignal.asReadonly();
readonly filteredTasks = computed(() => { /* filtering logic */ });

// Computed signals for derived state
readonly taskStats = computed(() => ({
  total: allTasks.length,
  pending: allTasks.filter(t => t.status === 'pending').length,
  // ...
}));
```

### Component Architecture

- **Standalone Components**: All components are standalone for better tree-shaking
- **Smart/Container Components**: Handle business logic and state
- **Presentational Components**: Reusable UI components with inputs/outputs

### Form Validation

Forms use reactive forms with built-in validators:

```typescript
this.taskForm = this.fb.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  description: ['', [Validators.required, Validators.minLength(10)]],
  status: ['pending', Validators.required]
});
```

## Accessibility Features

- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support

## Key Components

### TaskService
Central service for task management using Angular Signals:
- CRUD operations
- Search and filter logic
- Sorting functionality
- LocalStorage integration
- Error handling

### TaskListComponent
Main page displaying tasks:
- Search input
- Filter and sort controls
- Task cards grid
- Empty state handling

### TaskEditComponent
Modal for creating/editing tasks:
- Reactive forms with validation
- Real-time error feedback
- Accessibility features

### Reusable Components
- **ButtonComponent**: Configurable button with variants
- **InputComponent**: Form input with validation support
- **ModalComponent**: Accessible modal dialog
- **BadgeComponent**: Status badge component

## Testing Strategy

### Unit Tests Coverage
- ✅ Service layer (TaskService)
- ✅ Component logic (TaskListComponent, TaskEditComponent)
- ✅ Form validation
- ✅ Reusable components (ButtonComponent, etc.)
- ✅ Error handling
- ✅ LocalStorage integration

### Running Specific Tests
```bash
# Run tests for a specific file
ng test --include='**/task.service.spec.ts'

# Run tests with coverage
ng test --code-coverage --watch=false
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is an assessment project. For production use:
1. Add end-to-end tests (Cypress/Playwright)
2. Implement backend API integration
3. Add authentication
4. Implement real-time updates
5. Add task categories and tags

## License

This project is for assessment purposes.

## Author

Created as part of an Angular technical assessment demonstrating:
- Modern Angular development practices
- Signals-based state management
- TypeScript best practices
- Comprehensive testing
- Accessible UI implementation
