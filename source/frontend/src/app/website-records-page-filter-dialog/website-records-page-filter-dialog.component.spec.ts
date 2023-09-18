import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRecordsPageFilterDialogComponent } from './website-records-page-filter-dialog.component';

describe('WebsiteRecordsPageFilterDialogComponent', () => {
  let component: WebsiteRecordsPageFilterDialogComponent;
  let fixture: ComponentFixture<WebsiteRecordsPageFilterDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteRecordsPageFilterDialogComponent]
    });
    fixture = TestBed.createComponent(WebsiteRecordsPageFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
