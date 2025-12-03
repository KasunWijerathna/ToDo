import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default props', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.type).toBe('button');
  });

  it('should apply primary variant classes', () => {
    component.variant = 'primary';
    fixture.detectChanges();

    const classes = component.buttonClasses;
    expect(classes).toContain('bg-blue-500');
    expect(classes).toContain('hover:bg-blue-600');
  });

  it('should apply danger variant classes', () => {
    component.variant = 'danger';
    fixture.detectChanges();

    const classes = component.buttonClasses;
    expect(classes).toContain('bg-red-500');
    expect(classes).toContain('hover:bg-red-600');
  });

  it('should apply size classes', () => {
    component.size = 'lg';
    fixture.detectChanges();

    const classes = component.buttonClasses;
    expect(classes).toContain('px-6');
    expect(classes).toContain('py-3');
  });

  it('should emit clicked event when clicked', () => {
    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit clicked event when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();

    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit clicked event when loading', () => {
    component.loading = true;
    fixture.detectChanges();

    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should show loading spinner when loading', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.button-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should apply full width class when fullWidth is true', () => {
    component.fullWidth = true;
    fixture.detectChanges();

    const classes = component.buttonClasses;
    expect(classes).toContain('w-full');
  });

  it('should set aria-label attribute', () => {
    component.ariaLabel = 'Test button';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Test button');
  });
});
