import {
  CreateGroupResponse,
  CREATE_GROUP_REFERENCE,
  getGroupList,
  Group,
  Reference,
  Profiles,
  groupArrayData,
  Threads,
  Users,
  ProfileReference,
  SettingsService,
} from "@amsconnect/shared";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ComposeHelperService } from "../../../../../services/compose-helper.service";
import { ComposeService } from "../../../../..//services/compose.service";
import { ConversationSettingsService } from "../../../../../services/conversation-settings.service";

export class SaveAsMsgGrpClass {
  public formStates = {
    isInputFocused: false,
    isPatientInputFocused: false,
    showSaveAsGrpButton: true,
    showMessagingGrpMsgCheckbox: false,
    messagingGrpCheckBoxVal: false,
    showErrorMessage: false,
    isSearchDivOpen: true,
    archiveChats: false,
    showDeleteModal: false,
    showWarningModalToSaveChangesToRecipients: false,
    showMsgGrpCheckboxes: false,
    showSaveAsMsgGrpModal: true,
  };
  public messageType = {
    externalMessage: "ExternalMessage",
    composeMessage: "InternalMessage",
};
  public filteredGroupResponseData: groupArrayData[] = [];
  public checkIfUserCreatedGroup = true;

  public conversationSettingsForm: FormGroup;
  public displayErrorMessage = "";
  public storeCreateGroupReponse!: CreateGroupResponse;
  public storeCreateRecipientGroupReponse: CREATE_GROUP_REFERENCE[] = [];
  public storeRecipients: Threads | undefined;
  public imageUrlPath = "";
  public userId = "";
  public showProfileModal = false;
  public selectedUserIdDetails = "";
  public userIndex = "";
  public selectedThreadProfiles: Profiles[] | Reference[] = [];
  public loggedInUserDetails!: Users | null;
  public userNotActivatedDescription = '';

  constructor(
    public conversationSettingsService: ConversationSettingsService,
    public settingSvc: SettingsService,
    public router: Router,private  composeHelperService: ComposeHelperService,private composeService:ComposeService
  ) {
    this.conversationSettingsForm = new FormGroup({
      addRecipient: new FormControl("", [Validators.required]),
      groupName: new FormControl("", [Validators.required]),
      showMessagingGrpMsgCheckbox: new FormControl(false),
      messagingGrpCheckBoxVal: new FormControl({
        value: false,
        disabled: true,
      }),
    });
  }

  public get groupName(): AbstractControl {
    return this.conversationSettingsForm.controls["groupName"];
  }

  public get conversationSettingsControls(): {
    [key: string]: AbstractControl;
  } {
    return this.conversationSettingsForm.controls;
  }
  public saveAsGroup(): void {
    this.formStates.isSearchDivOpen = false;
    this.formStates.showMsgGrpCheckboxes = this.formStates.showErrorMessage
      ? false
      : true;
    let formData = new URLSearchParams();
    const recipientIds = this.storeRecipients?.recipients.map(
      (id) => id.$oid
    );
    recipientIds?.forEach((formattedId) => {
      if (formattedId !== this.loggedInUserDetails?._id.$oid) {
        formData.append(`recipient_ids`, formattedId);
      }
    });
    formData.append("name", this.groupName.value as string);
    this.conversationSettingsService
      .groupCreate(formData)
      .subscribe((createGroupResponse: CreateGroupResponse) => {
        this.displayErrorMessage =
          createGroupResponse.status === "invalid" || createGroupResponse.error
            ? createGroupResponse.message || ""
            : "";
        this.formStates.showSaveAsGrpButton = this.displayErrorMessage
          ? true
          : false;
        if (!this.displayErrorMessage) {
          this.conversationSettingsControls["groupName"]?.disable();
        }
        this.storeCreateRecipientGroupReponse = createGroupResponse?.group
          ?.recipients
          ? createGroupResponse?.group?.recipients
          : [];
        this.storeCreateGroupReponse = createGroupResponse;
        this.formStates.showMsgGrpCheckboxes = true;
      });
  }

  public getImageUrl(image_id: string): string {
    return this.imageUrlPath + image_id + "_profile.png";
  }

  public openProfilePopUp(event: Event, selectedUserId: string): void {
    this.showProfileModal = true;
    this.selectedUserIdDetails = selectedUserId;
    event?.stopPropagation();
  }

  public extractGroupData(groupAndProfileData: Reference): void {
    if (!groupAndProfileData) {
      console.error("No data");
      return;
    }
    this.storeCreateRecipientGroupReponse = [];
    this.formStates.showMsgGrpCheckboxes = true;
    this.formStates.showSaveAsMsgGrpModal = true;
    this.formStates.showSaveAsGrpButton = false;
    const groupData = groupAndProfileData;
    const profileData = groupAndProfileData?.matchedProfiles;
    this.conversationSettingsForm.patchValue({
      groupName: groupData.data.name,
    });
    this.conversationSettingsForm.get("groupName")?.disable();
    profileData?.forEach((data: Reference) => {
      if(data.coverageProfile){
        data.data.coverageProfile = data.coverageProfile
      }
      this.storeCreateRecipientGroupReponse.push(data.data);
    });
    this.getGroupList(groupAndProfileData);
  }

  public getGroupList(selectedGroupProfile: Reference): void {
    this.checkIfUserCreatedGroup = false;
    this.settingSvc.getGroupList().subscribe((groupData: getGroupList) => {
      const groups = groupData.groups;
      this.filteredGroupResponseData = groups.filter(
        (group) => group._id.$oid == selectedGroupProfile?.id
      );
      this.checkIfUserCreatedGroup =
        this.filteredGroupResponseData[0].user_id.$oid === this.userId;
    });
  }

  public getGroupData(): Group | groupArrayData {
    let group = {} as Group | groupArrayData;
    if (this.storeCreateGroupReponse?.group) {
      group = this.storeCreateGroupReponse?.group;
    } else {
      group = this.filteredGroupResponseData[0];
    }
    return group;
  }

  public getProfileData(
    selectedGroupProfile: Reference
  ): Profiles[] | Reference[] {
    let profileData: Profiles[] | Reference[] = [];
    if (selectedGroupProfile && selectedGroupProfile.matchedProfiles) {
      profileData = selectedGroupProfile?.matchedProfiles;
    } else {
      profileData = this.selectedThreadProfiles;
    }
    return profileData;
  }

  public deleteConversationListsGroup(): void {
    this.conversationSettingsService
      .groupDelete(this.storeCreateGroupReponse?.group?._id?.$oid)
      .subscribe((deleteReponse) => {
        if (deleteReponse.status === "ok") {
          this.formStates.showDeleteModal = false;
          this.conversationSettingsService
            .groupList()
            .subscribe(()=>
              this.userIndex
                ? this.router.navigateByUrl(
                    `/u/${this.userIndex}/settings/preferences`
                  )
                : null
            );
        }
      });
  }

  public closeErrorPopup(): void {
    this.formStates.showErrorMessage = false;
    this.formStates.showMsgGrpCheckboxes = false;
    this.displayErrorMessage = "";
  }

  public handleCoverageProfiles(usersProfileList: ProfileReference[], fullUserList:ProfileReference[]): ProfileReference[] {
    return usersProfileList.map(list => {
      //  Handle coverage profiles & Use the full list for matching coverage profiles
      if (list.data.status?.c) {
        const coverageProfile = fullUserList.find((user) => user.id === list?.data?.status?.c?.ref);
        if (coverageProfile) {
          list['coverageProfile'] = coverageProfile;
        }
      }
      return list;
    });
  }

  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType: string = this.messageType.composeMessage): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
    this.formStates.showSaveAsMsgGrpModal = false;
 }

 public addComposeQueryParamsForUserId(userId: string,messageType: string = this.messageType.composeMessage): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
  this.formStates.showSaveAsMsgGrpModal = false;
}

public showUserProfile(showProfileModal: boolean): void {
  this.showProfileModal = showProfileModal;
}

public closeNonActiveUserModal():void {
  this.userNotActivatedDescription = '';
}
public trackByRecipientId(index: number, recipient: ProfileReference): string {
  return recipient.id; // Assuming recipient has a unique identifier property named 'id'
}
public trackByRecipientGrpId(index: number, recipient: CREATE_GROUP_REFERENCE): string {
  return recipient?._id?.$oid; // Assuming recipient has a unique identifier property named 'id'
}
}
