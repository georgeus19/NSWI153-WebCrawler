import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteRecordsPageComponent } from './website-records-page.component';

describe('WebsiteRecordsPageComponent', () => {
  let component: WebsiteRecordsPageComponent;
  let fixture: ComponentFixture<WebsiteRecordsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteRecordsPageComponent]
    });
    fixture = TestBed.createComponent(WebsiteRecordsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
