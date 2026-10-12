import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseComponent } from '../../../core/base/base.component';
import { PRESET_USERS, PresetUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseComponent {
  private fb = inject(FormBuilder);

  readonly presetUsers = PRESET_USERS;
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    username: ['sales', [Validators.required]],
    password: ['sales', [Validators.required]]
  });

  selectPreset(user: PresetUser): void {
    this.loginForm.patchValue({
      username: user.username,
      password: user.defaultPassword || user.username
    });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login(username || '', password || '').subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Authentication failed. Please verify credentials.');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'SALES': return 'bg-primary';
      case 'REVIEWER': return 'bg-warning text-dark';
      case 'ADMIN': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
