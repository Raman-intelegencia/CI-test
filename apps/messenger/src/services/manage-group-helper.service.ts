
import { Injectable } from "@angular/core";
import { ConversationSettingsService } from "./conversation-settings.service";
import { Subject, filter, take } from "rxjs";
import { CREATE_GROUP_REFERENCE, CreateGroupResponse, Profiles, Reference, getGroupList, groupArrayData } from "@amsconnect/shared";
import { AbstractControl } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class ManageGroupHelperService {
  public showDeleteModal = false
  public showMessagingGrpVisible = false;
  public showResetGroupName = false;
  private showResetGroupNameSubject = new Subject<string>();
  showResetGroupNameSubject$ = this.showResetGroupNameSubject.asObservable();
  private showDeleteModalSubject = new Subject<boolean>();
  showDeleteModal$ = this.showDeleteModalSubject.asObservable();
  private isMessagingGrpVisible = new Subject<boolean>();
  isMessagingGrpVisible$ = this.isMessagingGrpVisible.asObservable();
  constructor(private conversationSettingsService: ConversationSettingsService,) { }

  public getshowMessagingGrpMsgCheckboxValues(ManageGroupForm: AbstractControl, includeMessagingGrpText: AbstractControl, data: any, val: string, groupName: string, ShowListOfRecipients: boolean,): void {
    let formData = new URLSearchParams();
    const group = data;
    const user_id = group.user_id.$oid; 
    formData.append("id", group._id.$oid);
    formData.append("name", groupName); 
    const showMessagingGrpMsgCheckbox = ManageGroupForm;
    const includeMessagingGrpTextControl = includeMessagingGrpText; 
    if(val === "showMessagingGrpMsgCheckbox"){
    showMessagingGrpMsgCheckbox?.valueChanges.pipe(take(1)).subscribe((value) => { 
      if (value) { 
        this.showMessagingGrpVisible = true;
        this.isMessagingGrpVisible.next(this.showMessagingGrpVisible);
        formData.append("group_readable", "true");
        const recipientIds = group.recipient_ids.map((id: { $oid: string; }) => id.$oid).filter((id: string) => id !== user_id);
        recipientIds.forEach((formattedId: string) => formData.append("recipient_ids", formattedId));
        this.conversationSettingsService.groupUpdate(formData).subscribe((_groupUpdateResponse: CreateGroupResponse) => {
          includeMessagingGrpTextControl?.enable();
        });   
      } else {
        this.showMessagingGrpVisible = false;
        this.isMessagingGrpVisible.next(this.showMessagingGrpVisible);
        formData.append("group_readable", "false");
        const recipientIds = group.recipient_ids.map((id: { $oid: string; }) => id.$oid).filter((id: string) => id !== user_id);
                    recipientIds.forEach((formattedId: string) => formData.append("recipient_ids", formattedId));
        this.conversationSettingsService.groupUpdate(formData).subscribe((groupUpdateResponse: CreateGroupResponse) => { 
            data.recipients =groupUpdateResponse.group?.recipients? groupUpdateResponse.group?.recipients : []; 
          includeMessagingGrpTextControl?.disable();
          includeMessagingGrpTextControl?.setValue(false);
        })
      }
    });
  }
   else if (val === "includeMessagingGrpText") {
      includeMessagingGrpTextControl?.valueChanges.pipe(take(1)).subscribe((value) => {
        let formDataForAPI = new URLSearchParams();
        formDataForAPI.append("id", group._id.$oid);
        formDataForAPI.append("name", groupName);
        formDataForAPI.append("group_readable", "true"); 
        if (value) {
          const recipientIds = val === "includeMessagingGrpText" ? [user_id, ...group.recipient_ids.map((id: { $oid: string; }) => id.$oid)] : group.recipient_ids.map((id: { $oid: any; }) => id.$oid).filter((id: any) => id !== user_id);
                    recipientIds.forEach((formattedId: string) => formDataForAPI.append("recipient_ids", formattedId));
          this.conversationSettingsService.groupUpdate(formDataForAPI).subscribe((groupUpdateResponse: CreateGroupResponse) => {
            if (groupUpdateResponse && groupUpdateResponse.group && groupUpdateResponse.group.user) {   
              data.recipients.push(groupUpdateResponse.group.user); 
            }
          });
        } else {
          const recipientIds = group.recipient_ids.map((id: { $oid: string; }) => id.$oid).filter((id: string) => id !== user_id);
                    recipientIds.forEach((formattedId: string) => formDataForAPI.append("recipient_ids", formattedId));
          this.conversationSettingsService.groupUpdate(formDataForAPI).subscribe((groupUpdateResponse: CreateGroupResponse) => {
              data.recipients =groupUpdateResponse.group?.recipients? groupUpdateResponse.group?.recipients : [];    
          });
        }
      });
    }
  }

  public removeManageGroupUser(delProfileId: string, data: {
    user_id: { $oid: string; }; recipient_ids: { $oid: string; }[]; recipients: CREATE_GROUP_REFERENCE[]; _id: { $oid: string; }; 
}, groupName: string, MessagingGrpMsgCheckbox: AbstractControl,includeMessagingGrpText: AbstractControl,list: getGroupList | undefined): void {
  let formData = new URLSearchParams();
  const filteredRecipients = data.recipients.filter((recipient: { _id: { $oid: string; }; }) => recipient._id.$oid !== delProfileId);
    const recipientIds = filteredRecipients.map((recipient: { _id: { $oid: string; }; }) => recipient._id.$oid);
    const groupToUpdate = this.findGroupById(data._id.$oid,list);
    if (groupToUpdate) {
      // Updating recipient_ids with the new array
      groupToUpdate.recipient_ids = filteredRecipients.map(recipient => ({ $oid: recipient._id.$oid }));
      // Updating the length property in the list for the specific group ID
      const indexToUpdate = list?.groups.findIndex(group => group._id.$oid === data._id.$oid);
      if (indexToUpdate !== undefined && indexToUpdate !== -1 && list) {
        // Update the recipient_ids directly based on the new length
        list.groups[indexToUpdate].recipient_ids = groupToUpdate.recipient_ids;
      }
    }
    if (data.recipients.length === 1) {
      this.showDeleteModal = true;
      this.showDeleteModalSubject.next(this.showDeleteModal);
    }
    else {  
      formData.append("id", data?._id?.$oid);
      formData.append("name", groupName); 
        formData.append("group_readable", (MessagingGrpMsgCheckbox.value === true) ? "true" : "false"); 
      recipientIds.forEach((formattedId: string) => formData.append(`recipient_ids`, formattedId));
      this.conversationSettingsService.groupUpdate(formData).subscribe(_data => {
        data.recipients = _data?.group?.recipients;
        data.recipient_ids = _data?.group?.recipient_ids;
        if (_data?.group?.user_id?.$oid === delProfileId) { 
          includeMessagingGrpText?.setValue(false);
          includeMessagingGrpText.disable();
        }
      });
    }
  }
  public updateGroupName(id: string,list:getGroupList,groupName:string,formGroupName:AbstractControl,MessagingGrpMsgCheckbox: AbstractControl,):void  {
    let formData = new URLSearchParams();
    list.groups.filter((data: { _id: { $oid: string; }; recipients: { _id: { $oid: string; }; }[]; }) => {
        if (data._id.$oid === id) {
           const recipientIds = data?.recipients.map((recipient_ids) => recipient_ids._id.$oid);
          recipientIds.forEach((formattedId: string) => formData.append(`recipient_ids`, formattedId)); 
          formData.append("id", id);
          formData.append("name", groupName);
          formData.append("group_readable", (MessagingGrpMsgCheckbox.value === true) ? "true" : "false"); 
          this.conversationSettingsService.groupUpdate(formData).subscribe(data => { 
            this.showResetGroupNameSubject.next("success");
            });
        }
      });
  }

  private findGroupById(groupId: string | Blob,list: getGroupList | undefined): groupArrayData | undefined {
    return list?.groups.find(group => group._id.$oid === groupId);
  }
}
