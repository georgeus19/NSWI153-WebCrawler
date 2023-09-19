import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRecordEditComponent } from './website-record-edit.component';

describe('WebsiteRecordEditComponent', () => {
  let component: WebsiteRecordEditComponent;
  let fixture: ComponentFixture<WebsiteRecordEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteRecordEditComponent]
    });
    fixture = TestBed.createComponent(WebsiteRecordEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
