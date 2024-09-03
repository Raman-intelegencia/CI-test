import { NonSSOService, CookieService } from "@amsconnect/shared";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ChangePasswordComponent } from "./change-password.component";

jest.mock("@amsconnect/shared", () => ({
  NonSSOService: jest.fn(() => ({
    changePassword: jest.fn(),
  })),
  CookieService: jest.fn(() => ({
    getCookie: jest.fn(),
  })),
  createPasswordStrengthValidator: jest.fn(),
}));
describe("ChangePasswordComponent", () => {
  let component: ChangePasswordComponent;
  let nonSsoService: NonSSOService;
  let cookieService: CookieService;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let form: FormGroup;
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
    component = new ChangePasswordComponent(
      fb,
      nonSsoService,
      {
        accounts_server_url: "",
        baseUrl: "",
        messenger_server_url: "",
        existing_url: "",
      },
      {} as any,
      cookieService
    );
    nonSsoService = {
      changePassword: jest.fn(),
    } as unknown as NonSSOService;

    cookieService = {
      getCookie: jest.fn(),
    } as unknown as CookieService;

    component.old_password = "oldPassword";
    TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule,
      ],
      providers: [FormBuilder],
    });

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    form = component.changePasswordForm;
    fb = TestBed.inject(FormBuilder);
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize the form controls", () => {
    expect(component.changePasswordForm.get("password")).toBeTruthy();
    expect(component.changePasswordForm.get("confirmPassword")).toBeTruthy();
  });

  it("should update password strength classes correctly", () => {
    component.password.setValue("ValidPassword123");
    fixture.detectChanges();

    const passwordStrengthClasses = component.addClassesToShowPassStrengthLine;

    expect(passwordStrengthClasses.addClassBgGreen).toBe(true);
    expect(passwordStrengthClasses.addClassBgYellow).toBe(true);
    expect(passwordStrengthClasses.addClassRed).toBe(false);
  });

  it("should check password validation correctly", () => {
    component.password.setValue("ValidPassword123");
    component.confirmPassword.setValue("ValidPassword123");
    fixture.detectChanges();

    const result = component.verifyCreatePassButton();

    expect(result).toBe(true);
  });

  it('should create a FormGroup with password and confirmPassword controls', () => {
    // Check if the form is defined
    expect(form).toBeDefined();

    // Check if the password control is defined
    const passwordControl = form.get('password');
    expect(passwordControl).toBeDefined();

    // Check if the confirmPassword control is defined
    const confirmPasswordControl = form.get('confirmPassword');
    expect(confirmPasswordControl).toBeDefined();
  });

});
