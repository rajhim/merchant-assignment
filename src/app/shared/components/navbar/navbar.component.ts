import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaseComponent } from '../../../core/base/base.component';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent extends BaseComponent {
  readonly isSimulating = signal<boolean>(false);
  readonly demoStatus = signal<string | null>(null);

  onUserChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      this.authService.switchUserById(select.value);
    }
  }

  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as UserRole;
    this.authService.switchUserRole(newRole);
  }

  simulateConcurrent401(): void {
    this.isSimulating.set(true);
    this.demoStatus.set('Token expired. Sending 2 concurrent requests to trigger 401 & refresh...');

    this.authService.setTokens({
      accessToken: 'expired_token',
      refreshToken: this.authService.getRefreshToken() || 'refresh_sales'
    });

    forkJoin({
      apps: this.appService.getApplications({ page: 1, pageSize: 5 }),
      counts: this.appService.getStatusCounts()
    }).subscribe({
      next: () => {
        this.isSimulating.set(false);
        this.demoStatus.set('Success: Both concurrent 401 requests automatically refreshed via POST /api/auth/refresh and recovered!');
        setTimeout(() => this.demoStatus.set(null), 5000);
      },
      error: () => {
        this.isSimulating.set(false);
        this.demoStatus.set('Simulation error: requests could not be refreshed.');
        setTimeout(() => this.demoStatus.set(null), 5000);
      }
    });
  }
}
