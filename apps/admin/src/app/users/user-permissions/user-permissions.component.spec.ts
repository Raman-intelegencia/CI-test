import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermissionsComponent } from './user-permissions.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('UserPermissionsComponent', () => {
  let component: UserPermissionsComponent;
  let fixture: ComponentFixture<UserPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPermissionsComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [TranslateService],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initialized permissions form', () => {
    expect(component.permissionsForm).toBeDefined();
  });

  it('should toggle edit mode correctly', () => {
    expect(component.isEditMode).toBeFalsy();
    component.toggleEditMode();
    expect(component.isEditMode).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    // Assuming the default user permissions are empty or have a specific structure
    component.initializePermissionsForm([]);
    expect(component.grantsFormArray.length).toEqual(0);
    expect(component.getFileGrantsArray.length).toEqual(0);
  });

  it('should add new permission sets correctly', () => {
    const initialLength = component.grantsFormArray.length;
    component.addNewPermissionsSet();
    expect(component.grantsFormArray.length).toBeGreaterThan(initialLength);
  });

});
