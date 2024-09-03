import { ProfileReference, Profiles, Reference, UserType } from "@amsconnect/shared";
import { ComposeService } from "../../../../../services/compose.service";
import { ComposeHelperService } from "../../../../../services/compose-helper.service";

export class AddRecipientHelperClass {
  public messageType = {
    externalMessage: "ExternalMessage",
    composeMessage: "InternalMessage",
};
    public userType = UserType;
    public fullUserList:ProfileReference[] =[];
    public showProfileModal = false;
    public formStates = {
      isInputFocused: false,
      isSearchDivOpen: true,
      archiveChats: false,
      showErrorMessage: false,
      recipientsChanged: false,
      showRecipientModal: true,
    };
    public userNotActivatedDescription = '';

constructor( private  composeHelperService: ComposeHelperService,private composeService:ComposeService){}
    public getFormattedList(allUserServiceGroupList: ProfileReference[]): ProfileReference[] {
        return allUserServiceGroupList.map(list => {
            const matchedProfiles: ProfileReference[] = [];
            if (list.type === this.userType.Role) {
                list.data.user_ids?.forEach((id: { $oid: string }) => {
                    const matchedProfile = allUserServiceGroupList.find((userId) => userId.id === id.$oid);
                    if (matchedProfile) {
                        matchedProfiles.push(matchedProfile);
                    }
                });
                list['matchedProfiles'] = matchedProfiles;
            } 
            else if (list.type === this.userType.Group) {
                list.data.recipient_ids?.forEach((id: { $oid: string }) => {
                    const matchedProfile = allUserServiceGroupList.find((userId) => userId.id === id.$oid);
                    if (matchedProfile) {
                        matchedProfiles.push(matchedProfile);
                    }
                });
                list['matchedProfiles'] = matchedProfiles;
            }
            //  Handle coverage profiles & Use the full list for matching coverage profiles
          if (list.data.status?.c) {
            const coverageProfile = this.fullUserList.find((user) => user.id === list?.data?.status?.c?.ref);
            if (coverageProfile) {
              list['coverageProfile'] = coverageProfile;
            }
          }
            return list;
        });
    }

    public formatNames(profiles: Reference[] | undefined, type: string): string {
        const names = profiles?.map((user) =>
          this.getUserNames(user.data.first_name, user.data.last_name, type)
        );
        const combinedNames = names ? names?.join(", ") : "";
        // If combined string length is greater than a limit, then truncate and add ellipsis
        const maxLength = 50;
        return combinedNames.length > maxLength
          ? combinedNames.slice(0, maxLength - 3) + "..."
          : combinedNames;
      }
    
      public getUserNames(firstName: string, lastName: string, type: string): string {
        if (type === "service") {
          return `${firstName} ${lastName.charAt(0)}`;
        } else if (type === "group") {
          return `${firstName} ${lastName}`;
        }
        return "";
      }

      public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType: string = this.messageType.composeMessage): void {
        this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
        this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
        this.closeRecipientModal();
     }
    
     public addComposeQueryParamsForUserId(userId: string,messageType: string = this.messageType.composeMessage): void {
      this.composeService.addComposeQueryParamsForUserId( userId,messageType);
      this.closeRecipientModal();
    }

    public closeRecipientModal(): void {
      this.formStates.showErrorMessage = false;
      this.formStates.recipientsChanged = false;
      const checkbox = document.getElementById(
        "add-recipient-modal"
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
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
    public trackByStoreRecipientId(index: number, recipient: Profiles): string {
      return recipient._id.$oid; // Assuming recipient has a unique identifier property named 'id'
    }

    
}