import { AuthUser, loadLatestMessage, Profiles, ROLE_NOTIFY, SelectedThreadHelperService,ServiceTeamsService, Shift, UpdateStatusResponse, Users, UsersAuthResponse } from '@amsconnect/shared';
import {
  addRecipientData,
  Reference,
  ShowModalStates,
  UserUpdateStatus,
} from '../../models/off-duty-modal.model';
import { UsersListingService } from '../../../../../libs/shared/src/lib/services/users-listing.service';
import { ComposeHelperService } from '../../services/compose-helper.service';
import { ComposeService } from '../../services/compose.service';
import { ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { InboxHelperService } from '../../services/inbox-helper.service';
import { ProfileStatusDropdownService } from '../../services/profile-status-dropdown.service';
const STATUS_OPTIONS: {
  value: string;
  class: string;
  label: string;
  icon: string;
}[] = [
  {
    value: 'available',
    class: 'text-green-500',
    label: 'available',
    icon: 'check-circle',
  },
  { value: 'busy', class: 'text-neutral', label: 'busy', icon: 'prohibit' },
  {
    value: 'off',
    class: 'text-gray-600',
    label: 'offDuty',
    icon: 'minus-circle',
  },
];
export class ProfileStatusClass {
  public showModalStates: ShowModalStates = {
    showCurrentServiceTeam: false,
    noResultsFound: false,
    isInputFocused: false,
    showAutoResponsePopup: false,
    isCustomResponseEnabled: false,
    showUserList: true,
    inputEditable: true,
    showModal: true,
  };
  public statusOptions = STATUS_OPTIONS;
  public selectedUsersStatus = '';
  public loadLatestResponse!: loadLatestMessage;
  public showCurrentServiceTeam!: string[];
  public maxLength = 27;
  public searchResults: Reference[] = [];
  public selectedUsers: Reference[] = [];
  public autoResponse: string | undefined;
  public showErrorMessage = 'error';
  public showServiceTeamNotification: ROLE_NOTIFY[] = [];
  public selectedAutoResponseValue = '';
  public customResponse = '';
  public account_server_url = '';
  public searchUsersData: addRecipientData = {
    usersDataList: [],
    selectedUsers: [],
  };
  public showManageMultipleAcc = false;
  public userUpdateStatus: UserUpdateStatus = {
    status: '',
    away_message_mode: '',
    role: [],
    coverage: '',
    scheduler_type: '',
    removed_manual_role: '',
    away_message: '',
  };
  public showLogoutPopup = false;
  public config_profileimage_url = "";
  public selectedUserIdDetails = '';
   public showProfileModal = false;
   public authResponse!: UsersAuthResponse;
   public userIndex = "";
   public loggedInUsersData!: UsersAuthResponse;
   public storeMultipleAccountsData!: {
       url_user_associations: any;
       account_information: { [x: string]: any };
   };
   public hasMultipleAccounts = false;
   public accountInformation: AuthUser[] = [];
   public subscription: Subscription[] = [];
   public journalId = 0;
   public settingsLabelStates = {
       archiveChats: false,
   };
   public autoResponseForm!: FormGroup;
   public coverageId = '';
   public loggedInUserDetails!: Users | null;
   public showCurrentCoverage =false; 
   public selectedUserId !:string;
   public selectedUsersData: Profiles[] = [];
  public  matchingProfile !: Profiles; 
   constructor(
    public usersListingSvc: UsersListingService,
    public composeHelperService:ComposeHelperService, public composeService:ComposeService,
    public elementRef: ElementRef,public selectedThreadHelperService:SelectedThreadHelperService,
    public inboxHelperSvc: InboxHelperService,public profileStatusDropdown: ProfileStatusDropdownService,
    public serviceTeamService: ServiceTeamsService,
    ){}

  public openCurrentServiceTeamModal(): void {
    this.showModalStates.showCurrentServiceTeam = true;
  }

  public openManageMultipleAccs(): void {
    this.showManageMultipleAcc = true;
  }

  public closeLogout(): void {
    this.showLogoutPopup = false;
  }
  public openLogoutPopup(): void {
    this.showLogoutPopup = true;
  }

  public getImageUrl(image_id: string): string {
    return  this.usersListingSvc.getImageUrl(this.config_profileimage_url, image_id);
  }

  public viewProfile(user: AuthUser | string, type: 'userObj' | 'userId'): void {
    if (type === 'userObj' && typeof user === 'object' && user) {
        this.selectedUserIdDetails = user._id?.$oid;
    } else if (type === 'userId' && typeof user === 'string') {
        this.selectedUserIdDetails = user;
    }
    this.showProfileModal = true;
}

public openAutoResponsePopup(): void {
  this.showModalStates.showAutoResponsePopup = true;
  this.customResponse = this.autoResponse || this.userUpdateStatus.away_message_mode;
}
public closeErrorPopup(): void {
  this.showErrorMessage = "";
  this.showModalStates.showAutoResponsePopup = false;
  this.showServiceTeamNotification = [];
}

public enableDisablefn(propertyName: keyof ShowModalStates): void {
  this.customResponse = this.autoResponse || this.userUpdateStatus.away_message_mode;
  this.showModalStates[propertyName] = !this.showModalStates[propertyName];
}
public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
  this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
  this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
  this.showManageMultipleAcc = false;
}

public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
this.composeService.addComposeQueryParamsForUserId( userId,messageType);
this.showManageMultipleAcc = false;
}

public showUserProfile(showProfileModal: boolean): void {
  this.showProfileModal = showProfileModal;
}

public getUsersUpdateStatus(status: string, away_message_mode: string,coverage_id:string): void {
  this.subscription.push(
      this.inboxHelperSvc.user$.subscribe((currentUser) => {
        this.loggedInUserDetails = currentUser;
      })
    );
    this.subscription.push(this.serviceTeamService.shiftsData$.subscribe(
      (shifts: Shift[]) => {
        this.userUpdateStatus.scheduler_type =
          shifts.length > 0 ? shifts[0].scheduler_type : "";
      }
    ));
    const updateObject: UserUpdateStatus = {
      status: status,
      role: this.loggedInUserDetails?.status?.r ?? [],
      coverage: coverage_id,
      away_message: this.autoResponse,
      away_message_mode: away_message_mode ? away_message_mode : this.loggedInUserDetails?.status?.away_message_mode ?? '',
      scheduler_type: this.userUpdateStatus.scheduler_type,
      removed_manual_role: this.userUpdateStatus.removed_manual_role,
    };
    this.profileStatusDropdown
      .usersUpdateStatus(updateObject)
      .subscribe((userStatusResponse: UpdateStatusResponse) => { 
        this.selectedUsersStatus = userStatusResponse?.user?.status.s ?? '';
        this.coverageId =  userStatusResponse.user.status.c?.ref ?? '';
        this.coverageId = this.selectedUsersStatus === 'available' ? '' : userStatusResponse.user.status.c?.ref ?? '';
        if(this.selectedUsersStatus === 'available'){
          this.selectedUsers = [];
      }
      this.showModalStates.inputEditable = this.coverageId ? false : true;
        this.autoResponse =
          userStatusResponse?.user?.status?.away_message_mode === "disable"
            ? "Disabled"
            : userStatusResponse?.user?.status?.away_message_mode ===
              "default"
            ? userStatusResponse?.user?.status?.away_message
            : userStatusResponse?.user?.status?.away_message_mode === "custom"
            ? this.autoResponse
            : "";
            if(status === "off"){
              this.selectedThreadHelperService.setFlagToShowOffDutyModal(false);
            }
            
      });
}
public trackByUserId(index: number, user: Reference): string {
  return user?.id;
}
public trackByUserProfileId(index: number, user: Profiles): string {
  return user?._id?.$oid;
}
}
