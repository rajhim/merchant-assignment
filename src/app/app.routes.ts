import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'applications/new',
        loadComponent: () =>
          import('./features/wizard/merchant-wizard.component').then((m) => m.MerchantWizardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SALES', 'ADMIN'] }
      },
      {
        path: 'applications/:id/edit',
        loadComponent: () =>
          import('./features/wizard/merchant-wizard.component').then((m) => m.MerchantWizardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SALES', 'ADMIN'] }
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import('./features/detail/application-detail.component').then((m) => m.ApplicationDetailComponent),
        canActivate: [authGuard]
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./features/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
