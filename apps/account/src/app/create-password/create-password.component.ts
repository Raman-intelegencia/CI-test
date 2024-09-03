/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  agreement,
  CookieService,
  createPasswordStrengthValidator,
  NonSSOService,
} from "@amsconnect/shared";
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "libs/shared/src/lib/config/environment";

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
  selector: "web-messenger-create-password",
  templateUrl: "./create-password.component.html",
  styleUrls: ["./create-password.component.scss"],
})
export class CreatePasswordComponent implements OnInit {
  @ViewChild("iframe") iframe: ElementRef | undefined;
  public passwordForm: FormGroup;
  public showHelpSupport: boolean = false;
  public showErrorMessage: string = "";
  public email: string = "";
  public getPasswordVal: boolean = false;
  public getAuthValue: string = "";
  public user_id: string = "";
  public enableCreatePasswordButton: boolean = false;
  public isPasswordInputFocused: boolean = false;
  public tosUrl: any;
  public isTermsConditions: boolean = false;
  public API_URL: string | undefined;
  public urlPath: boolean | undefined;
  public agreement: agreement | undefined;
  public target: boolean = false;
  public agreementId: string = "";
  public agreementDocument: string = "";
  public agreementVersion: string = "";
  public showCheckIcon = false;

  public ROUTECHECK = {
    showCreatePass: "Show Create Password",
    showPassResetComplete: "Show Password reset complete",
    showMissingParam: "Show Missing Param",
    showNeedHelp: "Show Need Help",
    showWelcomeRoute: "Welcome Route",
  };
  public routeCheck = this.ROUTECHECK.showCreatePass;
  public domainKey = "";

  constructor(
    private fb: FormBuilder,
    private nonSsoService: NonSSOService,
    private route: ActivatedRoute,
    public router: Router,
    public sanitizer: DomSanitizer,
    private cookieSvc:CookieService
  ) {
    this.domainKey = environment.domain_key.toString();
    this.passwordForm = this.fb.group({
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

    this.API_URL = environment.baseUrl;
  }

  ngOnInit(): void {
    this.cookieSvc.removeCookie(`redirectTo${this.domainKey ? `-${this.domainKey}` : ""}`);
    const token = this.route.snapshot.queryParamMap.get("token") as string;
    this.user_id = this.route.snapshot.queryParamMap.get("user_id") as string;
    this.urlPath = this.route.routeConfig?.path?.includes("welcome");
    this.getCreatePasswordScreen(token, this.user_id);
  }

  public get password(): AbstractControl {
    return this.passwordForm.controls["password"];
  }

  public get confirmPassword(): AbstractControl {
    return this.passwordForm.controls["confirmPassword"];
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

  public get getPasswordStrengthText() {
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

  public getCreatePasswordScreen(token: string, user_id: string): void {
    if (token && user_id) {
      this.nonSsoService
        .getCreatePasswordScreen(token, user_id)
        .subscribe((usersData) => {
          this.getAuthValue = usersData.auth;
          this.email = usersData.email;
          this.showErrorMessage =
            usersData.status === "error" || usersData.status === "exception"
              ? usersData.message || usersData.error
              : "";
          this.agreement = usersData?.agreement;
          this.agreementId = usersData?.agreement?.iid;
          this.agreementDocument = usersData?.agreement?.document;
          this.agreementVersion = usersData?.agreement?.version;
          this.tosUrl = this.sanitizeURL(
            `${this.API_URL}/legal/agreement/${this.agreementId}/${this.agreementDocument}/${this.agreementVersion}`
          );
          if (usersData?.agreement && this.showErrorMessage) {
            this.routeCheck = this.showErrorMessage
              ? this.ROUTECHECK.showNeedHelp
              : this.ROUTECHECK.showWelcomeRoute;
          } else {
            this.routeCheck = this.showErrorMessage
              ? this.ROUTECHECK.showNeedHelp
              : this.ROUTECHECK.showCreatePass;
          }
        });
    } else {
      this.showErrorMessage = "Missing Parameters";
      this.routeCheck = this.ROUTECHECK.showMissingParam;
      this.urlPath = this.showErrorMessage ? true : false;
    }
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  public passwordCheck(): void {
    this.nonSsoService
      .passwordCheck(this.password.value)
      .subscribe((password) => {
        this.getPasswordVal = password?.result === true;
        this.showCheckIcon = Boolean(this.verifyCreatePassButton());
        this.enableCreatePasswordButton =
          (!this.target && this.agreement) || this.target
            ? this.verifyCreatePassButton() && this.target
            : this.verifyCreatePassButton();
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

  public getCheckboxValue(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.target = target.checked;
    this.enableCreatePasswordButton =
      this.verifyCreatePassButton() && this.target;
  }

  public createPassword(): void {
    if (this.password.value !== this.confirmPassword.value) {
      this.confirmPassword.setErrors({ mismatch: true });
    } else {
      const agreement: agreement | undefined = this.target
        ? {
            document: this.agreementDocument,
            iid: this.agreementId,
            version: this.agreementVersion,
          }
        : undefined;

      this.nonSsoService
        .newPassword(
          this.getAuthValue,
          this.password.value,
          this.user_id,
          agreement
        )
        .subscribe((password) => {
          this.routeCheck =
            password.status === "ok"
              ? this.ROUTECHECK.showPassResetComplete
              : this.ROUTECHECK.showCreatePass;
          const allowedStatuses = ["error", "exception"];
          this.showErrorMessage = allowedStatuses.includes(password.status)
            ? password.message || password.error
            : "";
            const s_cookie_data = { i: password?.user?.profile?.iid, "e":password?.user?.email,"s":password?.config?.client_permissions?.sso, "inst":password?.user?.profile?.iname };
            this.cookieSvc.createCookie(`s${environment.domain_key ? `-${environment.domain_key}` : ""}`, s_cookie_data);
          });
    }
  }
}
