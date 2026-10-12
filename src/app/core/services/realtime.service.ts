import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface StatusUpdateEvent {
  applicationId: string;
  businessName: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  type?: 'STATUS_CHANGE' | 'ASSIGNMENT';
  assignedReviewerName?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private updateSubject = new Subject<StatusUpdateEvent>();
  readonly isConnected = signal<boolean>(true);
  readonly latestEvent = signal<StatusUpdateEvent | null>(null);

  get updates$(): Observable<StatusUpdateEvent> {
    return this.updateSubject.asObservable();
  }

  emitUpdate(event: StatusUpdateEvent): void {
    this.latestEvent.set(event);
    this.updateSubject.next(event);
  }

  simulateIncomingUpdate(appId: string, name: string, prev: string, nextStatus: string): void {
    const event: StatusUpdateEvent = {
      applicationId: appId,
      businessName: name,
      previousStatus: prev,
      newStatus: nextStatus,
      type: 'STATUS_CHANGE',
      timestamp: new Date().toLocaleTimeString()
    };
    this.emitUpdate(event);
  }

  simulateAssignment(appId: string, name: string, reviewerName: string, prevStatus: string, nextStatus: string): void {
    const event: StatusUpdateEvent = {
      applicationId: appId,
      businessName: name,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      type: 'ASSIGNMENT',
      assignedReviewerName: reviewerName,
      message: `Application ${appId} (${name}) was assigned to ${reviewerName}.`,
      timestamp: new Date().toLocaleTimeString()
    };
    this.emitUpdate(event);
  }
}
