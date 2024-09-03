import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PasswordComponent } from "./password.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TranslateModule } from "@ngx-translate/core";
import { NonSSOService } from "@amsconnect/shared";
import { FormBuilder, FormGroup } from "@angular/forms";

describe("PasswordComponent", () => {
  let component: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;
  let nonSsoService: NonSSOService; 
  let httpTestingController: HttpTestingController;
  const errorMessage = 'An error occurred'; 
  let fb: FormBuilder;
  let form: FormGroup;

  beforeEach(async () => {
    fb = new FormBuilder();
    await TestBed.configureTestingModule({
      declarations: [PasswordComponent],
      imports:[HttpClientModule,HttpClientTestingModule,TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nonSsoService = TestBed.inject(NonSSOService);
    httpTestingController = TestBed.inject(HttpTestingController);
    form = component.passwordForm;
    fb = TestBed.inject(FormBuilder);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize the form controls", () => {
    expect(component.passwordForm.get("oldPassword")).toBeTruthy();
    expect(component.passwordForm.get("password")).toBeTruthy();
    expect(component.passwordForm.get("confirmPassword")).toBeTruthy();
  });

   
  it('should save the new message letter', () => { 
    const response={
      result :true,
      status:"ok"
    }
    nonSsoService.passwordCheck(component.password.value).subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  })

  it('should save the new password', () => { 
  const formData = new FormData();
  formData.append("new_password", "new1234");
  formData.append("old_password", "old1234");
  formData.append('a'," ");
  const response={
    status:"ok"
  }
  nonSsoService.changePassword(formData).subscribe(data => {
    expect(data).toEqual(response);
  },
  error => {
    expect(error).toEqual(errorMessage);
  });
})

});
