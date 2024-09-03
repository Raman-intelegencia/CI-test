import { CookieService, InstitutionDetails, InstitutionSearchResponse } from "@amsconnect/shared";
import { Component, ElementRef, Input, QueryList, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { InstitutionsService } from "apps/admin/src/services/institutions.service";
import { UsersService } from "apps/admin/src/services/users.service";

@Component({
  selector: "web-messenger-create-api-user",
  templateUrl: "./create-api-user.component.html",
  styleUrls: ["./create-api-user.component.scss"],
})
export class CreateApiUserComponent {
  @Input() userId = "";
  public allInstitutionsData: InstitutionDetails[] = [];
  public apiUserForm: FormGroup;
  public filteredInstitution !: [];
  public institutionSearchForm!: FormGroup;
  public selectedInstitute = "";
  public showDropdown = false;
  public selectedIndex = 0;
  public closeInput = false;
  public showValidation = "";
  public showSuccessPopup ="";
  public selectedId ="";
  public isInstituteSearch = true;
  public isRestCreateAPIUser=false;
  @ViewChildren("institute") institute!: QueryList<ElementRef>;
  constructor(private fb: FormBuilder, private institutionService: InstitutionsService, private userService: UsersService, private cookieService: CookieService,
    private translateSvc: TranslateService) {
    this.apiUserForm = this.fb.group({
      display_name: ["", Validators.required],
      email: ["", Validators.required],
      iid: [""],
      enable: [""],
    });
    this.institutionSearchForm = this.fb.group({
      institutionSearch: [""],
      showLockedInstitutions: [false],
    });
  }

   public receiveInstituteNameID(selectedInstitute: string): void { this.apiUserForm?.get('iid')?.setValue(selectedInstitute); 
   }

 
  public createApiUser(): void {
    if (this.apiUserForm.valid && this.apiUserForm.controls['iid'].value) {
      const formData = new FormData(); 
      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) {
        formData.append("a", aCookieValue);
      }
      formData.append("display_name", this.apiUserForm.controls['display_name'].value);
      formData.append("email", this.apiUserForm.controls['email'].value);
      formData.append("iid", this.apiUserForm.controls['iid'].value);
      if (this.apiUserForm.controls['enable'].value) {
        formData.append("enable", "on");
      }
      this.userService.createApiAccount(formData).subscribe(response => { 
        if(response.status === 'ok'){
          this.showSuccessPopup = `API account created. The API user is ID is [${response.user._id.$oid}] and the API key is [${response.user.api_key}].`;
              this.selectedId = "";
              this.reset();
        }
      })
    } else {
      this.showValidation = this.translateSvc.instant('pleaseFillAllFields'); 
    }
  }

  public closeErrorPopup() :void{
    this.showValidation = "";
    this.showSuccessPopup = "";
  }

  public reset(): void {
    this.apiUserForm.reset();
    this.selectedInstitute = "";
    this.isRestCreateAPIUser=true;
  }

  public checkResetApiForm(value:boolean): void{
    this.isRestCreateAPIUser=value;
   }
}
