import { CookieService, NonSSOService, createPasswordStrengthValidator, ModalComponent, ChangePasswordData } from "@amsconnect/shared";
import { Component, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"; 
import { PasswordValidationDirective } from "../../../Directive/Password-validation.directive";
import { CommonModule } from "@angular/common";
import { SettingsRoutingModule } from "../../settings-routing.module";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "web-messenger-password",
  templateUrl: "./password.component.html",
  styleUrls: ["./password.component.scss"],
  standalone:true,
  imports:[CommonModule, SettingsRoutingModule, TranslateModule,FormsModule,ReactiveFormsModule,ModalComponent,PasswordValidationDirective]
})

export class PasswordComponent {
  public passwordForm: FormGroup;
  public getPasswordVal = false; 
  public enableCreatePasswordButton  = false;
  public showErrorMessage: string | undefined;
  public isPasswordInputFocused = false;
  public showSuccessPopup !:string;
  public newpassword !:string;
  public passwordValidationCheck = {
    hasUpperCase: false,
    hasLowerCase: false,
    hasAtleast8Char: false,
    hasNumericOrSpecialChar: false,
  };
  @ViewChild(PasswordValidationDirective) passwordValidationDirective!:PasswordValidationDirective;

  constructor( private fb: FormBuilder, private cookieService: CookieService,private nonSsoService: NonSSOService){
    this.passwordForm = this.fb.group({
      oldPassword:['', Validators.required],
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
  public get oldPassword(): AbstractControl {
    return this.passwordForm.controls["oldPassword"];
  }

  public get password(): AbstractControl {
    return this.passwordForm.controls["password"];
  }

  public get confirmPassword(): AbstractControl {
    return this.passwordForm.controls["confirmPassword"];
  }

  public get getPasswordInputValue(): typeof this.passwordValidationCheck {
    return this.passwordValidationDirective.getPasswordInputValue()
  }

  public passwordCheck(): void {
    this.nonSsoService
      .passwordCheck(this.password.value)
      .subscribe((password) => {
        this.getPasswordVal = password?.result === true; 
      });  
  }

  public verifyCreatePassButton(): boolean {
    return Boolean(
      this.oldPassword.value &&
      this.password.value &&
      this.confirmPassword.value &&
        this.getPasswordInputValue["hasUpperCase"] && 
        this.getPasswordInputValue["hasLowerCase"] &&
        this.getPasswordInputValue["hasNumericOrSpecialChar"] &&
        this.password.value.length >= 8
    );
  }

  public verifyMatch(): boolean {
    return Boolean(
      this.confirmPassword.value &&
      this.password.value === this.confirmPassword.value
    );
  }
  

  public changePassword(): void { 
    this.newpassword = this.password.value;
    if (this.password.value !== this.confirmPassword.value) {
      this.showErrorMessage ="Your new passwords do not match. Please make sure you've correctly entered your new password twice below.";
    } else {
      // Prepare data as an object
      // Initialize the object with the specified type
      const data: ChangePasswordData = {
        new_password: this.password.value,
        old_password: this.oldPassword.value,
        // The 'a' property is optional and can be added conditionally
      };

      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) {
        data.a = aCookieValue;
      }
      this.nonSsoService
        .changePassword(data)
        .subscribe((password) => {
          this.getPasswordVal =  password?.status === 'ok' ;
          this.showSuccessPopup = this.getPasswordVal ? "Your password change was successful." : "";
          const allowedStatuses = ["error", "exception"];
          this.showErrorMessage = allowedStatuses.includes(password.status)
            ? password.message || password.error
            : "";
          });
          if(this.getPasswordVal){
            this.passwordForm.reset();
          }
         
        }
      }
    
    public closePopup():void{
      this.showErrorMessage="";
      this.showSuccessPopup ="";
    }
}
