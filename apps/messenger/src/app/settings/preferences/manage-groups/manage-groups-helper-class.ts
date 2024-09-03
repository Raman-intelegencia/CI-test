import { Injectable } from "@angular/core";
import { ComposeHelperService } from "../../../../services/compose-helper.service";
import { ComposeService } from "../../../../services/compose.service";
import { groupArrayData } from "@amsconnect/shared";
@Injectable()
export class ManageGroupHelperClass {
    public formstate = {
        showDeleteModal: false,
        showErrorMessage: false,
        closeThepopUp: false,
        showManageRecipients: false,
        showManageGroup: false,
        isRename: false,
        isSaveMessagingGrpModal: false,
        isManageGroup: true,
        showMsgGrpCheckboxes: false,
        showSaveAsGrpButton: true,
        isInputFocused: false,
        isSearchDivOpen: false,
        groupNamedisabled: false,
        isMessagingGrpVisible:false
      };
      public showProfileModal = false;
    public imageUrlPath = '';
    public userNotActivatedDescription = '';

   constructor(private  composeHelperService: ComposeHelperService,private composeService:ComposeService   ){}
   

  public showUserProfile(showProfileModal: boolean): void {
    this.showProfileModal = showProfileModal;
  }
  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
    this.formstate.closeThepopUp = false;
  }
  
  public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
  this.formstate.closeThepopUp = false;
  }

  public getImageUrl(image_id: string): string {
    return this.imageUrlPath + image_id + "_profile.png";
}

public getFirstCharacters(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const firstChar = firstName ? firstName.slice(0, 1).toUpperCase() : '';
  const lastChar = lastName ? lastName.slice(0, 1).toUpperCase() : '';
  return firstChar + lastChar;
}

public closeNonActiveUserModal():void {
  this.userNotActivatedDescription = '';
}
public trackByRecipientId(index: number, recipient: any): string {
  return recipient.id; // Assuming recipient has a unique identifier property named 'id'
}
public trackByGrpId(index: number, recipient: groupArrayData): string {
  return recipient._id.$oid; // Assuming recipient has a unique identifier property named 'id'
}
}
