import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SpecialtyComponent } from './specialty.component';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';

describe('SpecialtyComponent', () => {
  let component: SpecialtyComponent;
  let fixture: ComponentFixture<SpecialtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecialtyComponent],
      providers: [InstitutionsService,TranslateService],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(),],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with correct default values', () => {
    const formBuilder = TestBed.inject(FormBuilder);
    component.createBroadcastMessageForm = formBuilder.group({
      Specialty: [[]],
    });

    component.settingsArrayStates = {
      filteredSpecialties: ['Specialty1', 'Specialty2', 'Specialty3'],
      filteredTitles:[]
    };

    component.ngOnInit();

    const formValue = component.createBroadcastMessageForm.value;

    expect(formValue.Specialty).toEqual([]);
  });

  it('should update title checkboxes on initialization', () => {
    const formBuilder = TestBed.inject(FormBuilder);
    component.createBroadcastMessageForm = formBuilder.group({
      Specialty: [['Specialty1', 'Specialty2']],
    });

    component.settingsArrayStates = {
      filteredSpecialties: ['Specialty1', 'Specialty2', 'Specialty3'],
      filteredTitles:[]
    };

    component.ngOnInit();

    expect(component.specialtiesCheckboxStates).toEqual([true, true, false]);
  });

  it('should check all specialties', () => {
    component.allSpecialtiesChecked = true;
    component.settingsArrayStates = {
      filteredSpecialties: ['Specialty1', 'Specialty2', 'Specialty3'],
      filteredTitles:[]
    };
    component.checkAllSpecialties();

    expect(component.specialtiesCheckboxStates).toEqual([true, true, true]);
    expect(component.selectedSpecialties).toEqual(['Specialty1', 'Specialty2', 'Specialty3']);
  });
  it('should filter specialties based on search term', () => {
    component.settingsArrayStates = {
      filteredSpecialties: ['Specialty1', 'Specialty2', 'Specialty3'],
      filteredTitles:[]
    };
    component.searchSpecialtiesTerm = '2';
    component.filterSpecialties();

    expect(component.filteredSpecialties).toEqual(['Specialty2']);
  });

  // Add more test cases based on your component's functionality and constraints
  // ...

  afterEach(() => {
    // Cleanup: unsubscribe, etc.
    fixture.destroy();
  });
});
