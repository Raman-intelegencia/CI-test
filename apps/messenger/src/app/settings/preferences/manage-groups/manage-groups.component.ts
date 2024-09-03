import { ComposeMessageService, CreateGroupResponse, ProfileReference, ProfileSearchResult, Profiles, Reference, SettingsService, ThreadProfile, UserService, getGroupList } from "@amsconnect/shared";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ConversationSettingsHelperService } from "../../../../services/conversation-settings-helper.service";
import { ConversationSettingsService } from "../../../../services/conversation-settings.service";
import { ManageGroupHelperService } from "../../../../services/manage-group-helper.service";
import { Subscription } from "rxjs";
import { ManageGroupHelperClass } from "./manage-groups-helper-class";
import { ComposeHelperService } from "../../../../services/compose-helper.service";
import { ComposeService } from "../../../../services/compose.service";
@Component({
  selector: "web-messenger-manage-groups",
  templateUrl: "./manage-groups.component.html",
  styleUrls: ["./manage-groups.component.scss"],
})
export class ManageGroupsComponent extends ManageGroupHelperClass implements OnInit {
  public list!: getGroupList;
  public ManageGroupForm: FormGroup;
  public usersDataList!: Reference[];
  public selectedUsers = [];
  public recipientIds!: string;
  public displayErrorMessage = "";
  public updateButtonText = "Close";
  public storeCreateGroupReponse!: any;
  public groupNameValue!: string;
  public selectedId!: string;
  public maxLength = 27;
  public userId!: string;
  public group!: Profiles;
  public selectedProfile!: ThreadProfile;
  public selectedGroupData!: any;
  public selectedGroup = { ShowListOfRecipients: false, is_writable: false };
  public subscription: Subscription = new Subscription;
  public showLoader =false; 
  @ViewChild("groupNameInput") set addMessageInputRef(groupNameInput: ElementRef) {
    if (!! groupNameInput) {
      groupNameInput.nativeElement.focus();
    }
  }
  constructor(
    private conversationSettingsService: ConversationSettingsService,  private conversationSettingsHelper: ConversationSettingsHelperService,
    private fb: FormBuilder,private settingsService: SettingsService,private manageGroupHelperService: ManageGroupHelperService, composeHelperService: ComposeHelperService, composeService:ComposeService ,
    private userService:UserService
  ) {
    super(composeHelperService,composeService);
    this.ManageGroupForm = this.fb.group({
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
    this.subscription.add(
      this.userService.imageUrlPath$.subscribe((imageUrlPath) => {
        this.imageUrlPath = imageUrlPath;
      })
    );
    this.getGroupList();
    this.subscription = this.manageGroupHelperService.isMessagingGrpVisible$.subscribe(value =>{
      this.formstate.isMessagingGrpVisible = value; 
     })
  }

  public get addRecipient(): AbstractControl {
    return this.ManageGroupForm.controls["addRecipient"];
  }
  public get groupName(): AbstractControl {
    return this.ManageGroupForm.controls["groupName"];
  }

  public getGroupById(id: string): void {
    this.selectedId = id;
    this.settingsService.getGroupById(id).subscribe((data) => {
      this.groupNameValue = data.group.name;
      this.selectedGroup.is_writable = data.group.is_writable; 
      this.selectedGroupData = data.group;
      this.formstate.closeThepopUp = true;
      this.formstate.showManageRecipients = true;
      this.selectedGroup.ShowListOfRecipients = true;
      if(!this.selectedGroup.is_writable){
        this.formstate.showMsgGrpCheckboxes = false;
      }  
      if (data.group?.is_group_readable) {
        this.formstate.isMessagingGrpVisible = true;
        this.ManageGroupForm.controls['showMessagingGrpMsgCheckbox'].setValue(data.group.is_group_readable); 
        this.ManageGroupForm.controls['includeMessagingGrpText'].enable();
      } 
      const checkLoggedInUser = data?.group?.recipient_ids.find(id=> id.$oid === data.group.user_id.$oid); 
      if (checkLoggedInUser === undefined) {
        this.ManageGroupForm.controls['includeMessagingGrpText'].setValue(false);
      }
      if(checkLoggedInUser){ 
        this.ManageGroupForm.controls['includeMessagingGrpText'].setValue(checkLoggedInUser && data.group?.is_group_readable ?true:false);
        checkLoggedInUser ? this.ManageGroupForm.controls['includeMessagingGrpText'].enable() : this.ManageGroupForm.controls['includeMessagingGrpText'].disable();
      }}) 
      this.updateButtonText = "Close";
  }

  public getGroupList(): void {
    this.formstate.closeThepopUp = false;
    this.showLoader = true;
    this.settingsService.getGroupList().subscribe((list) => {
      this.list = list;
      this.showLoader = false;
      this.formstate.showManageGroup = this.list.groups.length !== 0 ? true : false;
    });
    this.storeCreateGroupReponse = [];
  }

  public renameGroup(id: string): void {
    this.list.groups.forEach((e) => {
      if (typeof e === "object") { e["edit"] = false; }
    });
    this.list.groups.filter((data) => {
      if (id === data._id.$oid) {
        data.edit = true;
        this.formstate.isRename = data.edit;
        this.ManageGroupForm.controls["groupName"].setValue(data.name);
      }
    });
    this.formstate.isRename = true;
  }

  public updateGroupName(id: string):void {
    this.manageGroupHelperService.updateGroupName(id,this.list,this.groupName.value,this.groupName,this.ManageGroupForm.get("showMessagingGrpMsgCheckbox")as FormGroup);
    this.subscription = this.manageGroupHelperService.showResetGroupNameSubject$.subscribe(value =>{
      if(value){
        this.getGroupList();
      }
     })
    this.formstate.isRename = false;
  }

  public async getSearchedUsersList(): Promise<void> {
    this.formstate.isSearchDivOpen = true;  const searchText = this.addRecipient.value; 
    const data: ProfileReference[] = this.storeCreateGroupReponse?.recipients ? await this.conversationSettingsHelper.getSearchUsersList(this.storeCreateGroupReponse?.recipients,searchText) : await this.conversationSettingsHelper.getSearchUsersList(this.selectedGroupData?.recipients,searchText);
     if(this.storeCreateGroupReponse?.recipients){
      const uniqueIdentifiers = new Set(this.storeCreateGroupReponse?.recipients.map((item: { _id: { $oid: any; }; }) => item._id.$oid));
      this.removeDuplicateUser(data,uniqueIdentifiers)  
     }else{
      const uniqueIdentifiers = new Set(this.selectedGroupData?.recipients.map((item: { _id: { $oid: any; }; }) => item._id.$oid)); 
      this.removeDuplicateUser(data,uniqueIdentifiers)     
     } 
  }
   public removeDuplicateUser(data: ProfileReference[],uniqueIdentifiers: Set<unknown>): void{  
   this.usersDataList = data.filter(item => {
      return !uniqueIdentifiers.has(item.id) && item.type !== 'role' && item.type !== 'group' && item?.data?.type !== "oneway";
    });   
   }

  public saveAsGroup(recipient: { data: Profiles; id: string; }): void {
    this.userNotActivatedDescription = !recipient?.data?.flag_active  ? recipient?.data?.first_name + " " + recipient?.data?.last_name + " is not active" : '';
    const selectedUserId = recipient.id
    let profileData:Profiles[] | Reference[] =[];
    this.formstate.isSearchDivOpen = false;
    if(this.selectedGroup.ShowListOfRecipients){
      this.saveUpdatedProfile(recipient,this.selectedGroupData,this.groupNameValue);
    } else {
      if (this.groupName.value !== this.storeCreateGroupReponse?.name) {
        let formData = new URLSearchParams();
        this.usersDataList.filter(data => {
          this.recipientIds = data.id
        })
        if (selectedUserId !== this.recipientIds) {
          formData.append(`recipient_ids`, selectedUserId);
        }
        formData.append("name", this.groupName.value);
        this.conversationSettingsService.groupCreate(formData).subscribe((createGroupResponse: CreateGroupResponse) => {
            this.displayErrorMessage = createGroupResponse.status === "invalid" || createGroupResponse.error ? createGroupResponse.message || "" : "";
            this.formstate.showSaveAsGrpButton = this.displayErrorMessage ? true : false;
            if( this.formstate.showSaveAsGrpButton){
              this.ManageGroupForm.get('groupName')?.enable();
            }
            if (!profileData?.some((profileData:Profiles | Reference) => profileData.id === selectedUserId)) {
              this.storeCreateGroupReponse = createGroupResponse.group?.recipients ? createGroupResponse.group : [];
                    }   
            this.formstate.showMsgGrpCheckboxes = true;
            this.updateButtonText = "Save";
            this.addRecipient.reset();
          });
      }
      if (this.groupName.value === this.storeCreateGroupReponse?.name) {
        this.saveUpdatedProfile(recipient,this.storeCreateGroupReponse,this.groupName.value);}
    }
  }

  public openUserProfile(list: any, userId: string): void {
    this.showProfileModal = true;
    this.selectedProfile = list;
    this.userId = userId;
  }
  public clearRecipientsLists(): void {
    this.addRecipient.reset();
    this.formstate.isSearchDivOpen = false;
  }

  public saveUpdatedProfile(recipient: { data: Profiles; id: string; },data:any,groupName:string): void {
    const group = data;
    let profileData:Profiles[] | Reference[] =[];
    const recipientIds = data?.recipient_ids.map((id: { $oid: string; }) => id.$oid);
    recipientIds.push(recipient.id);
    let formData = new URLSearchParams();
    formData.append("id", data._id.$oid);
    formData.append("name", groupName);   
    formData.append("group_readable", (this.formstate.isMessagingGrpVisible ||this.ManageGroupForm.get("showMessagingGrpMsgCheckbox")?.value === true) ? "true" : "false");
    recipientIds.forEach((formattedId: string) => formData.append(`recipient_ids`, formattedId));
    this.conversationSettingsService.groupUpdate(formData).subscribe((_groupUpdateResponse: CreateGroupResponse) => {
        const recipients = { ...recipient.data,data: recipient.data, };
        this.updateButtonText = "Save";
        if (!profileData.some((profileData:Profiles | Reference) => profileData.id === recipientIds)) {
          this.selectedGroup.ShowListOfRecipients? this.selectedGroupData?.recipients.push(recipient.data) : this.storeCreateGroupReponse?.recipients?.push(recipient.data);
          this.selectedGroup.ShowListOfRecipients? this.selectedGroupData?.recipient_ids.push(recipient.data._id) : this.storeCreateGroupReponse?.recipient_ids?.push(recipient.data._id);
                }   
        this.addRecipient.reset();
      });
  }

  public removeExistingUser(id: string): void {
    this.selectedGroup.ShowListOfRecipients? this.manageGroupHelperService.removeManageGroupUser(id,this.selectedGroupData,this.groupNameValue,this.ManageGroupForm.get("showMessagingGrpMsgCheckbox")as FormGroup,this.ManageGroupForm.get("includeMessagingGrpText")as FormGroup,this.list): this.manageGroupHelperService.removeManageGroupUser(id,this.storeCreateGroupReponse,this.groupName.value,this.ManageGroupForm.get("showMessagingGrpMsgCheckbox")as FormGroup,this.ManageGroupForm.get("includeMessagingGrpText")as FormGroup,this.list);    
    this.formstate.isRename = false;  
    this.manageGroupHelperService.showDeleteModal$.subscribe(value =>{
     this.formstate.showDeleteModal = value; 
    })
  } 
  public getshowMessagingGrpMsgCheckboxValue(val: string): void {
    this.selectedGroup.ShowListOfRecipients? this.manageGroupHelperService.getshowMessagingGrpMsgCheckboxValues(this.ManageGroupForm.get("showMessagingGrpMsgCheckbox")as FormGroup,this.ManageGroupForm.get("includeMessagingGrpText")as FormGroup,this.selectedGroupData,val,this.groupNameValue,this.selectedGroup.ShowListOfRecipients):
    this.manageGroupHelperService.getshowMessagingGrpMsgCheckboxValues(this.ManageGroupForm.get("showMessagingGrpMsgCheckbox")as FormGroup,this.ManageGroupForm.get("includeMessagingGrpText")as FormGroup,this.storeCreateGroupReponse,val,this.groupName.value,this.selectedGroup.ShowListOfRecipients) ;
    this.updateButtonText = "Save";
  }

  public getProfileSearch(): void {
    this.conversationSettingsService.profileSearch().subscribe();
  }

  public switchToAddRecipients(): void {
    this.formstate.showMsgGrpCheckboxes = true;
    this.getProfileSearch();
    this.ManageGroupForm.get("groupName")?.disable();
  }
  public deleteConversationListsGroup(): void {
    const id = this.selectedGroup.ShowListOfRecipients ? this.selectedId : this.storeCreateGroupReponse?._id?.$oid;
    this.conversationSettingsService.groupDelete(id).subscribe((deleteReponse) => {
        if (deleteReponse.status === "ok") {
          this.formstate.showDeleteModal = false;
          this.conversationSettingsService.groupList().subscribe((_groupListResponse) => { });
          this.formstate.closeThepopUp = !this.formstate.closeThepopUp;
          this.getGroupList();
          this.selectedGroup.ShowListOfRecipients = false;
        }
      });
  }
  public deleteGroup(): void {
    this.formstate.showDeleteModal = true;
  }
  public openSaveAsMessagingGrpModal(): void {
    this.formstate.closeThepopUp = true;
    this.ManageGroupForm.reset();
    this.selectedGroup.ShowListOfRecipients = false;
  }

  public manageRecipients(id: string): void {
    this.list.groups.filter((data: { _id: { $oid: string }; name: string }) => {
      if (id === data._id.$oid) {
        this.ManageGroupForm.controls["groupName"].setValue(data.name);
        this.formstate.closeThepopUp = true;
        this.formstate.showManageRecipients = true;
        this.storeCreateGroupReponse.recipients;
      }
    });
  }
  public closeGroupModel(): void {
    this.formstate.closeThepopUp = false;
    this.addRecipient.reset();
    this.formstate.isSearchDivOpen = false;
    this.storeCreateGroupReponse = [];
    this.ManageGroupForm.controls['includeMessagingGrpText'].setValue(false);
    this.ManageGroupForm.controls['showMessagingGrpMsgCheckbox'].setValue(false);
  }
  public cancelRename(id: string): void {
    this.list.groups.filter((data) => {
      if (id === data._id.$oid) {
        data.edit = false;
        this.formstate.isRename = data.edit;
        this.ManageGroupForm.controls["groupName"].setValue(data.name);
      }
    });
  }
  public closeSaveAsMessagingGrpModal(): void {
    this.formstate.closeThepopUp = false;
    this.formstate.isSearchDivOpen = false;
  }
  public closeErrorPopup(): void {
    this.formstate.showErrorMessage = false;
    this.formstate.showMsgGrpCheckboxes = false;
    this.displayErrorMessage = "";
  }
  public updatedMessagingGrp(): void {
    this.formstate.showMsgGrpCheckboxes = false;
    this.formstate.isSearchDivOpen = false;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
}