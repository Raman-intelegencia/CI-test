import { Profiles, SettingsLabelStates, Threads } from "@amsconnect/shared";
import { ChangeDetectorRef } from "@angular/core";
import { ComposeHelperService } from "../../../../services/compose-helper.service";
import { ComposeService } from "../../../../services/compose.service";

export class ConversationSettingsHelperClass  {
   public showProfileModal = false;
   public selectedUserId = '';
   public imageUrlPath = '';
   public settingsLabelStates: SettingsLabelStates = {
    pagerThreads: false,
    peerToPeerThreads: false,
    externalThreads: false,
    broadcastThreads: false,
    showLeavePopup: false,
    isAddRecipientPopup: false,
    archiveChats: false,
    isSaveMessagingGrpModal: false,
    showRecipient: false,
    showConversationSettingsMenuBar: false,
    showEndConversation: false,
  };
  public showLeaveEndConversation = {
    isUserTypeBasic: false,
    isExternalThreadInitiater: false,
    isExternal: false,
    isBroadcast: false,
  };
  public showErrorMessage: string | undefined;
  public selectedChatThread: Threads | undefined;
  public selectedThreadProfiles: Profiles[] = [];
  public matchingRecipientIdWithLoggedInUser: string[] = [];
  public isShowArchivedChats = false;
  public userIndex= "";
  public userIsInThread = false;
    constructor(public composeHelperService: ComposeHelperService, public composeService:ComposeService, public cd: ChangeDetectorRef,
        ) {
    }


  public closeErrorPopup(): void {
    this.showErrorMessage = "";
  }

  public showRecipientModal(): void {
    this.settingsLabelStates.showRecipient = true;
  }

  public openProfilePopUp(event: Event, selectedUserId: string): void {
    this.showProfileModal = true;
    this.selectedUserId = selectedUserId;
  }

  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
    this.settingsLabelStates.showRecipient = false;
 }

 public addComposeQueryParamsForUserId(userId: string,messageType = "InternalMessage"): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
  this.settingsLabelStates.showRecipient = false;
}

  public getImageUrl(image_id: string): string {
    return this.imageUrlPath + image_id + "_profile.png";
  }

  public showUserProfile(showProfileModal: boolean): void {
    this.showProfileModal = showProfileModal;      
  }

  public showLeaveConversationPopup(): boolean {
    return (this.settingsLabelStates.showLeavePopup = true);
  }
  public showEndConversationPopup(): boolean {
    return (this.settingsLabelStates.showEndConversation = true);
  }

  public closePopup(): void {
    this.settingsLabelStates.showLeavePopup = false;
    this.settingsLabelStates.showEndConversation = false;
  }

  public openSaveAsMessagingGrpModal(event: boolean): void {
    this.settingsLabelStates.isSaveMessagingGrpModal = this.settingsLabelStates
      .isSaveMessagingGrpModal
      ? event
      : true;
    this.cd.detectChanges(); // Trigger change detection
  }
}
