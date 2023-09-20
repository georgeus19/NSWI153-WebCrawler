import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRecordDetailComponent } from './website-record-detail.component';

describe('WebsiteRecordDetailComponent', () => {
  let component: WebsiteRecordDetailComponent;
  let fixture: ComponentFixture<WebsiteRecordDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteRecordDetailComponent]
    });
    fixture = TestBed.createComponent(WebsiteRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
