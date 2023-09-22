import { TestBed } from '@angular/core/testing';

import { ExecutionsSocketService } from './executions-socket.service';

describe('ExecutionsSocketService', () => {
  let service: ExecutionsSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExecutionsSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
