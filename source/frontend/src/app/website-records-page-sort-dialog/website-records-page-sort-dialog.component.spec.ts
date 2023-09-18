import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRecordsPageSortDialogComponent } from './website-records-page-sort-dialog.component';

describe('WebsiteRecordsPageSortDialogComponent', () => {
  let component: WebsiteRecordsPageSortDialogComponent;
  let fixture: ComponentFixture<WebsiteRecordsPageSortDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteRecordsPageSortDialogComponent]
    });
    fixture = TestBed.createComponent(WebsiteRecordsPageSortDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
