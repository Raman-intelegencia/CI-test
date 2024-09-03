import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { ActiveStatus, UpdatePagerResponse, User, UserEmailSubscriptionResponse, UserErrorResponse, UserInfoUpdateResponse, UserProfilePhotoResponse, UserSearchByIdResponse, UserStatusType } from '../../../modals/users.model';
import { CookieService, Institution, InstitutionService, UserService, status, ErrorHandlingService, AuthService, UsersAuthResponse, access_group_actions_map } from '@amsconnect/shared';
import { Subscription } from 'rxjs';
import { UserInfoService } from '../../../services/user-info.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { InstitutionResponse } from "apps/admin/src/modals/institutions.model";
import { Injectable } from '@angular/core'; 
import { UserDetailChildBaseComponent } from './user-detail-child.class';
import { Router } from '@angular/router';
import { AppNavigationService } from 'apps/admin/src/services/app-navigation.service';
@Injectable()
export class UserDetailBaseComponent extends UserDetailChildBaseComponent {
  public editUserDetailsForm: any;
  public activeStatusValue = ActiveStatus
  public active_status = this.activeStatusValue.Info;
  public userEmailSubscriptionData: { idle_email: boolean, second_channel: boolean } | null = null;
  public userStatusType = UserStatusType;
  public reporting_active_status = 'list-view';
  public userData: User | null = null;
  public subscription = new Subscription();
  public imageUrl = "";
  public institution: Institution | null = null;
  public titleList: string[] = [];
  public isReportingTag: boolean = false;
  public tags: string[] = [];
  public phoneNumberRegex = new RegExp("^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$");
  public emailValidatorRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  public onCharsRegex = new RegExp("^[a-zA-Z\s_]+$")
  public submitted: boolean = false;
  public showErrorMessage: string = "";
  public showValidation: string = "";
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";
  public showSuccessPopup = false;
  public authSubscription = new Subscription;
  public currentUserId: string = "";
  public accountUrl = "";
  public showErrorModal = false;
  public editApiUserForm!: FormGroup;
  public checkUserCreatedFromAPI!:string;
  public userName = "";
  public sidepanelmobile = false;
  public childAccessUserId: string = "";
  public authResponse: UsersAuthResponse = {} as UsersAuthResponse;
  public showUserStatusModal = false;
  public userStatus = "";
  public getALLCurrentUserPermissionList!:access_group_actions_map;
  public pageNumberFieldDisabled= false;
  public isPagerIntegrationPresent:boolean=true;
  public getInstitutionName:string=""; 
  public getUIDValue:string="";
  public showUIDModal:boolean = false;
  public showUIDTitle:string="";
  public showUIDMessage:string="";
  constructor(
    override userSvc: UsersService,
    public userDataSvc: UserService,
    public userInfoSvc: UserInfoService,
    public destroySub: DestroyRef,
    public formBuilder: FormBuilder,
    public institutionService: InstitutionsService,
    public cookieService: CookieService,
    public cd: ChangeDetectorRef,
    public errorHandlingService: ErrorHandlingService,
    public authService: AuthService, institutionsService: InstitutionService,router: Router, navigateSvc: AppNavigationService,
  ) {
    super(institutionsService,router, userSvc, navigateSvc);
  }

  public reportingTagsValue(data: string[]): void { 
    this.tags = data; 
  }

  public isreportingTags(data: boolean): void { 
    this.isReportingTag = data; 
  }

  public openReportingTags(): void { 
    this.isReportingTag = true; 
  }

  public keyPress(event: any): void {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) { event.preventDefault(); }
  }

  public closeErrorPopup(): void { 
    this.showErrorModal = false; 
    this.showUIDModal = false;
  }

  public closeEditModalPopup(id: string): void {
    let checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      if (checkbox.type === 'checkbox') { 
        checkbox.checked = !checkbox.checked; 
      }
    }
    this.getUserData(this.childAccessUserId);
  }

  public cancelpopup(): void { 
    this.showSuccessPopup = false; 
  }

  public lockResetSendPassword(action: string, email?: string):void {
    this.showSuccessPopup = true;
    switch (action) {
      case 'lockUser':
        this.modalTitleMessage = "Lock User";
        this.modalShowMessage = "Lock User?";
        break;
      case 'unlockUser':
        this.modalTitleMessage = "Unlock User";
        this.modalShowMessage = "Unlock User?";
        break;
      case 'sendResetPasswordLink':
        this.modalTitleMessage = "Send Reset Password Link";
        this.modalShowMessage = `Send reset password email to ${email} ?`;
        break;
      case 'generateTemporaryPassword':
        this.modalTitleMessage = "Generate Temporary Password";
        this.modalShowMessage = `Send temporary password to ${email}?`;
        break;
    }
  }

  public showPopUpAndLogoutScreen(titleMsg: string, showNotifierFlag: boolean,
    showNotifierMsg: string, logOut?: boolean):void {
    this.showErrorModal = true;
    this.showErrorMessage = titleMsg;
    switch (showNotifierMsg) {
      case 'Sent 0 notifications':
        this.showValidation = showNotifierMsg;
        break;
        
      case 'Locked Successfully':
      case 'Unlocked Successfully':
        this.showValidation = showNotifierMsg;
        break;
  
      default:
        if (showNotifierFlag === false) {
          this.showValidation = showNotifierMsg;
        } else if (showNotifierFlag === true) {
          this.showValidation = `Sent ${showNotifierMsg} notifications`;
        }
        break;
    }
  }

  private navigateToAccount(): void {
    const url = new URL(this.accountUrl);
    window.location.assign(url);
  }

  public logout(): void {
    setTimeout(()=>{
      this.authService.logout().subscribe((data) => {
        localStorage.clear();
        this.navigateToAccount();
      });
    },2000);
  }

  public onEditUserDetailsSetData(userData: User): void {
    if(this.checkUserCreatedFromAPI !== undefined){
      this.editApiUserForm.patchValue({
        apiFirstname: userData.first_name,
        apiEmail:userData.email,
        apiUserID:userData.uid.id,
        apiInstitution:userData.profile.iid
      });
    }else{
      this.editUserDetailsForm.patchValue({
        firstname:userData.first_name,
        lastname:userData.last_name,
        userID:userData.uid.id,
        email:userData.email,
        emailCommunication:userData.email_comm,
        cellPhone:userData.cell_phone?.replace(/^\+1/, ''),
        cellPhoneCommunication:userData.sms_comm,
        institution:userData.profile.iid,
        specialty:userData.profile.dept,
        title:userData.profile.title,
        pagerNumber:userData.profile.pager_number,
        location:userData.site.location,
        locationDetail:userData.site.detail,
        city:userData.site.city,
        state:userData.site.state,
        basicUser:userData.flag_basic == true ? true : false
      });
      this.tags = userData?.tags;
    }
    this.getUIDValue = userData.uid.id;
    this.onInstitutionValueChanges();
  }

  public autoValidateToggleData(): void {
    this.editUserDetailsForm.get('cellPhone').valueChanges.subscribe((value: any) => {
      if (value && value.trim() !== '' && this.phoneNumberRegex.test(value)) {
        this.editUserDetailsForm.get('cellPhoneCommunication').enable(); // Enable toggle
      } else {
        this.editUserDetailsForm.get('cellPhoneCommunication').disable(); // Disable toggle
        this.editUserDetailsForm.get('cellPhoneCommunication').setValue(false); // Set toggle to false when disabled
      }
    });

    this.editUserDetailsForm.get('email').valueChanges.subscribe((value: any) => {
      if (value && value.trim() !== '' && this.emailValidatorRegex.test(value)) {
        this.editUserDetailsForm.get('emailCommunication').enable(); // Enable toggle
      } else {
        this.editUserDetailsForm.get('emailCommunication').disable(); // Disable toggle
        this.editUserDetailsForm.get('emailCommunication').setValue(false); // Set toggle to false when disabled
      }
    });
  }
    public receiveInstituteNameID(event: string): void { 
      if(this.checkUserCreatedFromAPI !== undefined){
        this.editApiUserForm.patchValue({ 
          apiInstitution: event 
        });
      }else{
        this.editUserDetailsForm.patchValue({
          institution: event
        });
        this.getInstitutionName = event;
      }
    }
  
    public apiUserInfoUpdate(): void {
      const formData = new FormData();
      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) { formData.append("a", aCookieValue); }
      if(this.editApiUserForm.controls['apiUserID'].value !== this.getUIDValue){
        formData.append("new_uid", this.editApiUserForm.controls['apiUserID'].value);
      }
      formData.append("user_id", this.childAccessUserId);
      formData.append("first_name", this.editApiUserForm.controls['apiFirstname'].value);
      formData.append("email", this.editApiUserForm.controls['apiEmail'].value);
      formData.append("flag_basic", "");
      formData.append("sms_comm", 'false');
      this.userSvc.userInfoUpdate(formData).subscribe((response: UserInfoUpdateResponse) => {
        this.onBasedResponseTrigger(response);
      })
    }
  
    public apiUserProfileUpdate(): void {
      const formData = new FormData();
      const aCookieValue = this.cookieService.getCookie("a");
      if (aCookieValue) { formData.append("a", aCookieValue); }
      formData.append("user_id", this.childAccessUserId);
      formData.append("iid", this.editApiUserForm.controls['apiInstitution'].value);
      this.userSvc.userProfileUpdate(formData).subscribe(response => {
        this.onBasedResponseTrigger(response);
      })
    }
  
    public onBasedResponseTrigger(response: UserErrorResponse): void {
      if (response.status == status.StatusCode.OK) {
        this.getUserData(this.childAccessUserId);
      }  
    }

   public getUserDataResponse(userData:UserSearchByIdResponse):void{
    this.userData = userData?.user;
          this.userStatus = this.userData.status.s;
          if(userData.user.api_key) this.checkUserCreatedFromAPI = userData.user.api_key;
          this.userName = this.userData.first_name + this.userData.last_name;
          this.selectedSpecialty = this.userData?.profile?.dept;
          this.selectedTitle = this.userData?.profile?.title;
          this.onEditUserDetailsSetData(this.userData);
    }
  
    public getUserData(userId: string): void {
      this.userSvc.getUserDataById(userId).subscribe((data: UserSearchByIdResponse) => {
        if (data.status == status.StatusCode.OK) { 
          this.userData = data?.user; 
          this.userStatus = this.userData.status.s; 
          if(data.user.api_key) this.checkUserCreatedFromAPI = data.user.api_key; 
          this.userName = this.userData.first_name + this.userData.last_name; 
          this.selectedSpecialty = this.userData?.profile?.dept;  
          this.selectedTitle = this.userData?.profile?.title;  
          this.onEditUserDetailsSetData(this.userData);
        }
      })
    }

   public openEditUser():void{
    this.fetchInstitutionDetails(this.userData?.profile?.iid ?? "");
    }
  
    public fetchInstitutionDetails(institutionId: string): void {
      this.institutionService.getInstitutionDetails(institutionId).subscribe((data: InstitutionResponse) => {
        this.institution = data.institution;
        this.titleList = data.titles;
        this.isPagerIntegrationPresent = data.institution.wowos.includes('pager_integration');
      });
    }
  
    public showErrorTitleMsgModal(titleMsg: string):void {
      this.showErrorModal = true;
      this.showErrorMessage = titleMsg;
      this.showValidation = this.errorHandlingService.getDefaultErrorResponse();
    }

    public userStatusPopup(closePopUp:boolean):void{
      this.showUserStatusModal = !closePopUp;
      this.getUserData(this.userData?._id?.$oid ? this.userData?._id?.$oid: "");
    }

    public onInstitutionValueChanges():void{
      this.editUserDetailsForm.get("institution")?.valueChanges.subscribe((value:string) => {
        if(value !== undefined){
          this.getSpecialityAndTitleBasedInstitution(value,"edit");
        }
      });
    }
}
