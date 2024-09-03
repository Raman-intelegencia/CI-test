import {
    AuthService, 
    CookieService,
    Profiles,
    ProfileSearchResult,
    Reference,
    ROLE_NOTIFY,
    ServiceTeamsService,
    UpdateStatusResponse, 
    UsersAuthResponse,
    UserService,
    SelectedThreadHelperService
} from "@amsconnect/shared";
import { ProfileStatusDropdownService } from "../../services/profile-status-dropdown.service";
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core"; 
import { ProfileStatusHelperService } from "../../services/profile-status-helper.service"; 
import { first } from "rxjs";
import { AccountAssociationsService } from "../../services/account-association-helper.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { InboxHelperService } from "../../services/inbox-helper.service";
import { ProfileStatusClass } from "./profile-status-class";
import { environment } from "@amsconnect/shared";
import { UsersListingService } from "@amsconnect/shared";
import { PopupStateService } from "../../services/off-duty-model.service";
import { ComposeService } from "../../services/compose.service";
import { ComposeHelperService } from "../../services/compose-helper.service";
import { TranslateService } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";
@Component({
    selector: "web-messenger-profile-status-dropdown",
    templateUrl: "./profile-status-dropdown.component.html",
    styleUrls: ["./profile-status-dropdown.component.scss"],
})
export class ProfileStatusDropdownComponent extends ProfileStatusClass implements OnInit, OnDestroy {
    @ViewChild("currentCoverage") currentCoverage!: ElementRef;
    public customAutoResponse = "";
    public userType = "";
    public showNoServiceTeamText = "";
    public showScheduledStatus =false;
   @Input()isDropdownOpen=false;
   @Output() public usersUpdatedStatus = new EventEmitter<UpdateStatusResponse>();
  @Output() dropdownClosed = new EventEmitter<boolean>();
  public domainKey = "";
  public checkAdminUser: boolean | undefined;
    ngOnInit(): void {
        this.autoResponseForm = this.fb.group({
            autoResponse: ["default", [Validators.required]],
          });
        this.getAuthResponse();
        this.getUserAccounts();
        this.userService.userIndex$.subscribe((index: string) => {
            index ? (this.userIndex = index) : null;
        });
        this.subscription.push(this.authService.authResponseData$.subscribe(
            (data: UsersAuthResponse) => { 
              this.config_profileimage_url =
                data?.config?.config_profileimage_url || "";
            }
          )); 
          this.subscription.push(this.inboxHelperSvc.user$.subscribe(data=>{ 
            this.selectedUserId =data?.status.c?.ref ?? ''; 
          }))
          this.subscription.push(this.inboxHelperSvc.profiles$.subscribe(profile=>{ 
          this.matchingProfile = profile.find(item => item._id.$oid === this.selectedUserId) as Profiles;    
            if(this.matchingProfile){
              this.selectedUsers = [];
              if(this.selectedUsersStatus === 'available'){
                this.selectedUsersData = [];
            }
            else {
        // Check if the profile already exists in selectedUsersData
          const profileAlreadyExists = this.selectedUsersData?.some(item => item?._id?.$oid === this.matchingProfile?._id?.$oid);
        if (!profileAlreadyExists) {
           this.selectedUsersData?.push(this.matchingProfile as Profiles);
          }         }
              this.showModalStates.inputEditable = false; 
            } 
          }))  
          document.body.addEventListener('click', this.handleOutsideClick);
    }

    constructor(
      profileStatusDropdown: ProfileStatusDropdownService,
      private translateService: TranslateService,
      private datePipe: DatePipe,
        private authService: AuthService,
        private cookieService: CookieService,
        private profileStatusHelper: ProfileStatusHelperService,
        serviceTeamService: ServiceTeamsService,
        private userService: UserService,
        private accountAssociationSvc: AccountAssociationsService,
        private route: Router,public fb: FormBuilder,
        inboxHelperSvc: InboxHelperService,
        usersListingSvc: UsersListingService,
        private popupStateService: PopupStateService,
         selectedThreadHelperService:SelectedThreadHelperService,composeService:ComposeService,composeHelperService:ComposeHelperService,elementRef: ElementRef,
         private profileStatusHelperServ : ProfileStatusHelperService) {
        super(usersListingSvc,composeHelperService,composeService,elementRef,selectedThreadHelperService,inboxHelperSvc,profileStatusDropdown,serviceTeamService);
        this.domainKey = environment.domain_key;

    }
    public isSelectedUserStatus(status: string): boolean {
        return this.selectedUsersStatus === status;
    } 
    public openAdmin():void{
        let authString = '';
        if(this.accountAssociationSvc.isUserMultiAuthed()){
            authString = `?user_id=${this.authResponse?.user?._id?.$oid}`;
        }
        window.open(environment.admin_server_url+authString,'_blank');
    }

    public setSelectedUsersStatus(status: string): void {
      this.profileStatusHelperServ.setShowHideUserProfileFlag(this.showProfileModal);
        this.selectedUsersStatus = status;
        this.getUsersUpdateStatus(status, "",this.coverageId);
    }

    public getAuthResponse(): void {
      this.subscription.push(this.profileStatusHelper.selectedCoverageProfile$.subscribe((coverageProfileResponse: Reference)=>
      {         
        if(coverageProfileResponse.data){
          this.selectedUsers.push(coverageProfileResponse);          
        }
      }))
        this.subscription.push(this.authService.authResponseData$.subscribe(
          (data: UsersAuthResponse) => {
            this.authResponse = data; 
            this.checkAdminUser = data?.user?.admin && data?.user?.admin.length>0 ; 
            this.userType = this.userService.getUserType(this.authResponse.user);            
            if (data?.user?.status?.c) { 
            this.selectedUsers.push(data?.references?.[0] ?? {} as Reference);
                }
            this.showCurrentCoverage = this.selectedUsers[0]?.data ? true:false;
            this.showModalStates.inputEditable = this.showCurrentCoverage ? false : true;
            this.coverageId = data?.references?.[0]?.data?._id?.$oid ?? '';
          }
        ));
        this.subscription.push(this.inboxHelperSvc.user$.pipe(
            first() // Emit only the first value and complete the observable
          ).subscribe((currentUser) => {
              this.loggedInUserDetails = currentUser;
              this.showCurrentServiceTeam = this.loggedInUserDetails?.status?.r ?? []; 
    this.selectedUsersStatus = this.loggedInUserDetails?.status?.s ?? '';
    this.coverageId = currentUser?.status?.c?.ref ?? '';
    this.autoResponse =
    this.loggedInUserDetails?.status?.away_message_mode === "disable"
        ? "Disabled"
        : this.loggedInUserDetails?.status?.away_message_mode === "default" ||
        this.loggedInUserDetails?.status?.away_message_mode === "custom"
        ? this.loggedInUserDetails?.status?.away_message
        : "";
    this.customAutoResponse =
    this.loggedInUserDetails?.status?.away_message_mode === "custom"
        ?  this.loggedInUserDetails?.status?.away_message || ""
        : "";
    this.autoResponseForm
      ?.get("autoResponse")
      ?.setValue( this.loggedInUserDetails?.status?.away_message_mode);
    const awayMessageMode =  this.loggedInUserDetails?.status?.away_message_mode;
    this.showModalStates.isCustomResponseEnabled = awayMessageMode === "custom";
    this.showServiceTeamNotification = this.loggedInUserDetails?.status?.role_notify || [];
    })
    );
      }

    public removeRecipient(event:Event): void { 
        event.stopPropagation();
        this.selectedUsers = [] ;
        this.selectedUsersData = [];
        this.selectedUsersData = this.selectedUsersData.filter(item => item._id.$oid !== this.selectedUserId);
        this.selectedUserId = ''; 
        this.showModalStates.inputEditable = true;
        this.currentCoverage.nativeElement.value = '';
        this.coverageId = ''; 
        this.getUsersUpdateStatus(this.selectedUsersStatus,'',''); 
    }

    public getSearchedUsersList(): void {
        this.profileStatusDropdown.searchUsers(this.currentCoverage.nativeElement.value).subscribe((data: ProfileSearchResult) => {
            this.searchResults = data.references;   
            this.showModalStates.isInputFocused = false;    
            if(this.selectedUsers && this.selectedUsers?.[0]?.data){
                this.currentCoverage.nativeElement.value = "";
            }
            this.showModalStates.noResultsFound = this.searchResults.length === 0 && this.currentCoverage.nativeElement.value.trim() === "";
        });
    }

    public checkIfUserLoggedOut(userId: string): boolean {
        return this.accountAssociationSvc.isUserAuthed(userId) ? false : true;
    }
    public selectUser(user: Reference,event:Event): void { 
      event.stopPropagation();
        this.selectedUsers.push(user);
        this.showModalStates.noResultsFound = true;
        this.showModalStates.inputEditable = false;
        this.currentCoverage.nativeElement.value = "";
        this.currentCoverage.nativeElement.focus();
        this.coverageId = user?.data?._id?.$oid;
        this.getUsersUpdateStatus(this.selectedUsersStatus,user?.data?.status?.away_message_mode,user.data._id.$oid);
    }
    
    public closeSTNotificationPopup(): void {
      if(this.showServiceTeamNotification.length) {
        this.profileStatusDropdown.delete_service_notification(this.authResponse?.user?._id?.$oid).subscribe((response) => {
          this.showServiceTeamNotification = [];
          this.showNoServiceTeamText = response.status === "ok" ? "No Service Team Notification To Display." : "";
      });
      }
      else {
        this.showServiceTeamNotification = [];
      }
    }
  
    public selectedAutoResponse(option: string): void {
        this.profileStatusHelper.selectedAutoResponse(option);
        this.userUpdateStatus.away_message_mode = this.profileStatusHelper.userUpdateStatus.away_message_mode;
        this.showModalStates.isCustomResponseEnabled = this.profileStatusHelper.showModalStates.isCustomResponseEnabled;
    }

    public redirectTo(route: string): void {
        this.userIndex ? this.route.navigateByUrl(`u/${this.userIndex}/${route}`) : "";
    }

    public saveAutoResponse(): void {
        this.autoResponse = this.customAutoResponse;
        const currentValue = this.autoResponseForm.controls["autoResponse"].value;
        if (currentValue === "custom" && this.customAutoResponse !== currentValue) {
          this.customAutoResponse = currentValue;
        } else if (currentValue !== "custom") {
          this.customAutoResponse = "";
        }
        if (currentValue === "disable") {
          this.autoResponse = "Disabled";
        }
        this.getUsersUpdateStatus(this.selectedUsersStatus, currentValue,this.coverageId);
        this.showModalStates.showAutoResponsePopup = false;
      }

    public logout(): void {
      this.accountAssociationSvc.createLogoutCookie('You have logged out successfully');
      localStorage.removeItem('selectedThreadId'); 
      localStorage.removeItem('lastVisitedUrl');
        this.accountAssociationSvc.explicitlyLogoutRemovedUser(this.authResponse.user._id.$oid);
        this.cookieService.removeCookie("otp_reminder");
        this.popupStateService.clearStorage();
    }

    public getUserAccounts(): void {
        this.loggedInUsersData = this.authResponse;
        this.profileStatusHelper.getUserAccounts(this.loggedInUsersData);
        this.hasMultipleAccounts = this.profileStatusHelper.hasMultipleAccounts;
        this.accountInformation = this.profileStatusHelper.accountInformation;
    }

    public navigateToAccountScreen(id?: string): void {
        if (id) {
            const existingData = this.accountAssociationSvc.parseJStorageData();
           const userIndex =  existingData['url_user_associations'] ? this.accountAssociationSvc.findUrlAssociation(existingData['url_user_associations'],id) : null;
           const userData = existingData[this.accountAssociationSvc.storageKeyForUserId(id,'account_information')];
           localStorage.removeItem('selectedThreadId');
           if(!this.checkIfUserLoggedOut(id) && userIndex){   //check if the account is signed out and has user index before navigating to messenger.
            window.open(`${environment.messenger_server_url}#/u/${userIndex}/`)
           }else{    //execute else block only in case of account signe-out & userindex not present
            this.cookieService.setSCookie(userData,environment.domain_key)
            window.open(environment.accounts_server_url + `#/accounts/switch/${id}`);
           }
        } else {
            window.open(environment.accounts_server_url + `#/accounts/add`, "_blank");
            localStorage.removeItem('selectedThreadId');
        }
    }
    // need to log the user out using logout api as well
    public removeUser(userId: string): void {
        const existingData = this.accountAssociationSvc.parseJStorageData();
        const accountKey = this.accountAssociationSvc.storageKeyForUserId(userId,'account_information')
        if(existingData[accountKey]){
         delete (existingData[accountKey])
        }
        localStorage.setItem('jStorage',JSON.stringify(existingData));
        this.accountAssociationSvc.removeUserAssociations(this.loggedInUsersData.user._id.$oid,userId);
        const index = this.accountInformation.findIndex((account) => account._id.$oid === userId);
        if (index !== -1) {
            this.accountInformation.splice(index, 1);
        }
    }

    public  handleOutsideClick = (event: MouseEvent): void => {
      // Check if the clicked element is outside of the dropdown component
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
        this.dropdownClosed.emit(this.isDropdownOpen);
      }
    };

    public openScheduledStatus():void{
      this.showScheduledStatus = !this.showScheduledStatus;
    }
     
    ngOnDestroy(): void {
        this.subscription.forEach((sub) => sub.unsubscribe());
        document.body.removeEventListener('click', this.handleOutsideClick);
    }

  public getIntegrationEventUpdatedText(serviceNotification?: ROLE_NOTIFY): string {
    const updatedText = this.translateService.instant("integratedScheduleUpdated",
      {
        vendorName: serviceNotification?.admin_first_name,
        teamNames: serviceNotification?.sname
      });
    const updatedDateText = this.datePipe.transform(serviceNotification?.date?.$date, 'MMM dd y, h:mm:ss a');
    return `${updatedText} ${this.translateService.instant("on")} ${updatedDateText}.\n${this.translateService.instant("checkServiceTeamDetail")}`;
  }
}
