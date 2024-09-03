import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionPermissionsComponent } from './institution-permissions.component';

describe('InstitutionPermissionsComponent', () => {
  let component: InstitutionPermissionsComponent;
  let fixture: ComponentFixture<InstitutionPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstitutionPermissionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
