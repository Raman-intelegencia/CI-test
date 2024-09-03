import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { UpdatePagerResponse, UserEmailSubscriptionResponse, UserInfoUpdateResponse, UserProfilePhotoResponse } from '../../../modals/users.model';
import { CookieService, InstitutionService, UserService, status, ErrorHandlingService, AuthService, UsersAuthResponse } from '@amsconnect/shared';
import { UserInfoService } from '../../../services/user-info.service';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { InstitutionsService } from '../../../services/institutions.service';
import { UserDetailBaseComponent } from './user-detail.class';
import { environment } from '@amsconnect/shared';
import { Router } from '@angular/router';
import { AppNavigationService } from 'apps/admin/src/services/app-navigation.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'web-messenger-user-details',
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent extends UserDetailBaseComponent implements OnChanges, OnInit {
  @Input() userId = "";
  public updateUserTag = false;
  public showLoader = false;
  constructor(
    userSvc: UsersService,
    userDataSvc: UserService,
    userInfoSvc: UserInfoService,
    destroySub: DestroyRef,
    formBuilder: FormBuilder,
    institutionService: InstitutionsService,
    cookieService: CookieService,
    cd: ChangeDetectorRef,
    errorHandlingService: ErrorHandlingService,
    authService: AuthService,institutionsService: InstitutionService,router: Router, navigateSvc: AppNavigationService,
    private translate: TranslateService,
    ) {
    super(userSvc, userDataSvc, userInfoSvc, destroySub, formBuilder, institutionService, cookieService, cd, errorHandlingService, authService,institutionsService,router, navigateSvc);
    this.destroySub.onDestroy(() => {
      this.subscription.unsubscribe();
      this.authSubscription.unsubscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getEmailSubscription(this.userId);
    this.userInfoSvc.setUserInfoPageRedirection(true);
    this.userInfoSvc.setUserInfoPageRedirection(true);
  }

  ngOnInit(): void {
    this.childAccessUserId = this.userId;
    this.subscription = this.userDataSvc.imageUrlPath$.subscribe(path => this.imageUrl = path);
    this.authSubscription = this.userDataSvc.userId$.subscribe(id => this.currentUserId = id);
    this.accountUrl = environment.accounts_server_url;
    this.onCreateEditUserDetailsForm();
    this.getdata();
    this.getSpecialityAndTitle("edit");
    this.userInfoSvc.setUserInfoPageRedirection(true);
  }

  public openServiceTeamModal():void {
      this.showServiceTeamModal = true;
    }
  public getdata():void{
    this.subscription =this.authService.authResponseData$.subscribe((userAuthResponse: UsersAuthResponse) => {
      this.authResponse = userAuthResponse;  
      this.instituteName = this.authResponse?.user?.profile?.iname;
      this.updateUserTag =  userAuthResponse?.user?.access_group_actions_map?.client_user_tags_update;
      this.getALLCurrentUserPermissionList = userAuthResponse?.user?.access_group_actions_map;
      this.pageNumberFieldDisabled=this.getALLCurrentUserPermissionList?.client_user_pager_update;
      if(this.pageNumberFieldDisabled === false){
        this.editUserDetailsForm.controls['pagerNumber'].disable();
      }
    });
  }

  public getEmailSubscription(userId: string): void {
    this.userInfoSvc.getEmailSubscription(userId).subscribe((data: UserEmailSubscriptionResponse) => {
      this.userEmailSubscriptionData = data.user_email_subscriptions;
    })
  }

  public reportingTags(tabname: string): void { this.reporting_active_status = tabname; }
  public getImageUrl(imageId: string | undefined): string { return imageId ? this.imageUrl + imageId + "_profile.png" : ""; }
  public removePagerNumber(): void {
    const userId = this.userData?._id?.$oid ?? "";
    this.userSvc.userUpdatePager(userId).subscribe((data: UpdatePagerResponse) => {
      if (this.userData && this.userData.profile && data?.user?.profile) {
        this.userData.profile.pager_number = data.user.profile.pager_number;
      }
      this.getUserData(this.userId);
    })
  }

  public get f() { return this.editUserDetailsForm.controls; }
  public get h():{[key:string]:AbstractControl} { return this.editApiUserForm.controls; }
  public onCreateEditUserDetailsForm(): void {
    this.editApiUserForm = this.formBuilder.group(
      {
          apiFirstname: new FormControl("", [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
          apiUserID: new FormControl("", [Validators.required]),
          apiEmail: new FormControl("", [Validators.required, Validators.pattern(this.emailValidatorRegex)]),
          apiInstitution: new FormControl("", [Validators.required]),
      });
      this.editUserDetailsForm = this.formBuilder.group(
        {
          firstname: new FormControl("", [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
          lastname: new FormControl("", [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
          userID: new FormControl("", [Validators.required]),
          email: new FormControl("", [Validators.required, Validators.pattern(this.emailValidatorRegex)]),
          emailCommunication: new FormControl({ value: false, disabled: true }),
          cellPhone: new FormControl("", [Validators.pattern(this.phoneNumberRegex)]),
          cellPhoneCommunication: new FormControl({ value: false, disabled: true }),
          institution: new FormControl("", [Validators.required]),
          specialty: new FormControl("",),
          title: new FormControl("",),
          pagerNumber: new FormControl(""),
          location: new FormControl(""),
          locationDetail: new FormControl(""),
          city: new FormControl(""),
          state: new FormControl(""),
          basicUser: new FormControl(),
          image: new FormControl(),
        });
    if(this.checkUserCreatedFromAPI === undefined){
      this.autoValidateToggleData();
    }
  }

  public triggerForApiOrNormalUser(isCheckUserIDChange:string,apiUserOrNot:boolean):void{
    if(isCheckUserIDChange !== this.getUIDValue){
      this.showUIDError();
    }else{
      apiUserOrNot ? this.updateAPIUserEntries() : this.updateUserEntries();
    }
  }

  public createNewUser(): void {
    this.submitted = true;
    if (this.editUserDetailsForm.invalid) { 
      return;
    }
    this.triggerForApiOrNormalUser(this.editUserDetailsForm.controls['userID'].value,false)
  }

  public updateUserEntries():void{
    this.userInfoUpdate();
    this.userProfileUpdate();
    if(this.editUserDetailsForm.controls['pagerNumber'].value != ""){
      this.updatePagerNumber(this.editUserDetailsForm.controls['pagerNumber'].value);
    }
    if(this.editUserDetailsForm.controls['pagerNumber'].value == undefined || 
    this.editUserDetailsForm.controls['pagerNumber'].value == ""){
      this.updatePagerNumber(this.editUserDetailsForm.controls['pagerNumber'].value);
    }
    if(this.tags != undefined ){ 
      if(this.updateUserTag){
        this.userTagsUpdate();
      }
    }
    this.getUserData(this.userId);
    this.closeEditModalPopup('adEditUser');
    this.showUIDModal = false;
  }

  public editApiUserSubmit(): void {
    this.submitted = true;
    if (this.editApiUserForm.invalid) { 
      return;
    }
    this.triggerForApiOrNormalUser(this.editApiUserForm.controls['apiUserID'].value,true)  
  }

  public updateAPIUserEntries():void{
    this.apiUserInfoUpdate();
    this.apiUserProfileUpdate();
    this.getUserData(this.userId);
    this.closeEditModalPopup('adLockUser');
    this.showUIDModal = false;
  }

  public updatePagerNumber(pager_Number: string): void {
    const userId = this.userData?._id?.$oid ?? "";
    this.userSvc.userUpdatePager(userId, pager_Number).subscribe((response: UpdatePagerResponse) => {
      this.onBasedResponseTrigger(response);
    })
  }

  public userTagsUpdate(): void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    formData.append("user_id", this.userId);
    const tags = this.tags?.map((tag: any) => tag);
    tags?.forEach((formattedtag: string | Blob) => formData.append("tags", formattedtag));
    this.userSvc.userUpdateTag(formData).subscribe((response) => {
      this.onBasedResponseTrigger(response);
    })
  }

  public userInfoUpdate(): void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    let cellPhoneValue = this.editUserDetailsForm.controls['cellPhone'].value;
    let cellphone = (typeof cellPhoneValue !== 'undefined') ? cellPhoneValue : "";
    if(cellphone != "")
    { formData.append("cellphone", cellphone); }
    else 
    {
      formData.append("cellphone", cellphone);
      this.editUserDetailsForm.controls['cellPhoneCommunication'].setValue(false);
    }
    if(this.editUserDetailsForm.controls['userID'].value !== this.getUIDValue){
      formData.append("new_uid", this.editUserDetailsForm.controls['userID'].value);
    }
    formData.append("user_id", this.userId);
    formData.append("first_name", this.editUserDetailsForm.controls['firstname'].value);
    formData.append("last_name", this.editUserDetailsForm.controls['lastname'].value);
    formData.append("email", this.editUserDetailsForm.controls['email'].value);
    this.editUserDetailsForm.controls['basicUser'].value === true ? formData.append("flag_basic", "true") : formData.append("flag_basic", "");
    this.editUserDetailsForm.controls['emailCommunication'].value === true ? formData.append("email_comm", "true") : formData.append("email_comm", "false");
    this.editUserDetailsForm.controls['cellPhoneCommunication'].value === true ? formData.append("sms_comm", "true") : formData.append("sms_comm", 'false');
    this.userSvc.userInfoUpdate(formData).subscribe((response: UserInfoUpdateResponse) => {
      this.onBasedResponseTrigger(response);
    })
  }

  public userProfileUpdate(): void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    formData.append("user_id", this.userId);
    formData.append("iid", this.editUserDetailsForm.controls['institution'].value);
    formData.append("specialty", this.editUserDetailsForm.controls['specialty'].value);
    formData.append("title", this.editUserDetailsForm.controls['title'].value);
    formData.append("location", this.editUserDetailsForm.controls['location'].value ?? "");
    formData.append("detail", this.editUserDetailsForm.controls['locationDetail'].value ?? "");
    formData.append("city", this.editUserDetailsForm.controls['city'].value ?? "");
    formData.append("state", this.editUserDetailsForm.controls['state'].value ?? "");
    this.userSvc.userProfileUpdate(formData).subscribe(response => {
      this.onBasedResponseTrigger(response);
    })
  }

  public closetoggleDropdown(): void {
    this.editUserDetailsForm.get('specialty').setValue(this.selectedSpecialty);
    this.editUserDetailsForm.get('title').setValue(this.selectedTitle);
    this.showInstituteDropdown = false;
    this.showspecialtyDropdown = false;
    this.showTitleDropdown = false;
  } 
  public removeProfilePhoto(): void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    formData.append("image", "");
    formData.append("user_id", this.userId);
    this.userSvc.userProfilePhotoUpdateRemove(formData).subscribe((imageResponse: UserProfilePhotoResponse) => {
      if (imageResponse.status === status.StatusCode.ERROR) {
        this.showValidation = this.errorHandlingService.getErrorResponse(imageResponse);
      }
      this.userDataSvc.setImageId("");
      this.getUserData(this.userId);
    });
  }

  public uploadFile(event: Event): void {
    this.showLoader = true;
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const binaryData = reader.result as string;
        this.uploadProfileImage(file);
      };
      this.cd.markForCheck();// ChangeDetectorRef since file is loading outside the zone
    }
  }

  public uploadProfileImage(storeImageUrl: File): void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    formData.append("user_id", this.userId);
    formData.append("image", storeImageUrl as Blob);
    this.userSvc.userProfilePhotoUpdateRemove(formData).subscribe((imageResponse: UserProfilePhotoResponse) => {
      if (imageResponse.status === status.StatusCode.ERROR) {
        this.showValidation = this.errorHandlingService.getErrorResponse(imageResponse);
      }
      this.userDataSvc.setImageId(imageResponse.image_id);
      this.getUserData(this.userId);
      this.showLoader = false;
    });
  }

  public performLockResetSendPassword(action: string):void {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { formData.append("a", aCookieValue); }
    formData.append("user_id", this.userId);
    const handleResponse = (observable: any, successMessage: string,msgFlagActive: boolean, msgTitle: string, autologOut: boolean) => {
      observable.subscribe(
        (response: any) => {
          this.showSuccessPopup = false;
          response.message = response.temp_password ? response.message.split('[')[0] + `<span class="text-xl text-red-500">[${response.message.split('[')[1]}</span>` : response.message;
          let lockUnlockNotificationMsg = response.notifications != undefined ? response.notifications : msgTitle;
          msgFlagActive === false 
          ? this.showPopUpAndLogoutScreen(successMessage, msgFlagActive, response.message) 
          : this.showPopUpAndLogoutScreen(successMessage, msgFlagActive, lockUnlockNotificationMsg );
          
          this.onBasedResponseTrigger(response);
          autologOut === true &&  this.currentUserId === this.userId ? this.logout(): ""; 
        }
      );
    };

    switch (action) {
      case 'Lock User':
        handleResponse(this.userSvc.userLock(formData), 'Locked User', true, 'Locked Successfully', true);
        break;
      case 'Unlock User':
        handleResponse(this.userSvc.userUnLock(formData), 'Unlocked User', true, 'Unlocked Successfully', false);
        break;
      case 'Send Reset Password Link':
        formData.append("temp_password", "false");
        handleResponse(
          this.userSvc.userSendPasswordResetLink(formData),'Reset Password',
          false,'Reset Password Link Sent',true
        );
        break;
      case 'Generate Temporary Password':
        formData.append("temp_password", "true");
        handleResponse(
          this.userSvc.userSendPasswordResetLink(formData),'Generate Temporary Password',
          false,'Temporary Password Generated Successfully',true);
        break;
      case 'Notifications Sent':
        handleResponse(this.userSvc.userNotify(formData),'Notifications Sent Successfully',
          true,'Sent 0 notifications',false);
        break;
    }
  }

  public getCurrentUserDataRespWindow(event:boolean):void{
    if(event === true){
      this.getUserData(this.userId);
    }
  }

  public showUIDError():void{
    this.showUIDModal = true;
    this.showUIDTitle=this.translate.instant('ConfirmUserIDChange');
    this.showUIDMessage=this.translate.instant('TheUIDMUST');
  }

  public triggerNormalApiUserUpdate():void{
    if(this.checkUserCreatedFromAPI == undefined){
      this.updateUserEntries();
    }else if(this.checkUserCreatedFromAPI !== undefined) {
      this.updateAPIUserEntries();
    }
  }
}