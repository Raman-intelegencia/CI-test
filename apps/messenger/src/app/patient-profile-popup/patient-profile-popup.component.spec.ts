import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PatientProfilePopupComponent } from "./patient-profile-popup.component";
import { PatientService } from "@amsconnect/shared";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

describe("PatientProfilePopupComponent", () => {
  let component: PatientProfilePopupComponent;
  let fixture: ComponentFixture<PatientProfilePopupComponent>;
  let patientService: PatientService;
  let httpTestingController: HttpTestingController;
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[PatientProfilePopupComponent,HttpClientModule,HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientProfilePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    patientService = TestBed.inject(PatientService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should get the Parient info', () => { 
    const response={
      status:"ok"
    }
    const id="798000009877rde33";
    patientService.getPatients(id).subscribe(data=>{
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });
});
