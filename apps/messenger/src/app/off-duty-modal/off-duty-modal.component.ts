import {AuthService, ServiceTeamsService, UpdateStatusResponse, Users, UsersAuthResponse,SelectedThreadHelperService} from "@amsconnect/shared";
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Shift } from "../../models/profile.model";
import { Subscription } from "rxjs";
import {
  addRecipientData,
  ProfileSearchResult,
  Reference,
  ShowModalStates,
  UserUpdateStatus,
} from "../../models/off-duty-modal.model";
import { ProfileStatusDropdownService } from "../../services/profile-status-dropdown.service";
import {
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { InboxHelperService } from "../../services/inbox-helper.service";
import { UsersListingService } from "@amsconnect/shared";
import { PopupStateService } from "../../services/off-duty-model.service";
import { ComposeHelperService } from "../../services/compose-helper.service";
import { ComposeService } from "../../services/compose.service";
import { ProfileStatusHelperService } from "../../services/profile-status-helper.service";

const STATUS_OPTIONS: {
  value: string;
  class: string;
  label: string;
  icon: string;
}[] = [
  {
    value: "available",
    class: "text-green-500",
    label: "available",
    icon: "check-circle",
  },
  {
    value: "busy",
    class: "text-neutral",
    label: "busy",
    icon: "prohibit",
  },
  {
    value: "off",
    class: "text-gray-600",
    label: "offDuty",
    icon: "minus-circle",
  },
];
@Component({
  selector: "web-messenger-off-duty-modal",
  templateUrl: "./off-duty-modal.component.html",
  styleUrls: ["./off-duty-modal.component.scss"],
})
export class OffDutyModalComponent implements OnInit, OnDestroy {
  @ViewChild("currentCoverage") currentCoverage!: ElementRef;
  public authResponse!: UsersAuthResponse;
  public selectedStatus = "off";
  public searchResults: Reference[] = [];
  public selectedUsers: Reference[] = [];
  public autoResponse: string | undefined;
  public customResponse = "";
  public searchUsersData: addRecipientData = {
    usersDataList: [],
    selectedUsers: [],
  };
  public maxLength = 27;
  public showServices: string[] = [];
  public subscription: Subscription[] = [];
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
  public userUpdateStatus: UserUpdateStatus = {
    status: "",
    away_message_mode: "",
    role: [],
    coverage: "",
    scheduler_type: "",
    removed_manual_role: "",
    away_message: "",
  };
  public showProfileModal = false;
  public statusOptions = STATUS_OPTIONS;
  public customAutoResponse = "";
  public autoResponseForm!: FormGroup;
  public coverageId = '';
  public loadLatestUserResponse!: Users | null;
  public selectedUserIdDetails = '';
  public imageUrl = ""
  public showOffDutyModal = false; 
  constructor(
    private authService: AuthService,
    private profileStatusDropdown: ProfileStatusDropdownService,
    private serviceTeamsService: ServiceTeamsService,
    private inboxHelperSvc: InboxHelperService,
    public fb: FormBuilder,
    private usersListingSvc: UsersListingService,
    private selectedThreadHelperService:SelectedThreadHelperService,private popupStateService: PopupStateService,
    private  composeHelperService: ComposeHelperService,private composeService:ComposeService,
    private profileStatusHelperService : ProfileStatusHelperService
  ) {
    this.selectedThreadHelperService.showOffDutyModal$.subscribe(offDutyModal=> {
      this.showOffDutyModal = offDutyModal;
    })
  }

  ngOnInit(): void {
    this.autoResponseForm = this.fb.group({
      autoResponse: ["default", [Validators.required]],
    });
    this.getAuthResponse();
  }

  public isSelectedUserStatus(status: string): boolean {
    return this.selectedStatus === status;
  }

  public setSelectedStatus(status: string): void {
    this.selectedStatus = status;
    this.getUsersUpdateStatus(status, "",'');
  }
  public getAuthResponse(): void {
    this.subscription.push(this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        this.authResponse = data;
        this.imageUrl = data?.config?.config_profileimage_url || ""
      }
    ));
    this.showServices = this.authResponse?.user?.status?.r;
    this.selectedStatus = this.authResponse?.user?.status?.s;
    this.selectedUsers = this.authResponse?.references || [];
    this.autoResponse =
      this.authResponse?.user?.status?.away_message_mode === "disable"
        ? "Disabled"
        : this.authResponse?.user?.status?.away_message_mode === "default" ||
          this.authResponse?.user?.status?.away_message_mode === "custom"
        ? this.authResponse?.user?.status?.away_message
        : "";
    this.customAutoResponse =
      this.authResponse?.user?.status?.away_message_mode === "custom"
        ? this.authResponse?.user?.status?.away_message || ""
        : "";
    this.autoResponseForm
      ?.get("autoResponse")
      ?.setValue(this.authResponse?.user?.status?.away_message_mode);
    const awayMessageMode = this.authResponse?.user?.status?.away_message_mode;
    this.showModalStates.isCustomResponseEnabled = awayMessageMode === "custom";
  }

  public getUsersUpdateStatus(status: string, away_message_mode: string,coverage_id:string): void {
          this.subscription.push(
            this.inboxHelperSvc.user$.subscribe((currentUser) => {
              this.loadLatestUserResponse = currentUser;
            })
          );
          this.subscription.push(this.serviceTeamsService.shiftsData$.subscribe(
            (shifts: Shift[]) => {
              this.userUpdateStatus.scheduler_type =
                shifts.length > 0 ? shifts[0].scheduler_type : "";
            }
          ));
      const updateObject: UserUpdateStatus = {
        status: status,
        role: this.loadLatestUserResponse?.status?.r ?? [],
        coverage: coverage_id,
        away_message: this.autoResponse,
        away_message_mode: away_message_mode ? away_message_mode : this.loadLatestUserResponse?.status?.away_message_mode ?? '',
        scheduler_type: this.userUpdateStatus.scheduler_type,
        removed_manual_role: this.userUpdateStatus.removed_manual_role,
      };
      this.profileStatusDropdown
        .usersUpdateStatus(updateObject)
        .subscribe((userStatusResponse: UpdateStatusResponse) => {
          this.selectedStatus = userStatusResponse?.user?.status.s ?? '';
          this.coverageId =  userStatusResponse.user.status.c?.ref ?? '';
          this.coverageId = this.selectedStatus === 'available' ? '' : userStatusResponse.user.status.c?.ref ?? '';
          if (this.selectedStatus === 'available') {
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
        });
  }

  public removeUser(user: Reference): void {
    // Remove the user from the selected users array
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    // Add the user back to the available users if needed
    this.searchUsersData.usersDataList.push(user);
    this.showModalStates.inputEditable = true;
    this.coverageId = '';
    this.getUsersUpdateStatus(this.selectedStatus,user?.data?.status?.away_message_mode,this.coverageId);
  }

  public getSearchedUsersList(): void {
    this.profileStatusDropdown
      .searchUsers(this.currentCoverage.nativeElement.value)
      .subscribe((data: ProfileSearchResult) => {
        this.searchResults = data.references;
        const selectedUserIds = this.selectedUsers.map(
          (user: Reference) => user.id
        );
        this.showModalStates.showUserList = true;
        this.searchResults = this.searchResults.filter(
          (user: Reference) => !selectedUserIds.includes(user.id)
        );
        this.showModalStates.noResultsFound =
          this.searchResults.length === 0 &&
          this.currentCoverage.nativeElement.value.trim() === "";
      });
  }

  public selectUser(user: Reference): void {
    this.selectedUsers.push(user);
    this.profileStatusHelperService.setSelectedCoverageProfile(user);
    this.showModalStates.showUserList = false;
    this.showModalStates.inputEditable = false;
    // Filter out the selected user from searchResults
    this.searchResults = this.searchResults.filter(
      (u: Reference) => u !== user
    );
    this.currentCoverage.nativeElement.value = "";
    this.currentCoverage.nativeElement.focus();
    this.coverageId = user.data._id.$oid;
    this.getUsersUpdateStatus(this.selectedStatus,user?.data?.status?.away_message_mode,user.data._id.$oid);
  }

  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
    this.showOffDutyModal = false;
 }

 public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
  this.showOffDutyModal = false;
}

public showUserProfile(showProfileModal: boolean): void {
  this.showProfileModal = showProfileModal;
}
  public selectedAutoResponse(option: string): void {
    // Reset the custom response when the radio buttons are clicked
    switch (option) {
      case "default":
        this.customAutoResponse = '';
        this.userUpdateStatus.away_message_mode = option;
        this.showModalStates.isCustomResponseEnabled = false; // Disable the input field
        break;
      case "custom":
        this.customAutoResponse = '';
        this.showModalStates.isCustomResponseEnabled = true;
        this.userUpdateStatus.away_message_mode = option;
        // Enable the input field for custom response
        break;
      case "disable":
        this.customAutoResponse = '';
        // Logic for disabling the auto response
        this.userUpdateStatus.away_message_mode = option;
        this.showModalStates.isCustomResponseEnabled = false; // Disable the input field
        break;
      default:
        break;
    }
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
    this.getUsersUpdateStatus(this.selectedStatus, currentValue,this.coverageId);
    this.showModalStates.showAutoResponsePopup = false;
  }

  public enableDisablefn(propertyName: keyof ShowModalStates): void {
    this.showModalStates[propertyName] = !this.showModalStates[propertyName];
    if(propertyName === 'showModal'){
      this.showOffDutyModal = false; 
      this.popupStateService.setPopupShown();
    }
  }
  public showAutoResponseModal(): void {
    this.showModalStates.showAutoResponsePopup = true;
    this.customAutoResponse = this.autoResponse || (this.userUpdateStatus.away_message ?? '');
  }
  public showCurrentServiceTeamModal(): void {
    this.showModalStates.showCurrentServiceTeam = true;
  }

  public closeOffDutyModal():void{
    this.showOffDutyModal = false; 
    this.popupStateService.setPopupShown();
  }

  public openUserProfile(user_id:string):void{
    this.selectedUserIdDetails = user_id;
    this.showProfileModal = true;
  }

  public getImageUrl(image_id: string): string {
    return  this.usersListingSvc.getImageUrl(this.imageUrl, image_id);
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
