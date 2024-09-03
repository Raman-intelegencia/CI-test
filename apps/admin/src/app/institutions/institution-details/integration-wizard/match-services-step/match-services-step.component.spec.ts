import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchServicesStepComponent } from './match-services-step.component';

describe('MatchServicesStepComponent', () => {
  let component: MatchServicesStepComponent;
  let fixture: ComponentFixture<MatchServicesStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatchServicesStepComponent]
    });
    fixture = TestBed.createComponent(MatchServicesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
