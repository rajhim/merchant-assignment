import { Directive, inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';
import { RealtimeService } from '../services/realtime.service';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  readonly appService = inject(ApplicationService);
  readonly authService = inject(AuthService);
  readonly realtimeService = inject(RealtimeService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly subscriptions = new Subscription();

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
