import { TestBed } from '@angular/core/testing';

import { CrawledWebsitesService } from './crawled-websites.service';

describe('CrawledWebsitesService', () => {
  let service: CrawledWebsitesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrawledWebsitesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
