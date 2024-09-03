import {
  NonSSOService,
  createPasswordStrengthValidator,
  UsersAuthResponse,
  CookieService,
  changePassword,
  AuthService,
  ModalComponent,
  ChangePasswordData,
} from "@amsconnect/shared";
import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Subscription } from "rxjs";

const passStrengthLineObject = {
  addClassBgGreen: false,
  addClassBgYellow: false,
  addClassRed: false,
};

const passwordValidationCheck = {
  hasUpperCase: false,
  hasLowerCase: false,
  hasAtleast8Char: false,
  hasNumericOrSpecialChar: false,
};
@Component({
  selector: "web-messenger-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
  standalone:true,
  imports:[CommonModule,FormsModule, ReactiveFormsModule, TranslateModule,ModalComponent]
})
export class ChangePasswordComponent implements OnInit,OnDestroy {
  public changePasswordForm: FormGroup;
  public showErrorMessage: string | undefined;
  public getPasswordVal = false;
  public enableCreatePasswordButton = false;
  public isPasswordInputFocused = false;
  public showCheckIcon = false;
  public authResponse!: UsersAuthResponse;
  public is_temp_password = false;
  @Input() showChangePassModal = false;
  @Input() showPassword_Change_Reason="";
  public old_password = "";
  public showSuccessPopup = false;
  private subscription: Subscription = new Subscription();
  public showErrorPopupModal = true;
  public modalShowErrorMessage = "";

  constructor(
    private fb: FormBuilder,
    private nonSsoService: NonSSOService,
    private authService: AuthService,
    private cookieService: CookieService
  ) {
    this.changePasswordForm = this.fb.group({
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          createPasswordStrengthValidator(),
        ],
      ],
      confirmPassword: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          createPasswordStrengthValidator(),
        ],
      ],
    });
  }
  ngOnInit(): void {
    this.usersAuth();
  }
  public usersAuth(): void {
    this.subscription = this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        this.authResponse = data;
        this.is_temp_password = this.authResponse?.user?.is_temp_password;
      }
    );
  }

  public get password(): AbstractControl {
    return this.changePasswordForm.controls["password"];
  }

  public get confirmPassword(): AbstractControl {
    return this.changePasswordForm.controls["confirmPassword"];
  }

  public get getPasswordInputValue(): typeof passwordValidationCheck {
    const errors = this.password.errors;
    return errors
      ? {
          hasUpperCase: errors["hasUpperCase"],
          hasLowerCase: errors["hasLowerCase"],
          hasAtleast8Char: errors["hasAtleast8Char"],
          hasNumericOrSpecialChar: errors["hasNumericOrSpecialChar"],
        }
      : passwordValidationCheck;
  }

  public get getPasswordStrengthText(): { strength: string } {
    return {
      strength:
        this.getPasswordInputValue["hasUpperCase"] &&
        this.getPasswordInputValue["hasLowerCase"] &&
        this.getPasswordInputValue["hasNumericOrSpecialChar"] &&
        this.password.value.length >= 10
          ? "Strong"
          : this.password.value.length >= 8
          ? "Good"
          : "Weak",
    };
  }

  // below function is used to modify classes
  //  to show password strength line colors based on the conditions
  public get addClassesToShowPassStrengthLine(): typeof passStrengthLineObject {
    return this.getPasswordInputValue
      ? {
          addClassBgGreen:
            this.getPasswordInputValue["hasUpperCase"] &&
            this.getPasswordInputValue["hasLowerCase"] &&
            this.getPasswordInputValue["hasNumericOrSpecialChar"] &&
            this.password.value.length >= 10,
          addClassBgYellow: this.password.value.length >= 8,
          addClassRed: this.password.value.length <= 8,
        }
      : passStrengthLineObject;
  }

  public passwordCheck(): void {
    this.nonSsoService
      .passwordCheck(this.password.value)
      .subscribe((password) => {
        this.getPasswordVal = password?.result === true;
        this.showCheckIcon = Boolean(this.verifyCreatePassButton());
        this.enableCreatePasswordButton = this.verifyCreatePassButton();
      });
  }

  public verifyCreatePassButton(): boolean {
    return Boolean(
      this.confirmPassword.value &&
        this.password.value === this.confirmPassword.value &&
        this.getPasswordInputValue["hasUpperCase"] &&
        this.getPasswordInputValue["hasLowerCase"] &&
        this.getPasswordInputValue["hasNumericOrSpecialChar"] &&
        this.password.value.length >= 8
    );
  }

  public createPassword(): void {
    if (this.password.value !== this.confirmPassword.value) {
      this.confirmPassword.setErrors({ mismatch: true });
    } else {
      const data: ChangePasswordData = {
        new_password: this.password.value,
        old_password: this.old_password,
        // The 'a' property is optional and can be added conditionally
      };

      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) {
        data.a = aCookieValue;
      }
      this.nonSsoService
        .changePassword(data)
        .subscribe((password: changePassword) => {
          this.showChangePassModal = password.status === "ok" ? false : true;
          this.showSuccessPopup = password.status === "ok" ? true : false;
          const allowedStatuses = ["error", "exception"];
          this.showErrorMessage = allowedStatuses.includes(password.status)
            ? password.message || password.error
            : "";
          this.showErrorPopupModal = allowedStatuses.includes(password.status) ? true : false;
        });
    }
  }

  public closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }

  public closePasswordChangeModalPopup(): void { 
    this.showErrorMessage = "";
    this.showErrorPopupModal = false;
  }
  // unsubscribe the subscription to prevent data leaks
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
