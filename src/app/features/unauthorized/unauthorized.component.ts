import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../../core/base/base.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="fin-card p-5">
            <div class="text-danger mb-3">
              <i class="bi bi-shield-slash fs-1"></i>
            </div>
            <h2 class="fw-bold mb-2">Access Restricted</h2>
            <p class="text-secondary mb-4">
              Your active role (<strong>{{ authService.userRole() }}</strong>) does not have sufficient clearance to access this portal resource.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <a routerLink="/dashboard" class="btn fin-btn-primary">
                <i class="bi bi-arrow-left me-1"></i> Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent extends BaseComponent {}
