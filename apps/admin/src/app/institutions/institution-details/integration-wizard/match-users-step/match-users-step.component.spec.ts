import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchUsersStepComponent } from './match-users-step.component';

describe('MatchUsersStepComponent', () => {
  let component: MatchUsersStepComponent;
  let fixture: ComponentFixture<MatchUsersStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatchUsersStepComponent]
    });
    fixture = TestBed.createComponent(MatchUsersStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
