import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationWizardComponent } from './integration-wizard.component';

describe('IntegrationWizardComponent', () => {
  let component: IntegrationWizardComponent;
  let fixture: ComponentFixture<IntegrationWizardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationWizardComponent]
    });
    fixture = TestBed.createComponent(IntegrationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
