import { AuthService, ModalComponent, Reference, UsersAuthResponse } from "@amsconnect/shared";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { ShowModalStates } from "../../models/off-duty-modal.model";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { UserProfileModalComponent } from "../messages/user-profile-modal/user-profile-modal.component";
import { UserStatus } from "../../models/add-recipient.model";
import { ComposeHelperService } from "../../services/compose-helper.service";
import { ComposeService } from "../../services/compose.service";

@Component({
  selector: "web-messenger-off-duty-user-picker",
  templateUrl: "./offduty-user-picker.component.html",
  styleUrls: ["./offduty-user-picker.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalComponent,UserProfileModalComponent
  ],
})
export class OffDutyUserPickerComponent implements OnChanges, OnDestroy {
  @Input() selectedUsers: Reference[] | undefined = [];
  @Input() selectedUserDataWithCStatus: Reference[] | undefined = [];
  public showModalStates: ShowModalStates = {
    showCurrentServiceTeam: false,
    noResultsFound: false,
    isInputFocused: false,
    showAutoResponsePopup: true,
    isCustomResponseEnabled: false,
    showUserList: true,
    inputEditable: true,
    showModal: true,
  };
  @Input() showOffDutySection = false;
  @Output() updatedUsers = new EventEmitter<Reference[] | undefined>();
  @Output() closeOffDutySection = new EventEmitter<boolean>();
  public subscription: Subscription = new Subscription();
  @Output() updatedUsersManually = new EventEmitter<Reference[]>();
  public storeImageUrl = "";
  public targetNoCoverageInputVal = false;
  public selectedInputRecipientInputId = "";
  public userWithNoCoverageTargetVal: string | null = null;
  public radioButtonsState: { [key: string]: boolean } = {}; // Map of user.id to radio button state
  public selectedInputCoverageId = "";
  public config_profileimage_url = "";
  public addCoverageUsersToComposeInput: Reference[] = [];
  public showUseCoverage = true;
  public checkAllCoverage = false;
  public showProfileModal = false;
  public selectedUserIdDetails = '';
  public UserStatus = UserStatus;
  @Output() removeUserEvent = new EventEmitter<string[]>();
  public idToRemove = '';
  public recipientCheckboxState = false;
  public removeUsersById:string[] = [];
  public addUsersById:string[]=[];
  constructor(private authService: AuthService, private  composeHelperService: ComposeHelperService,private composeService:ComposeService
    ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.subscription = this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        this.config_profileimage_url =
          data?.config?.config_profileimage_url || "";
      }
    );
  }

  public coverageName(statusMessage: string | undefined): string | undefined {
    return statusMessage?.split("Covered by")[1];
  }

  public useCoverageForAllRecipients(): void {
    this.checkAllCoverage = !this.checkAllCoverage;
    this.showUseCoverage = false;
  }


  public resetAllToOriginalState(): void {
    this.showUseCoverage = true;
    this.checkAllCoverage = !this.checkAllCoverage;
  }
  public getInputValue(event: Event, id: string, user: Reference): void {
    const target = event.target as HTMLInputElement;
    this.selectedInputRecipientInputId = id;
    for (const userId in this.radioButtonsState) {
      this.radioButtonsState[userId] = userId === id;
    }
    this.targetNoCoverageInputVal = target.checked;
    if (target.checked) {
      if(!this.removeUsersById.includes(id)){
        this.removeUsersById.push(id);
      }
        this.removeUserById(id);
    } else {
      // User is not in the array, so add them
      this.removeUsersById = this.removeUsersById.filter(x => x !== id); // Ensure id is not in the array
      if (!this.selectedUsers?.find(user => user.id === id)) {
        this.selectedUsers = [...(this.selectedUsers || []), user];
      }
    }
  }

  public closeOffDutyModal(): void {
    this.closeOffDutySection.emit(false);
  }

  public saveChangesToComposePopup(): void {
    // Remove users marked for deletion from selectedUsers.
    this.selectedUsers = this.selectedUsers?.filter(x => !this.removeUsersById.includes(x.id));

    if (this.checkAllCoverage && !this.recipientCheckboxState) {
        // If only checkAllCoverage is true, emit all users with coverage and reset selections.
        this.updatedUsers.emit(this.selectedUserDataWithCStatus);
        this.selectedUserDataWithCStatus = [];
        this.selectedUsers = [];
    } else if (this.recipientCheckboxState && !this.checkAllCoverage) {
        // If only recipientCheckboxState is true, compile and emit IDs from selectedUsers and manually added users.
        const selectedIds = this.selectedUsers?.map(x => x.data._id.$oid) || [];
        const allSelectedIds = [...new Set([...selectedIds, ...this.addUsersById])]; // Deduplicate IDs
        this.removeUserEvent.emit(allSelectedIds);
    } else if (this.checkAllCoverage && this.recipientCheckboxState) {
        // If both flags are true, process users with and without coverage separately.

        // Collect coverage profiles from users and exclude them from filteredSelectedUsers.
        const coverageProfiles:Reference[] | undefined  = [];
        const filteredSelectedUsers = this.selectedUsers?.filter(user => {
            if (user.coverageProfile) {
                coverageProfiles?.push(user.coverageProfile);
                return false; // User has coverage, exclude from filtered list.
            }
            return true; // User doesn't have coverage, include in filtered list.
        }) || [];

        // Retain IDs from addUsersById that match any selected user or their coverage profiles.
        const retainedAddUsersById = this.addUsersById.filter(addUserId =>
            this.selectedUsers?.some(user => user.id === addUserId || user.coverageProfile?.id === addUserId)
        );

        // Merge IDs from filtered users, their coverage profiles, and retained manually added IDs, then exclude any marked for removal.
        let allSelectedIds = filteredSelectedUsers.map(user => user.data._id.$oid);
        const coverageIds = coverageProfiles.map(x => x.id) || [];
        allSelectedIds = [...new Set([...allSelectedIds, ...coverageIds, ...retainedAddUsersById])]; // Deduplicate
        allSelectedIds = allSelectedIds.filter(id => !this.removeUsersById.includes(id)); // Exclude removed IDs

        // Emit the final, processed list of IDs.
        this.removeUserEvent.emit(allSelectedIds);
    }

    // Signal to close the off-duty section.
    this.closeOffDutySection.emit(false);
  }


  public addCoverageToComposeInput(
    event: Event,
    referenceData: Reference
  ): void {
    if(!this.addUsersById.includes(referenceData.id)){
      this.addUsersById.push(referenceData.id);
    }
    const target = event.target as HTMLInputElement;
    this.selectedInputCoverageId = referenceData.data._id.$oid;
    this.targetNoCoverageInputVal = target.checked;
    if (this.checkAllCoverage) { 
      target.checked = false;
    } else {
      if (target.checked) { 
        this.removeUsersById = this.removeUsersById.filter(x => x !== referenceData.id);
        // Check if the user is not already in the selectedUsers array
        const index = this.selectedUsers?.findIndex(
          (u) => u.id === referenceData.id
          );
          
          if (index === -1) { 
            this.recipientCheckboxState = true;
            // User is not in the array, so add them
            this.addCoverageUsersToComposeInput.push(referenceData); 
          }
        } else {
          // If the checkbox is unchecked, remove the user from the array
          if(!this.removeUsersById.includes(referenceData.id)){
            this.removeUsersById.push(referenceData.id);
          }
          this.addUsersById = this.addUsersById.filter(x => x !== referenceData.id);
        this.removeUserById(referenceData.id);
      }
    }
  }
 
  public removeUserById(idToRemove: string): void {
    if(this.idToRemove){
      this.idToRemove = '';
    }
  this.idToRemove = idToRemove;
    if(this.addCoverageUsersToComposeInput.length === 0){  
      this.addCoverageUsersToComposeInput = [...this.selectedUsers || []]
    }
    this.addCoverageUsersToComposeInput = (this.addCoverageUsersToComposeInput || []).filter(
      user => user.id !== idToRemove
    ); 
    this.recipientCheckboxState = true;
  }

  public userWithNoCoverage(selectedUser: Reference): void { 
    this.removeUsersById = this.removeUsersById.filter(x => x !== selectedUser.id);
    this.userWithNoCoverageTargetVal = selectedUser.id;
    // Iterate through selectedUsers to uncheck other radio buttons
    this.selectedUsers?.forEach((user) => {
      this.radioButtonsState[user.id] = false; // Uncheck the radio button
      this.targetNoCoverageInputVal = false;
    });
    // Set the target value for noCoverage
    this.userWithNoCoverageTargetVal = selectedUser.id;
  }

  public viewProfile(reference: Reference):void{
    this.selectedUserIdDetails = reference?.data?._id?.$oid;
    this.showProfileModal = true;
  }

  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
    this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
    this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
    this.showOffDutySection = false;
 }

 public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
  this.composeService.addComposeQueryParamsForUserId( userId,messageType);
  this.showOffDutySection = false;
}

public showUserProfile(showProfileModal: boolean): void {
  this.showProfileModal = showProfileModal;
}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
