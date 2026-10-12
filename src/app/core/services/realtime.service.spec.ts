import { TestBed } from '@angular/core/testing';
import { RealtimeService, StatusUpdateEvent } from './realtime.service';

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealtimeService]
    });
    service = TestBed.inject(RealtimeService);
  });

  it('should initialize with connected state and null latest event', () => {
    expect(service.isConnected()).toBe(true);
    expect(service.latestEvent()).toBeNull();
  });

  it('should emit updates through stream and update latestEvent signal', () => {
    const emittedEvents: StatusUpdateEvent[] = [];
    service.updates$.subscribe((event) => emittedEvents.push(event));

    const sampleEvent: StatusUpdateEvent = {
      applicationId: 'APP-101',
      businessName: 'Nova Technologies',
      previousStatus: 'SUBMITTED',
      newStatus: 'UNDER_REVIEW',
      timestamp: '10:00:00 AM'
    };

    service.emitUpdate(sampleEvent);

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual(sampleEvent);
    expect(service.latestEvent()).toEqual(sampleEvent);
  });

  it('should simulate incoming updates accurately', () => {
    const emittedEvents: StatusUpdateEvent[] = [];
    service.updates$.subscribe((event) => emittedEvents.push(event));

    service.simulateIncomingUpdate('APP-202', 'Zenith Logistics', 'DRAFT', 'SUBMITTED');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].applicationId).toBe('APP-202');
    expect(emittedEvents[0].businessName).toBe('Zenith Logistics');
    expect(emittedEvents[0].previousStatus).toBe('DRAFT');
    expect(emittedEvents[0].newStatus).toBe('SUBMITTED');
    expect(service.latestEvent()?.applicationId).toBe('APP-202');
  });

  it('should simulate assignment updates accurately', () => {
    const emittedEvents: StatusUpdateEvent[] = [];
    service.updates$.subscribe((event) => emittedEvents.push(event));

    service.simulateAssignment('APP-303', 'Apex Trading', 'Risk Underwriter 2', 'SUBMITTED', 'UNDER_REVIEW');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].applicationId).toBe('APP-303');
    expect(emittedEvents[0].type).toBe('ASSIGNMENT');
    expect(emittedEvents[0].assignedReviewerName).toBe('Risk Underwriter 2');
    expect(emittedEvents[0].newStatus).toBe('UNDER_REVIEW');
    expect(service.latestEvent()?.assignedReviewerName).toBe('Risk Underwriter 2');
  });
});
