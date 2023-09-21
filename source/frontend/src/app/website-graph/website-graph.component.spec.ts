import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteGraphComponent } from './website-graph.component';

describe('WebsiteGraphComponent', () => {
  let component: WebsiteGraphComponent;
  let fixture: ComponentFixture<WebsiteGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteGraphComponent]
    });
    fixture = TestBed.createComponent(WebsiteGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
