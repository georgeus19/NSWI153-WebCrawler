import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionsTableComponent } from './executions-table.component';

describe('ExecutionsTableComponent', () => {
  let component: ExecutionsTableComponent;
  let fixture: ComponentFixture<ExecutionsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutionsTableComponent]
    });
    fixture = TestBed.createComponent(ExecutionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
