import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRecordCardComponent } from './website-record-card.component';

describe('WebsiteRecordCardComponent', () => {
  let component: WebsiteRecordCardComponent;
  let fixture: ComponentFixture<WebsiteRecordCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteRecordCardComponent]
    });
    fixture = TestBed.createComponent(WebsiteRecordCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
