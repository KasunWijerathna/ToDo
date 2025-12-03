import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      <label *ngIf="label" [for]="id" class="input-label">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [required]="required"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-describedby]="errorMessage ? id + '-error' : null"
          [attr.aria-invalid]="!!errorMessage"
          [class]="inputClasses"
          [value]="value"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
        />
      </div>
      <p *ngIf="errorMessage" [id]="id + '-error'" class="input-error">
        {{ errorMessage }}
      </p>
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .input-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .input-error {
      font-size: 0.875rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'search' = 'text';
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() errorMessage?: string;
  @Input() ariaLabel?: string;

  @Output() valueChange = new EventEmitter<string>();

  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputClasses(): string {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors';
    const errorClasses = this.errorMessage
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500';
    const disabledClasses = this.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
