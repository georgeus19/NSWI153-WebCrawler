import { TestBed } from '@angular/core/testing';

import { WebsiteRecordsService } from './website-records.service';

describe('WebsiteRecordsService', () => {
  let service: WebsiteRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsiteRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
