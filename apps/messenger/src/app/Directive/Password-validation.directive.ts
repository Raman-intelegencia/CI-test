import { Directive, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[PasswordDirectiveWithValue]',
  standalone:true
})
export class PasswordValidationDirective {
  public passStrengthLineObject = {
    addClassBgGreen: false,
    addClassBgYellow: false,
    addClassRed: false,
  };
  
  public passwordValidationCheck = {
    hasUpperCase: false,
    hasLowerCase: false,
    hasAtleast8Char: false,
    hasNumericOrSpecialChar: false,
  };
  @Input() newpassword !: AbstractControl;
 
  public  getPasswordInputValue(): typeof this.passwordValidationCheck {
    const errors = this.newpassword.errors;
    return errors
      ? {
          hasUpperCase: errors["hasUpperCase"],
          hasLowerCase: errors["hasLowerCase"],
          hasAtleast8Char: errors["hasAtleast8Char"],
          hasNumericOrSpecialChar: errors["hasNumericOrSpecialChar"],
        }
      : this.passwordValidationCheck;
  }

  public get getPasswordStrengthText():{strength:string}{
    const value = this.getPasswordInputValue()
    return {
      strength:
        value["hasUpperCase"] &&
        value["hasLowerCase"] &&
        value["hasNumericOrSpecialChar"] &&
        this.newpassword.value.length >= 10
          ? "Strong"
          : this.newpassword.value.length >= 8
          ? "Good"
          : "Weak",
    };
  }

  public get addClassesToShowPassStrengthLine(): typeof this.passStrengthLineObject {
    const value = this.getPasswordInputValue()
    return value
      ? {
          addClassBgGreen:
          value["hasUpperCase"] &&
          value["hasLowerCase"] &&
          value["hasNumericOrSpecialChar"] &&
          this.newpassword.value.length >= 10,
          addClassBgYellow: this.newpassword.value.length >= 8,
          addClassRed: this.newpassword.value.length <= 8,
        }
      : this.passStrengthLineObject;
  }
}