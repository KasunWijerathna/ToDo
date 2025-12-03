import { Injectable, signal } from '@angular/core';

export interface AppError {
  readonly message: string;
  readonly code?: string;
  readonly timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly errorSignal = signal<AppError | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly ERROR_DISPLAY_DURATION = 5000; // 5 seconds
  private errorTimeout?: ReturnType<typeof setTimeout>;

  handleError(message: string, code?: string): void {
    const error: AppError = {
      message,
      code,
      timestamp: new Date()
    };

    this.errorSignal.set(error);

    // Auto-clear error after duration
    this.clearExistingTimeout();
    this.errorTimeout = setTimeout(() => {
      this.clearError();
    }, this.ERROR_DISPLAY_DURATION);
  }

  clearError(): void {
    this.errorSignal.set(null);
    this.clearExistingTimeout();
  }

  private clearExistingTimeout(): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = undefined;
    }
  }
}
