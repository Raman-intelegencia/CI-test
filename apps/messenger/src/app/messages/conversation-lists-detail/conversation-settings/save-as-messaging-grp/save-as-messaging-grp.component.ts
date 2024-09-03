import {
  AuthUser,CreateGroupResponse,CREATE_GROUP_REFERENCE, Group, ProfileReference,SearchProfileRecipientData,UserService, FormatServiceTeamPipe,Profiles, Reference, groupArrayData, ModalComponent, Threads, Users, SettingsService} from "@amsconnect/shared";
import { Component,Input,OnDestroy,OnChanges,SimpleChanges, Output, EventEmitter} from "@angular/core";
import {AbstractControl,FormControl,FormGroup,FormsModule,ReactiveFormsModule,Validators,
} from "@angular/forms";
import { ConversationSettingsHelperService } from "../../../../../services/conversation-settings-helper.service";
import { Subscription, SubscriptionLike, combineLatest, take, filter } from "rxjs";
import { ConversationSettingsService } from "../../../../../services/conversation-settings.service";
import { Router } from "@angular/router";
import { SaveAsMsgGrpClass } from "./save-as-messaging-grp.class";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { UserProfileModalComponent } from "../../../user-profile-modal/user-profile-modal.component";
import { ComposeHelperService } from "../../../../../services/compose-helper.service";
import { ComposeService } from "../../../../..//services/compose.service";
@Component({
  selector: "web-messenger-save-as-messaging-grp",
  templateUrl: "./save-as-messaging-grp.component.html",
  styleUrls: ["./save-as-messaging-grp.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, UserProfileModalComponent, ModalComponent, FormatServiceTeamPipe]
})
export class SaveAsMessagingGrpComponent extends SaveAsMsgGrpClass
  implements OnDestroy, OnChanges
{
  @Input() selectedChatThread: Threads | undefined;
  @Input() selectedGroupProfile!:Reference;
  @Input() override selectedThreadProfiles:  Profiles[] = [];
  @Input()  override loggedInUserDetails!: Users | null;
  public usersAuthResponse!: AuthUser;
  public recipientData: SearchProfileRecipientData = {
    usersProfileList: [],
    selectedUsers: [],
  };
  public updateButtonText = "Close";
  public maxLength = 27;
  public journalId = 0;
  @Output() showSaveAsMsgGrpModal = new EventEmitter<boolean>();
 public showMessagingGrpMsgCheckboxSubscription: Subscription | undefined;
 public messagingGrpCheckBoxValCheckboxSubscription: Subscription | undefined;
 private subscriptions: SubscriptionLike[] = [];
 private isMessagingGrpVisible = false;
 private fullUserList: ProfileReference[] = [];
  constructor(
     conversationSettingsService: ConversationSettingsService,private userService: UserService,
    private conversationSettingsHelper: ConversationSettingsHelperService, router:Router,  settingSvc :SettingsService,
    composeHelperService: ComposeHelperService, composeService:ComposeService) {
      super(conversationSettingsService, settingSvc,router,composeHelperService,composeService)
    this.conversationSettingsForm = new FormGroup({
      addRecipient: new FormControl("", [Validators.required]),
      groupName: new FormControl("", [Validators.required]),
      showMessagingGrpMsgCheckbox: new FormControl({value : false,disabled:false}),
      messagingGrpCheckBoxVal: new FormControl({
        value: false,
        disabled: true,
      }),
    });
    this.userService.userIndex$.subscribe((userIndex:string)=>{
      userIndex ? this.userIndex =  userIndex: null;
    })
  }
  public get addRecipient(): AbstractControl {
    return this.conversationSettingsForm.controls["addRecipient"];
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    this.formStates.isSearchDivOpen = false;
    this.storeRecipients = this.selectedChatThread;
    if(this.selectedGroupProfile){
      this.extractGroupData(this.selectedGroupProfile)
    }
    this.subscriptions.push((
      combineLatest([
        this.userService.imageUrlPath$,
        this.userService.userId$
      ]).subscribe(([imageUrlPath, userId]) => {
        this.imageUrlPath = imageUrlPath;
        this.userId = userId;
      })));
  }

  public getshowMessagingGrpMsgCheckboxValue(checkboxEvent: string): void {
      let formData = new URLSearchParams();
    let group = {} as Group | groupArrayData;
    group = this.getGroupData();
    const user_id = group?.user_id?.$oid || '';
    const recipientIds = checkboxEvent === "messagingGrpCheckBoxVal"
    ? [user_id, ...(group.recipient_ids ?? []).map(id => id.$oid)]
    : (group.recipient_ids ?? []).map(id => id.$oid).filter(id => id !== user_id);
    recipientIds.forEach(formattedId => formData.append("recipient_ids",formattedId? formattedId : ''));
    formData.append("id", group?._id?.$oid ? group?._id?.$oid : '');
    formData.append("name", this.groupName.value as string);
    const showMessagingGrpMsgCheckbox = this.conversationSettingsForm.get("showMessagingGrpMsgCheckbox");
    const messagingGrpCheckBoxValControl = this.conversationSettingsForm.get("messagingGrpCheckBoxVal");
    if (this.showMessagingGrpMsgCheckboxSubscription) {
      this.subscriptions.push(this.showMessagingGrpMsgCheckboxSubscription);
    }
    if (this.messagingGrpCheckBoxValCheckboxSubscription) {
      this.subscriptions.push(this.messagingGrpCheckBoxValCheckboxSubscription);
    }
    this.showMessagingGrpMsgCheckboxSubscription = showMessagingGrpMsgCheckbox?.valueChanges.pipe(
      take(1),filter(value => value === true) // Add a filter to ensure it only reacts when the checkbox is checked
    ).subscribe(value => {
      if (value) {
        formData.append("group_readable", "true");
        this.isMessagingGrpVisible = true;
        this.conversationSettingsService.groupUpdate(formData).subscribe((groupUpdateResponse: CreateGroupResponse) => {
          this.updateButtonText = "Save";
        });
        messagingGrpCheckBoxValControl?.enable();
      } else {
        this.isMessagingGrpVisible = false;
        formData.append("group_readable", "false");
        this.conversationSettingsService.groupUpdate(formData).subscribe((groupUpdateResponse: CreateGroupResponse) => {
          this.updateButtonText = "Save";
          messagingGrpCheckBoxValControl?.disable();
          messagingGrpCheckBoxValControl?.setValue(false);
        });
      }
    }); 
    if (checkboxEvent === "messagingGrpCheckBoxVal") {
   this.getMessagingGrpCheckboxVal(group,user_id,messagingGrpCheckBoxValControl,checkboxEvent);
  }
  }
  
  public getMessagingGrpCheckboxVal(group: Group | groupArrayData,user_id: (string | { $oid: string; }),messagingGrpCheckBoxValControl?: AbstractControl<any, any> | null,checkboxEvent?: string):void{
    this.messagingGrpCheckBoxValCheckboxSubscription = messagingGrpCheckBoxValControl?.valueChanges.pipe(
      take(1)).subscribe(value => {
    if (value) {
      const recipientIds = [
        user_id,
        ...(group?.recipient_ids?.map(id => (typeof id === 'string' ? id : id?.$oid)) ?? [])
      ].filter(id => typeof id === 'string' || (id && '$oid' in id));
      const formData = this.createFormData(recipientIds);
    this.conversationSettingsService.groupUpdate(formData).subscribe((groupUpdateResponse: CreateGroupResponse) => {
      if (groupUpdateResponse && groupUpdateResponse.group && groupUpdateResponse.group.user) {
        this.storeCreateRecipientGroupReponse?.push(groupUpdateResponse.group.user);
      }
        });
      } else {
        const recipientIds = group?.recipient_ids?.map(id => id.$oid).filter(id => id !== user_id);
        const formDataForAPI = this.createFormData(recipientIds);
        this.conversationSettingsService.groupUpdate(formDataForAPI).subscribe((groupUpdateResponse: CreateGroupResponse) => {
          this.storeCreateRecipientGroupReponse =groupUpdateResponse.group?.recipients? groupUpdateResponse.group?.recipients : [];
        });
      }
    }); 
  }
 
  public async getSearchedUsersList(): Promise<void> {
    this.formStates.isSearchDivOpen = true;
    const searchText = this.conversationSettingsControls["addRecipient"].value;
    let profileData:Profiles[] | Reference[] =[];
    profileData = this.getProfileData(this.selectedGroupProfile);
    const data: ProfileReference[] = await this.conversationSettingsHelper.getSearchUsersList(profileData,searchText);
    const uniqueIdentifiers = new Set(this.storeCreateRecipientGroupReponse.map(item => item._id.$oid));
    // Filter out items that are not in storeCreateRecipientGroupReponse and meet the additional condition
    this.recipientData.usersProfileList = data.filter(item => {
      return !uniqueIdentifiers.has(item.id) && item.type !== 'role' && item.type !== 'group' && item?.data?.type !== "oneway";
    });
    this.fullUserList = searchText === "" ? this.recipientData.usersProfileList : this.fullUserList;
    this.recipientData.usersProfileList = this.handleCoverageProfiles(this.recipientData.usersProfileList, this.fullUserList);
  }

  public deleteGroup(): void {
    this.formStates.showDeleteModal = true;
  }

  public addRecipientToList(selectedUser: ProfileReference): void {
    if(!selectedUser.matchedProfiles){
      this.userNotActivatedDescription = !selectedUser?.data?.flag_active  ? selectedUser?.data?.first_name + " " + selectedUser?.data?.last_name + " is not active" : '';
    }
    const selectedUserId = selectedUser?.data?._id?.$oid;
    let profileData:Profiles[] | Reference[] =[];
    profileData = this.getProfileData(this.selectedGroupProfile);
    if (profileData.some((profileData:Profiles | Reference) => profileData?.id === selectedUserId)) {
      return;
    }
    let group = {} as Group | groupArrayData;
    group = this.getGroupData();
    const recipientIds = group?.recipient_ids?.map(id => id.$oid);
    recipientIds?.push(selectedUserId);
    const formData = this.createFormData(recipientIds);
    this.conversationSettingsService.groupUpdate(formData).subscribe((groupUpdateResponse: CreateGroupResponse) => {
      if (!profileData.some((profileData:Profiles | Reference) => profileData.id === selectedUserId)) {
        this.storeCreateRecipientGroupReponse = groupUpdateResponse.group?.recipients ? groupUpdateResponse.group?.recipients : [];
              }      
      this.updateButtonText = "Save";
      this.formStates.isSearchDivOpen = false;
      this.addRecipient.reset();
    });
  }
  
  public removeExistingUser(profile: CREATE_GROUP_REFERENCE): void {
    const delProfileId = profile?._id.$oid;
    const filteredRecipients = this.storeCreateRecipientGroupReponse.filter(recipient => recipient._id.$oid !== delProfileId);
    const recipientIds = filteredRecipients.map(recipient => recipient._id.$oid);
    const formData = this.createFormData(recipientIds);
    if(recipientIds.length>=1){
    this.conversationSettingsService.groupUpdate(formData).subscribe((groupUpdateResponse: CreateGroupResponse) => {
      this.updateButtonText = "Save";
      this.formStates.isSearchDivOpen = false;
      this.addRecipient.reset();
      this.storeCreateRecipientGroupReponse = filteredRecipients;
      if(groupUpdateResponse?.group?.user_id?.$oid === delProfileId){
        this.conversationSettingsForm.controls['messagingGrpCheckBoxVal'].setValue(false);
      }
    });
  }
  else{
    this.formStates.showDeleteModal = true;
  }
  }

  private createFormData(recipientIds?: (string | { $oid: string })[]): URLSearchParams {
    let formData = new URLSearchParams();
    let group = {} as Group | groupArrayData;
    group = this.getGroupData();
    const groupId = group?._id?.$oid || group?.id || "";
    formData.append("id", groupId);   
    formData.append("name", this.groupName.value as string);
    formData.append("group_readable", this.isMessagingGrpVisible || this.conversationSettingsForm.get("showMessagingGrpMsgCheckbox")?.value === "true" ? "true" : "false");  
    // Create a Set to store unique recipient IDs
    const uniqueRecipientIds = new Set<string>();
    // Process recipientIds
    recipientIds?.forEach(id => {
      switch (typeof id) {
        case 'string':
          uniqueRecipientIds.add(id);
          break;
        case 'object':
          if ('$oid' in id) {
            uniqueRecipientIds.add(id.$oid);
          }
          break;
        default:
          break;
      }
    });
    // Convert the Set back to an array for appending to FormData
    const allRecipientIds = Array.from(uniqueRecipientIds);
    allRecipientIds.forEach(formattedId => {
      formData.append("recipient_ids", formattedId);
    });
    // Set the updated recipient_ids in the group object
    group.recipient_ids = allRecipientIds.map(id => (typeof id === "string" ? { $oid: id } : id));
    return formData;
  }  
  
  public closeSaveAsMessagingGrpModal(): void {
    this.updateButtonText = "Close";
    this.formStates.showErrorMessage =
    this.conversationSettingsControls["addRecipient"].value || this.groupName.value ? true: false;
      if(this.formStates.showErrorMessage){
        this.formStates.showSaveAsMsgGrpModal = false;
        this.showSaveAsMsgGrpModal.emit(false);
        this.formStates.showSaveAsGrpButton = true;
        this.formStates.showMsgGrpCheckboxes = false;
        this.storeCreateGroupReponse = {} as CreateGroupResponse;
        this.conversationSettingsControls["groupName"]?.enable();
        this.conversationSettingsForm.reset(); // This will reset all form controls to their initial values
      }
    else{
      this.formStates.showSaveAsMsgGrpModal = false;
      this.showSaveAsMsgGrpModal.emit(false);
    }
    this.formStates.isSearchDivOpen = false;
  }

  public updatedMessagingGrp(): void {
      this.conversationSettingsService.groupList().subscribe((groupListResponse) => {    
            this.formStates.showSaveAsMsgGrpModal = false;
            this.showSaveAsMsgGrpModal.emit(false);
            this.formStates.showSaveAsGrpButton = true;
            this.formStates.showMsgGrpCheckboxes = false;
            this.storeCreateGroupReponse = {} as CreateGroupResponse;
            this.conversationSettingsControls["groupName"]?.enable();
            this.conversationSettingsForm.reset(); // This will reset all form controls to their initial values
        this.formStates.isSearchDivOpen = false;
        this.updateButtonText = "Close";
        });
  }

  public clearRecipientsLists(): void {
  this.addRecipient.reset();
  this.formStates.isSearchDivOpen = false;
  this.conversationSettingsForm.patchValue({
    addRecipient: ''
  })
}

public navigateToSeeAllMsgGrpScreen():void{  
  this.userIndex ? this.router.navigateByUrl(`/u/${this.userIndex}/settings/preferences`) : null;
}
  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }
}