import { AuthService, UpdateStatusResponse, Users, UsersAuthResponse } from '@amsconnect/shared';
import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowModalStates, UpdateStatusPayloadObj, UserData, UserUpdateStatus, UsersSearchResponse, addRecipientData } from '../../../modals/users-status.model';
import { Subscription } from 'rxjs';
import { UserStatusService } from '../../../services/user-status.service';
import { UserStatusHelper } from './user-status-helper.class';
import { User } from '../../../modals/users.model';

@Component({
  selector: 'web-messenger-user-status-modal',
  templateUrl: './user-status-modal.component.html',
  styleUrls: ['./user-status-modal.component.scss'],
})
export class UserStatusModalComponent extends UserStatusHelper implements OnInit, OnDestroy, OnChanges {
  @Input() userId: string | undefined;
  @Input() userData!: User | null;
  @Input({required: true}) userFirstName: string | undefined;
  @Input({required:true}) userLastName: string | undefined;
  @Input({required:true}) userStatus!:string | undefined;
  @Output() closeOffDutyPopUp = new EventEmitter<boolean>();

  @ViewChild("currentCoverage") currentCoverage!: ElementRef;
  public authResponse!: UsersAuthResponse;
  public selectedStatus = "off";
  public searchResults: UserData[] = [];
  public selectedUsers: UserData[] = [];
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
  public customAutoResponse = "";
  public autoResponseForm!: FormGroup;
  public coverageId = '';
  public loadLatestUserResponse!: Users | null;
  public selectedUserIdDetails = '';

  constructor(
    private authService: AuthService,
    private userStatusSvc: UserStatusService,
    public fb: FormBuilder,
  ) {
    super()
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(this.userStatus){
        this.selectedStatus = this.userStatus;
      }
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
    this.getUsersUpdateStatus(status, "",this.coverageId);
  }
  
  public getAuthResponse(): void {
    this.subscription.push(this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        this.authResponse = data;
      }
    ));
    if (this.userData && this.userData?.coverage_user){
      this.selectedUsers = [this.convertUserToUserData(this.userData?.coverage_user)];
      this.coverageId = this.selectedUsers[0]._id.$oid;
    } else {
      this.selectedUsers = [];
      this.coverageId = "";
    }
    this.autoResponse =
      this.userData?.status?.away_message_mode === "disable"
        ? "Disabled"
        : this.userData?.status?.away_message_mode === "default" ||
          this.userData?.status?.away_message_mode === "custom"
        ? this.userData?.status?.away_message
        : "";
    this.customAutoResponse =
      this.userData?.status?.away_message_mode === "custom"
        ? this.userData?.status?.away_message || ""
        : "";
    this.autoResponseForm
      ?.get("autoResponse")
      ?.setValue(this.userData?.status?.away_message_mode);
      
    const awayMessageMode = this.userData?.status?.away_message_mode;
    this.showModalStates.isCustomResponseEnabled = awayMessageMode === "custom";
  }

  public getUsersUpdateStatus(status: string, away_message_mode: string,coverage_id:string): void {
      const updateObject: UpdateStatusPayloadObj = {
        status: status,
        coverage: coverage_id ? coverage_id : "",
        away_message_mode: away_message_mode ? away_message_mode : this.userData?.status?.away_message_mode ?? '',
        away_message: this.autoResponse ? this.autoResponse: "",
        user_id: this.userId ? this.userId: ""
      };
      this.userStatusSvc
        .updateUserStatus(updateObject)
        .subscribe((userStatusResponse: UpdateStatusResponse) => {
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

  public getSearchedUsersList(): void {
    const userId = this.authResponse.user._id.$oid;
    this.userStatusSvc
      .adminUserSearch(userId, this.currentCoverage.nativeElement.value)
      .subscribe((data: UsersSearchResponse) => {
        this.searchResults = data.result;
        const selectedUserIds = this.selectedUsers.map(
          (user: UserData) => user._id.$oid
        );
        this.showModalStates.showUserList = true;
        this.searchResults = this.searchResults.filter(
          (user: UserData) => !selectedUserIds.includes(user._id.$oid)
        );
        this.showModalStates.noResultsFound =
          this.searchResults.length === 0 &&
          this.currentCoverage.nativeElement.value.trim() === "";
      });
  }

  public selectUser(user: UserData): void {
    this.selectedUsers.push(user);
    this.showModalStates.showUserList = false;
    this.showModalStates.inputEditable = false;
    // Filter out the selected user from searchResults
    this.searchResults = this.searchResults.filter(
      (u: UserData) => u !== user
    );
    this.currentCoverage.nativeElement.value = "";
    this.currentCoverage.nativeElement.focus();
    this.coverageId = user._id.$oid;
    this.getUsersUpdateStatus(this.selectedStatus,user?.status?.away_message_mode,user._id.$oid);

  }

  public removeUser(user: UserData): void {
    // Remove the user from the selected users array
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    // Add the user back to the available users if needed
    this.searchUsersData.usersDataList.push(user);
    this.showModalStates.inputEditable = true;
    this.coverageId = '';
    this.getUsersUpdateStatus(this.selectedStatus,user?.status?.away_message_mode,this.coverageId);
  }

  public selectedAutoResponse(option: string): void {
    // Reset the custom response when the radio buttons are clicked
    switch (option) {
      case "default":
        this.userUpdateStatus.away_message_mode = option;
        this.showModalStates.isCustomResponseEnabled = false; // Disable the input field
        break;
      case "custom":
        this.showModalStates.isCustomResponseEnabled = true;
        this.userUpdateStatus.away_message_mode = option;
        // Enable the input field for custom response
        break;
      case "disable":
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
      this.customAutoResponse = this.autoResponse;
    } else if (currentValue !== "custom") {
      this.customAutoResponse = "";
    }
    if (currentValue === "disable") {
      this.autoResponse = "Disabled";
    }
    if(this.selectedUsers.length > 0){
      this.getUsersUpdateStatus(this.selectedStatus, currentValue,this.selectedUsers[0]._id.$oid);
    }else{
      this.getUsersUpdateStatus(this.selectedStatus, currentValue,"");
    }
    this.showModalStates.showAutoResponsePopup = false;
  }

  public enableDisablefn(propertyName: keyof ShowModalStates): void {
    this.showModalStates[propertyName] = !this.showModalStates[propertyName];
  }
  public showAutoResponseModal(): void {
    this.showModalStates.showAutoResponsePopup = true;
    this.customResponse = this.autoResponse || this.userUpdateStatus.away_message_mode;
  }
  public showCurrentServiceTeamModal(): void {
    this.showModalStates.showCurrentServiceTeam = true;
  }

  public closeOffDutyModal():void{
    this.showModalStates.showModal = false;
    this.closeOffDutyPopUp.emit(true);
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
