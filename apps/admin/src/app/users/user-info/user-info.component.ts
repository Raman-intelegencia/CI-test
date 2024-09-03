import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Admin, ApiKeyResponse, SftpResponse, User, UserEmailSubscriptionResponse, UserStatusType, WebHookData, WebhooksResponse } from '../../../modals/users.model';
import { UserHelperService } from '../../../services/user-helper.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserInfoService } from '../../../services/user-info.service';
import { Subscription } from 'rxjs';
import { AuthService, UsersAuthResponse, access_group_actions_map } from '@amsconnect/shared';

@Component({
  selector: 'web-messenger-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnChanges,OnInit {
  @Input() userInfoData: User | null = null;
  @Input() userApiInfoData: any;
  @Input() userEmailSubscriptionData: { idle_email: boolean; second_channel: boolean; } | null = null;
  public userStatusType = UserStatusType;
  public webhookForm: FormGroup;
  public sftpForm: FormGroup;
  public isEditMode = false;
  public isEditSftpMode = false;
  public successError:string = '';
  public showErrorPopup:boolean = false;
  public showSftpForm = false;
  public addingNewSftpData = false;
  public showWebhooksForm = false;
  public addingNewWebhooksData = false;
  public isApi = false;
  public authSubscription = new Subscription;
  public getALLCurrentUserPermissionList!:access_group_actions_map;
  public modalTitleMessage:string = "";
  public showConfirmRemoveWebHook=false;
  public userApiorNot:boolean = false;
  @Output('getCurrentUserDataResp') getCurrentUserData = new EventEmitter<boolean>();
  public isCheckboxChecked: boolean = false;
  
  constructor(
    private userHelperSvc: UserHelperService,private userInfoSvc: UserInfoService,
    private fb: FormBuilder,private changeDetectorRef: ChangeDetectorRef,
    public authService: AuthService, public destroySub: DestroyRef,
  ) {
    this.webhookForm = this.fb.group({
      message_sent: ['', Validators.required],
      message_read: ['', Validators.required],
      user_status: ['', Validators.required],
      user_provisioning: ['', Validators.required]
    });
    this.sftpForm = this.fb.group({ public_key: ['', Validators.required],username: ['', Validators.required] });
    this.destroySub.onDestroy(() => { this.authSubscription.unsubscribe();});
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
    if (changes['userInfoData']?.currentValue) {
      this.processUserData();
      this.apiUserOrNot();
      this.userInfoSvc.setUserInfoPageRedirection(true);
      this.isCheckboxChecked = this.userInfoData?.flag_active === true ? true : false;
    }
  }

  public apiUserOrNot():void{
    if(this.userApiInfoData.type === 'oneway'){
      this.userApiorNot = true;
    }else if(this.userApiInfoData.type === 'standard'){
      this.userApiorNot = false;
    }    
  }

  ngOnInit(): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
    this.authSubscription = this.authService.authResponseData$.subscribe((response:UsersAuthResponse) => {
      this.getALLCurrentUserPermissionList = response?.user?.access_group_actions_map;
    })
  }

  private processUserData(): void {
    this.showSftpForm = !!this.userInfoData && !!this.userInfoData?.public_key;
    this.showWebhooksForm = !!this.userInfoData && !!this.userInfoData?.webhooks;
    this.isApi = this.userInfoData?.api_key !== undefined; //check if API user
    if (this.userInfoData?.webhooks) { this.patchWebhookFormData(); }
    if(this.userInfoData?.public_key && this.userInfoData?.username){
      this.sftpForm.patchValue({
        public_key: this.userInfoData?.public_key,
        username: this.userInfoData?.username
      });
    }
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.webhookForm.controls;
  }

  public get sftpFormControls(): { [key: string]: AbstractControl } {
    return this.sftpForm.controls;
  }

  public isAdmin(admin: Admin[] | undefined): boolean {
    return this.userHelperSvc.isAdmin(admin);
  }

  public isSuperAdmin(admin: Admin[] | undefined): boolean {
    return this.userHelperSvc.isSuperAdmin(admin);
  }

  public getServicesString(services: string[] | undefined): string {
    return services ? services.join(', ') : '';
  }

  public hasEmailSubscriptionProperty(obj: { idle_email: boolean; second_channel: boolean },
    prop: string): boolean {
    return obj && Object.prototype.hasOwnProperty.call(obj, prop);
  }

  public userEmailSubUpdate(key: string, flag: boolean): void {
    this.userInfoSvc.userEmailUpdateSubscription(
        this.userInfoData?._id?.$oid ? this.userInfoData?._id?.$oid : '',key,flag)
      .subscribe((data: UserEmailSubscriptionResponse) => { this.userEmailSubscriptionData = data.user_email_subscriptions;});
  }

  public removeApiKey():void{
    let userId=this.userInfoData ?._id?.$oid ?? "";

    this.userInfoSvc.removeApiKey(userId).subscribe((data:ApiKeyResponse) => {
      if (data.status != 'error') {
        this.onSuccessApiCall(data);
      }
    })
  }

  public setSftpCredentials():void{
    const userId = this.userInfoData ?._id?.$oid ?? ''; 
    const formData = {
      user_id: userId,
      public_key: this.sftpFormControls['public_key']?.value,
      username: this.sftpFormControls['username']?.value
    }
    this.userInfoSvc.setSftpCredentials(formData).subscribe((data:SftpResponse) => {
      if (data.status != 'error') {
        this.showErrorPopup = false;
        this.toggleSftpEditMode();
        this.userInfoData = data.user;
      }
    })
  }

  public removeSftpCredentials():void{
    const userId = this.userInfoData ?._id?.$oid ?? ''; 
    this.userInfoSvc.removeSftpCredentials(userId).subscribe((data:SftpResponse) => {
      if (data.status != 'error') {
        this.showErrorPopup = false;
        this.userInfoData = data.user;
        this.showSftpForm = false;
      }
    })
  }

  public setWebhooks(): void {
    const userId = this.userInfoData?._id?.$oid ? this.userInfoData?._id?.$oid: '';
    const formData: WebHookData = {
      message_sent: this.f['message_sent'].value,
      message_read: this.f['message_read'].value,
      user_status: this.f['user_status'].value,
      user_provisioning: this.f['user_provisioning'].value,
    };
    this.userInfoSvc.setWebhooks(userId, formData).subscribe((data:WebhooksResponse) => {
      if (data.status != 'error') {
        this.showErrorPopup = false;
        this.getCurrentUserData.emit(true);
        this.toggleEditMode();
      }});
  }

  public removeWebHook():void{
    const userId = this.userInfoData?._id?.$oid ? this.userInfoData?._id?.$oid : '';
    this.userInfoSvc.removeWebhooks(userId).subscribe((data:WebhooksResponse) => {
      if (data.status != 'error') {
        this.showWebhooksForm = false;
        this.showErrorPopup = false;
        this.getCurrentUserData.emit(true);
        this.showConfirmRemoveWebHook=false;
      }
    })
  }
  
  public closepopup(): void {
    this.successError = '';
    this.showErrorPopup = false;// close the error modal & create the modal message
  }

  public toggleEditMode():void {
    if (this.addingNewWebhooksData && this.isFormEmpty(this.webhookForm)) {
      this.showWebhooksForm = false;// Hide the form if adding new data and no data was entered
    }
    this.isEditMode = !this.isEditMode;
    this.addingNewSftpData = false;
  }

  public toggleSftpEditMode(){
    if (this.addingNewSftpData && this.isFormEmpty(this.sftpForm)) {
      this.showSftpForm = false;// Hide the form if adding new data and no data was entered
    }
    this.isEditSftpMode = !this.isEditSftpMode;
    this.addingNewSftpData = false; // Reset the state
  }

  public patchWebhookFormData(): void {
    this.webhookForm.patchValue({
      message_sent: this.userInfoData?.webhooks?.message_sent,
      message_read: this.userInfoData?.webhooks?.message_read,
      user_status: this.userInfoData?.webhooks?.user_status,
      user_provisioning: this.userInfoData?.webhooks?.user_provisioning,
    });
  }

  public addSftpAccess():void{
    this.isEditSftpMode = true;
    this.showSftpForm = true;
    this.sftpForm.reset();
    this.addingNewSftpData = true; // Indicate that we're adding new data
  }

  public addWebhooks():void{
    this.isEditMode = true;
    this.showWebhooksForm = true;
    this.webhookForm.reset();
    this.addingNewWebhooksData = true; // Indicate that we're adding new data
  }

  private isFormEmpty(form: FormGroup): boolean {
    return Object.values(form.controls).every(control => !control.value); // Implement logic to check if the form fields are empty
  }

  public showErrorMsg(data:WebhooksResponse):void{
    this.successError = data.message || '';
    this.modalTitleMessage = "Error";
    this.showErrorPopup = true;
  }
  
  public confirmRemoveWebHook():void{
    this.showConfirmRemoveWebHook=true;
  }
  
  public resetPopupvalue():void{
    this.showConfirmRemoveWebHook=false;
   }

  public generateApiKey():void{
    let userId=this.userInfoData ?._id?.$oid ?? "";
    this.userInfoSvc.generateApiKey(userId).subscribe((data:ApiKeyResponse) => {
    if (data.status === 'error') {
        this.showErrorMsg(data);
    } else {
        this.onSuccessApiCall(data);
    }})
  }

  public removeApiKeyConfirmation(titleMessage:string):void{
    if(titleMessage ==="Confirm Api key Removal"){
      this.removeApiKey();
    }else{
      this.closepopup();
    }
  }

  public removeApiKeyPopUp():void{
    this.successError = "Are you sure you want to remove this API key? Anyone still using this key will be denied API access. This action can not be undone.";
    this.modalTitleMessage = "Confirm Api key Removal";
    this.showErrorPopup = true;
  }

  public openLegalAggrement():void{ window.open('https://api-qa2.play.amsconnectapp.com/legal/agreement/amsconnect/tos/1.0','_blank'); }

  public handleCheckboxChange(label:boolean): void {
    let userId=this.userInfoData ?._id?.$oid ?? "";
    this.userInfoSvc.canBeMessegedApi(userId,label).subscribe((data:ApiKeyResponse) => {
    if (data.status === 'error') {
        this.showErrorMsg(data);
    } else {
      this.onSuccessApiCall(data);
    }})
  }

  public onSuccessApiCall(data:ApiKeyResponse){
    this.closepopup();
    this.toggleSftpEditMode();
    this.getCurrentUserData.emit(true);
  }

}
