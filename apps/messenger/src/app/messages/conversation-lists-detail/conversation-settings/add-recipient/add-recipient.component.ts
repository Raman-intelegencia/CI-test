import {
  ProfileReference,
  Profiles,
  ProfileThreadData,
  SearchProfileRecipientData,
  ThreadProfile,
  Threads,
  UPDATE_USERS,
  Users,
  UserService,
  SelectedThreadHelperService
} from "@amsconnect/shared";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { ConversationSettingsService } from "../../../../../services/conversation-settings.service";
import { Subscription } from "rxjs";
import { ConversationSettingsHelperService } from "../../../../../services/conversation-settings-helper.service";
import { EXTERNAL, UserStatus } from "../../../../../models/add-recipient.model";
import { InboxHelperService } from "../../../../../services/inbox-helper.service";
import { AddRecipientHelperClass } from "./add-recipient-helper.class";
import { ComposeHelperService } from "../../../../../services/compose-helper.service";
import { ComposeService } from "../../../../../services/compose.service";
@Component({
  selector: "web-messenger-add-recipient",
  templateUrl: "./add-recipient.component.html",
  styleUrls: ["./add-recipient.component.scss"],
})
export class AddRecipientComponent extends AddRecipientHelperClass implements OnChanges, OnDestroy, OnInit {
  public isSearchDivOpen = true;
  @Input()
  threads!: Threads[];
  @Input() selectedChatThread: Threads | undefined;
  @Input() showAddRecipientModal = false;
  @Input() selectedThreadProfiles: Profiles[] = [];
  @Input() loggedInUserDetails!: Users | null;
  @Input() showLeaveEndConversation = {
    isUserTypeBasic: false,
    isExternalThreadInitiater: false,
    isExternal: false,
    isBroadcast: false,
  };
  @Input() matchingRecipientIdWithLoggedInUser: string[] = [];
  @Input() selectedChatThreadData!: ThreadProfile;
  public recipientData: SearchProfileRecipientData = {
    usersProfileList: [],
    selectedUsers: [],
  };
  public conversationSettingsForm: FormGroup;
  public settingsMatchingProfile: ProfileThreadData[] = [];
  public maxLength = 27;
  public storeRecipients: Profiles[] = [];
  private subscription: Subscription = new Subscription();
  private getSelectedProfileSubscription: Subscription = new Subscription();
  public journalId = 0;
  @Output() sendUpdatedRecipientToConversationList = new EventEmitter<Profiles[]>();
  public emitRemovedProfile = false;
  public imageUrlPath = "";
  public selectedUserIdDetails = "";
  public showRemoveButton = false;
  public updatedRecipients!: UPDATE_USERS;
  public isExternal = EXTERNAL;
  public UserStatus = UserStatus;
  constructor(
    private conversationSettingsHelper: ConversationSettingsHelperService,
    private conversationSettingsService: ConversationSettingsService,
    public userService: UserService,
    private inboxHelperSvc:InboxHelperService,
    private selectedThreadHelperService : SelectedThreadHelperService, composeHelperService: ComposeHelperService,composeService:ComposeService
  ) {
    super(composeHelperService,composeService);
    this.conversationSettingsForm = new FormGroup({
      addRecipient: new FormControl("", [Validators.required]),
      groupName: new FormControl("", [Validators.required]),
      showMessagingGrpMsgCheckbox: new FormControl(false),
      includeMessagingGrpText: new FormControl({
        value: false,
        disabled: true,
      }),
    });
  }
  ngOnInit(): void {
    this.inboxHelperSvc.fetchThreadsAndProfiles(false);
   
    this.showAddRecipientModal = true;
    this.subscription = this.userService.imageUrlPath$.subscribe(
      (imageUrlPath) => {
        this.imageUrlPath = imageUrlPath;
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.formStates.showErrorMessage = false;
    if (changes["showAddRecipientModal"]) {
      this.showAddRecipientModal = true;
    }
    this.getSelectedProfileSubscription = 
    this.selectedThreadHelperService.selectedThreadProfile$.subscribe((profiles) => {
      if(this.storeRecipients){
        this.storeRecipients = [];
      }
      this.storeRecipients = profiles;
      this.storeRecipients = this.selectedChatThread?.type === 'external' ? this.storeRecipients.filter((user: { _id: { $oid: string | undefined; }; })=> user?._id?.$oid !== this.loggedInUserDetails?._id.$oid) : this.storeRecipients;  
    });
    this.formStates.isSearchDivOpen = false;    
  }

  public get conversationSettingsControls(): {
    [key: string]: AbstractControl;
  } {
    return this.conversationSettingsForm.controls;
  }

  public async getProfileSearchList(): Promise<void> {
    this.formStates.isSearchDivOpen = true;
    const searchText = this.conversationSettingsControls["addRecipient"].value;
    const data: ProfileReference[] =
      await this.conversationSettingsHelper.getSearchUsersList(
        this.storeRecipients,
        searchText
      );
    if(!searchText){
      this.fullUserList = data;
    }
    this.recipientData.usersProfileList = this.getFormattedList(data);
    const uniqueIdentifiers = new Set(
      this.storeRecipients.map((item) => item._id.$oid)
    );
    this.recipientData.usersProfileList = data.filter(item => {      
      if (this.showLeaveEndConversation.isExternal) {
        return !uniqueIdentifiers.has(item.id) && item.type !== 'role' && item.type !== 'group' && item?.data?.type !== "oneway";        
    } else {
        return !uniqueIdentifiers.has(item.id) && item?.data?.type !== "oneway";
    }  
    });
  }

  public addRecipientToList(selectedUser: ProfileReference): void {    
    if(!selectedUser.matchedProfiles){
      this.userNotActivatedDescription = !selectedUser?.data?.flag_active  ? selectedUser?.data?.first_name + " " + selectedUser?.data?.last_name + " is not active" : '';
    }
    const recipient: Profiles = {
      ...selectedUser,
      _id: { $oid: selectedUser.id },
      date_last_login: { $date: 0 },
      first_name: "",
      image_id: "",
      last_name: "",
      profile: { dept: "", iid: "", iname: "", ishort: "", title: "" },
      status: { is_signed_out: false, s: "", r: undefined }
    };
    // Check if the recipient already exists in the storeRecipients array
    const recipientExists = this.storeRecipients.some(
      (profileData) => profileData._id.$oid === selectedUser?.data._id.$oid
    );
    if (!recipientExists) {
      // If the recipient doesn't exist, add it to the array
      this.storeRecipients.push(recipient);
    }
    this.formStates.recipientsChanged = true;
    this.formStates.isSearchDivOpen = false;
    this.conversationSettingsForm.controls["addRecipient"].reset();
  }

  public removeExistingUser(profile: Profiles): void {
    const removedProfile = this.storeRecipients.find(
      (profileData) => profileData._id.$oid === profile?._id?.$oid ? profile?._id?.$oid : profile?.data?._id.$oid
    );
    this.storeRecipients = this.storeRecipients.filter(
      (profileData) => profileData?._id?.$oid !== profile?._id?.$oid
    );    
    this.emitRemovedProfile = true;
    const delProfile = this.selectedChatThread?.recipients.filter(
      (recipient) => recipient.$oid !== removedProfile?._id?.$oid ? removedProfile?._id?.$oid : removedProfile?.data?._id?.$oid
    );    
    if (this.selectedChatThread) {
      this.selectedChatThread.recipients = delProfile ?? [];
    }
    this.formStates.recipientsChanged = true;
  }

  public addRecipientToConversation(): void {
    this.formStates.recipientsChanged = false;
    const groupId = this.storeRecipients.reduce((accumulator: string, group: Profiles) => {
      if (group?.data?.perms) {
        return group?.data?._id?.$oid ?? "";
      }
      return accumulator;
    },"");
    const recipientsToAdd = this.storeRecipients
      .map((profileData) =>  profileData?.data?._id || profileData?._id)
      .filter(
        (recipientId) =>{
          if (recipientId === undefined) {
            return false; // Exclude undefined values
          }
          // Ensure recipientId is a string or has a valid $oid property
          return (
            !this.selectedChatThread?.recipients.includes(recipientId) &&
            (typeof recipientId === 'string' || recipientId?.$oid !== groupId) &&
            !this.storeRecipients.some(
              (role) => role?.data?.description && role.data?._id.$oid === recipientId.$oid
            )
          );
        });
        if(this.showLeaveEndConversation.isExternal && this.loggedInUserDetails?._id){
          recipientsToAdd.push(this.loggedInUserDetails?._id);
        }
      const rolesDescriptions = this.storeRecipients.map((role: Profiles) => role?.data?.description || "");
      const role = rolesDescriptions.join("");
      // Use Set to remove duplicates and spread operator to convert back to array
    const uniqueRecipientsToAdd = [...new Set(recipientsToAdd)];
    this.selectedChatThread?.recipients.push(...uniqueRecipientsToAdd);
    this.conversationSettingsService
      .threadUpdateUsers(
        this.selectedChatThread?._id?.$oid ?? "",
        uniqueRecipientsToAdd ?? [],groupId,role
      )
      .subscribe((updatedRecipients: UPDATE_USERS) => {
        this.closeRecipientModal();
        this.updatedRecipients = updatedRecipients;
        this.sendUpdatedRecipientToConversationList.emit(updatedRecipients.profiles);
        this.formStates.showErrorMessage = false;
      });
  }

  public clearRecipientsLists(): void {
    this.conversationSettingsForm.controls["addRecipient"].reset();
    this.formStates.isSearchDivOpen = false;
    this.conversationSettingsForm?.controls["addRecipient"]?.setValue("");
  }
  public closeAddRecipientModal(): void {
    this.formStates.showErrorMessage = this.formStates.recipientsChanged ? true : false;
    this.showAddRecipientModal = false;
    this.conversationSettingsForm?.controls["addRecipient"]?.setValue("");
    this.formStates.isSearchDivOpen = false;
    this.recipientData.usersProfileList = [];
    this.formStates.recipientsChanged = false;
  }

  public closeErrorPopup(): void {  
    this.formStates.recipientsChanged = false;
    this.recipientData.usersProfileList = [];
    this.inboxHelperSvc.fetchThreadsAndProfiles(false);
    this.formStates.showErrorMessage = false;
  }

  public getImageUrl(image_id: string): string {
    return this.imageUrlPath + image_id + "_profile.png";
  }

  public openProfilePopUp(event: Event, selectedUserId: string): void {
    this.showProfileModal = true;
    this.selectedUserIdDetails = selectedUserId;
    event?.stopPropagation();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.getSelectedProfileSubscription.unsubscribe();
  }
}
