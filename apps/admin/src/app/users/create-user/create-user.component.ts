import { AuthService, CookieService, InstitutionResponse, InstitutionResponseWithPager, InstitutionSearchResponse, 
  InstitutionService } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstitutionsService } from '../../../services/institutions.service';
import { UsersService } from '../../../services/users.service';
import { UserBaseComponent } from './create-user.class';
import { TranslateService } from '@ngx-translate/core';
import { CreateUserType } from '../../../models/create-user.model';
import { ReportingTagsComponent } from '../reporting-tags/reporting-tags.component';
import { Subscription } from 'rxjs';
import { UpdatePagerResponse} from 'apps/admin/src/modals/users.model';
@Component({
  selector: 'web-messenger-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent extends UserBaseComponent implements OnInit, OnDestroy {
  @Input() userIDSearchInstitution = "";
  @ViewChild('ReportingTag') ReportingTag!: ReportingTagsComponent;
  public active_status = 'create-user';
  public active_status_reporting_tag = 'info';
  public reporting_active_status = 'list-view';
  public createUserForm: FormGroup;
  public institutionSearchForm: FormGroup; 
  public showSuccessPopup = "";
  public showValidation = ""; 
  public tags !: string[];
  public isReportingTag = false;
  public user = "create-user";
  public userId = "";
  public isInstituteSearch = true;
  public isRestCreateAPIUser=false;
  public createUserView = CreateUserType;
  public subscription = new Subscription();
  public userTagsUpdate = false;
  public isPagerNumberAccess:boolean = false;
  public isPagerIntegrationPresent:boolean=true;

  constructor(
    private fb: FormBuilder, 
    private institutionService: InstitutionsService, 
    private cookieService: CookieService,
    institutionsService: InstitutionService, 
    private userService: UsersService,
    private translateSvc: TranslateService,
    private cdr: ChangeDetectorRef,
    private authSvc: AuthService) {
    super(institutionsService,);
    this.createUserForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      email: ["", Validators.required],
      specialty: [""],
      title: [""],
      skip_email: [""],
      sso: [""],
      uid: ["", Validators.required],
      iid: [""],
      cellphone: [""],
      email_comm: [true],
      sms_comm: [true],
      basic: [""],
      pagerNumber: [""],
    });
    this.institutionSearchForm = this.fb.group({
      institutionSearch: [""],
      showLockedInstitutions: [false],
    });
    this.createUserForm.controls['uid'].disable();
  }

  ngOnInit(): void {
    this.getInstitutions();
    this.getSpecialityAndTitle("create");
    this.subscription = this.authSvc.authResponseData$.subscribe(data => {
      this.userTagsUpdate = data.user?.access_group_actions_map?.client_user_tags_update;
      if(data.user){
        this.isPagerIntegrationPresent = data.user.access_group_actions_map.client_user_pager_update;
      }
    })
  }

  public updateSSO():void { 
    if(this.createUserForm.controls['sso'].value === true) this.createUserForm.controls['uid'].enable();
  }

  public closetoggleDropdown(): void { 
    this.showspecialtyDropdown = false;
    this.showTitleDropdown = false;
  }

  public toggleSpecialtyDropdown(event: Event): void {
    event.stopPropagation(); 
    this.showspecialtyDropdown = !this.showspecialtyDropdown;
    this.showTitleDropdown = false; 
    this.closeInput = false;
    this.selectedIndex = 0;
    this.getSpecialityAndTitleBasedInstitution(this.createUserForm.controls['iid'].value,'edit');
  }

  public toggleTitleDropdown(event: Event): void {
    event.stopPropagation(); 
    this.showTitleDropdown = !this.showTitleDropdown;
    this.showspecialtyDropdown = false; 
    this.closeInput = false;
    this.selectedIndex = 0;
    this.getSpecialityAndTitleBasedInstitution(this.createUserForm.controls['iid'].value,'edit');
  }

  public getInstitutions():void{
    let institutionSearchValue = this.institutionSearchForm.get("institutionSearch")?.value;
    let showLockedInstitutionsValue = this.institutionSearchForm.get("showLockedInstitutions")?.value;
    institutionSearchValue = institutionSearchValue && institutionSearchValue.trim() !== "" ? institutionSearchValue : "*";
    this.institutionService.searchInstitutitons(institutionSearchValue, showLockedInstitutionsValue).subscribe((responseData: InstitutionSearchResponse) => {
      this.allInstitutionsData = responseData.institutions;
    });
  }

  public receiveInstituteNameID(selectedInstitute: string): void { 
    this.createUserForm?.get('iid')?.setValue(selectedInstitute); 
    if(selectedInstitute != undefined) {
      this.fetchInstitutionDetails(selectedInstitute);
    }else if(selectedInstitute == undefined){
      this.isPagerNumberAccess = false;
    }
  }

  public setToggleProperty():void{
    this.closeInput = false;
    this.selectedIndex = 0;
  }

  public clickSpecialtyTitle(event: Event): void {
    event.stopPropagation();
    this.getInstitutions();
  }

  public searchProperty(name: Event, propertyName: 'selectedInstitute' | 'selectedSpecialty' | 'selectedTitle'): void {
    name.stopPropagation();
    const typedName = name;  
    if (typeof typedName !== 'string') {
    return;
    }  this[propertyName] = typedName;
    }

  public reportingTagsValue(data: string[]): void {
    this.tags = data;
  }

  public isreportingTags(data: boolean): void {
    this.isReportingTag = data;
  }

  public openReportingTags():void {
    this.isReportingTag = true;
  }

  public createNewUser(): void {
    if (this.createUserForm.valid && this.selectedTitle && this.selectedSpecialty) {
      const formData = new FormData();
      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) {
        formData.append("a", aCookieValue);
      }
      formData.append("first_name", this.createUserForm.controls['first_name'].value);
      formData.append("last_name", this.createUserForm.controls['last_name'].value);
      formData.append("email", this.createUserForm.controls['email'].value);
      if(this.createUserForm.controls['cellphone'].value === null){
        this.createUserForm.controls['cellphone'].setValue("");
      }
      formData.append("cellphone", this.createUserForm.controls['cellphone'].value);
      formData.append("specialty", this.selectedSpecialty);
      formData.append("title", this.selectedTitle);
      formData.append("iid", this.createUserForm.controls['iid'].value);
      formData.append("email_comm", this.createUserForm.controls['email_comm'].value);   
      formData.append("uid", this.createUserForm.controls['uid'].value); 
      if(this.createUserForm.controls['cellphone'].value == "")
      {
        formData.append("sms_comm", "false");
      }
      else
      {
        formData.append("sms_comm", this.createUserForm.controls['sms_comm'].value);
      }
      if (this.createUserForm.controls['sso'].value) {
        formData.append("sso", "on");
      }
      if (this.createUserForm.controls['skip_email'].value) {
        formData.append("skip_email", "on");
      }
      this.createUserForm.controls['basic'].value ? formData.append("basic", "on") : formData.append("basic", "");
      this.userService.createUserAccount(formData).subscribe(response => {
        if (response.status == "ok") {
          this.userId = response?.user?._id.$oid;
          this.updateUsertags();
          if(this.isPagerNumberAccess){
            this.updatePagerNumber();
          }
          if (formData.get('sso')) {
            this.showSuccessPopup = `Account created. This user can now login through their institution.`;
          } else if (formData.get('skip_email')) {
            this.showSuccessPopup = 'Account created. No account activation link was sent.';
          } else if (formData.get('email_comm') === 'true' && formData.get('sms_comm') === 'true') {
            this.showSuccessPopup = `Account created. Account activation link sent to ${formData.get('email')} and ${formData.get('cellphone')}.`;
          } else if (formData.get('email_comm') === 'true') {
            this.showSuccessPopup = `Account created. Account activation link sent to ${formData.get('email')}.`;
          } else {
            this.showSuccessPopup = `Account created. Account activation link sent to ${formData.get('cellphone')}.`;
          }
          this.reset();
        }  
      })
    } else {
      this.showValidation = this.translateSvc.instant('pleaseFillAllFields'); 
    }
  }

  public updateUsertags(): void {
    let tags = this.tags?.map((tag) => tag);
    if(tags == undefined || tags.length == 0){
      this.showValidation = "";
    }else{
      const formData = new FormData();    
      tags?.forEach((formattedtag: string | Blob) => formData.append("tags", formattedtag));
      formData.append("user_id", this.userId);
      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) {
        formData.append("a", aCookieValue);
      }
      this.userService.userUpdateTag(formData).subscribe(response => {
        this.selectedInstitute = "";
      })
    }
    
  }

  public reset(): void {
    this.createUserForm.reset();
    this.selectedInstitute = "";
    this.selectedSpecialty = "";
    this.selectedTitle = "";
    this.tags = [];
    this.ReportingTag.resetForm();
    this.isRestCreateAPIUser=true;
    this.createUserForm.controls['email_comm'].setValue(true); 
    this.createUserForm.controls['sms_comm'].setValue(true); 
  }


  public onInputChange(event: Event): void {
    const email = (event.target as HTMLInputElement).value;
    this.createUserForm.controls['uid'].setValue(email); 
  }
  public  closeErrorPopup():void {
    this.showValidation = "";
    this.showSuccessPopup = "";
  }

  public checkResetApiForm(value:boolean): void{
    this.isRestCreateAPIUser=value;
    this.cdr.detectChanges();
   }

   ngOnDestroy(): void {
       this.subscription.unsubscribe(); //unsubscribe the scubsciption
   }

   public fetchInstitutionDetails(institutionId: string): void {
    this.institutionService.getInstitutionDetails(institutionId).subscribe((data: InstitutionResponseWithPager) => {
      this.isPagerNumberAccess = data.institution.wowos.includes('pager_integration');
    });
  }

  public keyPress(event: any): void {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) { event.preventDefault(); }
  }

  public updatePagerNumber(): void {
    if(this.isPagerIntegrationPresent){
      this.userService.userUpdatePager(this.userId,this.createUserForm.controls['pagerNumber'].value)
      .subscribe((data: UpdatePagerResponse) => {})
    }
  }
}
