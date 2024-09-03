import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function createPasswordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasAtleast8Char = value.length>=8;
    const hasUpperCase = /[A-Z]+/.test(value);

    const hasLowerCase = /[a-z]+/.test(value);

    const hasNumericOrSpecialChar = /[0-9@#$%^&+=!()]+/.test(value);

    const passwordStrength = {
      hasUpperCase: hasUpperCase,
      hasLowerCase: hasLowerCase,
      hasNumericOrSpecialChar: hasNumericOrSpecialChar,
      hasAtleast8Char:hasAtleast8Char
    };
    return passwordStrength;
  };
}
