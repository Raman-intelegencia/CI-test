import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInstitutionComponent } from './create-institution.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InstitutionsService } from '../../../services/institutions.service';
import { of } from 'rxjs';

describe('CreateInstitutionComponent', () => {
  let component: CreateInstitutionComponent;
  let fixture: ComponentFixture<CreateInstitutionComponent>;
  let institutionService: InstitutionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateInstitutionComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [TranslateService],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInstitutionComponent);
    component = fixture.componentInstance;
    institutionService = TestBed.inject(InstitutionsService);
    jest
      .spyOn(institutionService, "createInstitution")
      .mockReturnValue(of({ status: "success" }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should have createInstitutionForm defined", () => {
    fixture.detectChanges();
    expect(component.createInstitutionForm).toBeDefined();
  });

  it("form should be invalid when initialized", () => {
    expect(component.createInstitutionForm.valid).toBeFalsy();
  });

  it("form should be valid when all required fields are filled", () => {
    component.createInstitutionForm.controls["id"].setValue("12345");
    component.createInstitutionForm.controls["short_name"].setValue(
      "TestShortName"
    );
    component.createInstitutionForm.controls["name"].setValue("TestName");
    expect(component.createInstitutionForm.valid).toBeTruthy();
  });

  it("form should be invalid when any of the required fields are missing", () => {
    component.createInstitutionForm.controls["id"].setValue("");
    expect(component.createInstitutionForm.valid).toBeFalsy();
  });

  it("should call createInstitution of the service when form is valid", () => {
    component.createInstitutionForm.controls["id"].setValue("12345");
    component.createInstitutionForm.controls["short_name"].setValue(
      "TestShortName"
    );
    component.createInstitutionForm.controls["name"].setValue("TestName");

    component.createInstitution();

    expect(institutionService.createInstitution).toHaveBeenCalled();
  });

  it("should not call createInstitution of the service when form is invalid", () => {
    component.createInstitution();
    expect(institutionService.createInstitution).not.toHaveBeenCalled();
  });

  it("should reset the form when resetInstitutionForm is called", () => {
    component.createInstitutionForm.controls["id"].setValue("12345");
    component.createInstitutionForm.controls["short_name"].setValue(
      "TestShortName"
    );
    component.createInstitutionForm.controls["name"].setValue("TestName");

    component.resetInstitutionForm();

    expect(component.createInstitutionForm.controls["id"].value).toEqual("");
    expect(
      component.createInstitutionForm.controls["short_name"].value
    ).toEqual("");
    expect(component.createInstitutionForm.controls["name"].value).toEqual("");
  });
  

});
