import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExistingPatientsComponent } from './existing-patients.component'; 
import { PatientService } from '@amsconnect/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AddPatientComponent } from '../add-patient/add-patient.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

describe('ExistingPatientsComponent', () => {
  let component: ExistingPatientsComponent;
  let fixture: ComponentFixture<ExistingPatientsComponent>;
  let patientService : PatientService;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistingPatientsComponent ],
      imports:[HttpClientTestingModule,TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          {
            path: "",
            component: ExistingPatientsComponent,
            children: [
              {
                path: "addPatients",
                component:  AddPatientComponent,
              }, ]
          },]) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistingPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    patientService = TestBed.inject(PatientService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to "addPatients" when "navigateToAddPatients" is called', () => {
    fixture.detectChanges();  
    const button = fixture.nativeElement.querySelector('btn');
    button?.click();  
    fixture.whenStable().then(() => {
      expect(location.path()).toBe('/addPatients'); // Check if navigation was successful
    });
  });
});
