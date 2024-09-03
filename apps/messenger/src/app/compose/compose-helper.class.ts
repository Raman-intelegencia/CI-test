import { ComposeData, ComposeMessageService, FormStates, Patient, PopupServiceService, Reference, UserType, composeArray,} from "@amsconnect/shared";
import { ChangeDetectorRef } from "@angular/core";
import { ComposeHelperService } from "../../services/compose-helper.service";
import { FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
export class ComposeHelperClass {
public patientName!: string;
public patientId!: string;
public showPatientProfilePopup = false;
public userType = UserType;
public composeData: ComposeData = {
  usersDataList: [],
  selectedUsers: [],
  patientsDataList: [],
  selectedPatients: [],
  uploadedFiles: [],
  currentIndex: 0,
  selectedOffDutyUsers: [],
  selectedUserDataWithCStatus: [],
};
public showUrgentMessage = false;
public showErrorMessage = "";
public showVerificationModal = false;
public showOffDutySection = false;
public showServiceModal = false;
public showGroupModal = false;
public selectedService!:Reference;
public selectedgroup!:Reference;
public showProfileModal = false;
public selectedUserIdDetails = "";
public allUsersDataList: Reference[] = [];
public selectedUsers:Reference[] = []
public userId = "";
public selectedPatient = '';
public selectedPatientName = '';
public showSelectedPatientDiv = true;
public imageUrlPath = "";
public formStates: FormStates = {
  isInputFocused: false,
  isPatientInputFocused: false,
  collapseVisible: true,
  isUrgent: false,
  isMessageFocused: false,
  showDiscardModal: false,
};
public createThreadApiCall = false;
public composeForm!: FormGroup;
public  subscription = new Subscription();
public isEdit = false;
public messageType = {
  externalMessage: "ExternalMessage",
  composeMessage: "InternalMessage",
};
public composePopupValue = this.messageType.composeMessage;
public showCoveragID = false;

constructor(
  public composeService: ComposeMessageService,
  public composeHelperService:ComposeHelperService,
  public popupService: PopupServiceService,
  private cd: ChangeDetectorRef, 
  ) {}
// Add user to selected array
public selectUser(selectedUsers:Reference):void{
  if(!this.composeData.selectedUsers.some(user => user.id === selectedUsers.id)){
    this.composeData.selectedUsers.push(selectedUsers);
  }
  this.popupService.addUserToCompose(this.composeData.currentIndex, selectedUsers);
  this.checkUserOffDuty();
}
// Remove user from selected array
public removeUser(selectedUsers: Reference): void {
  this.composeData.selectedUsers = this.composeData.selectedUsers.filter(user => user.id !== selectedUsers.id);
  this.popupService.removeUserFromCompose(this.composeData.currentIndex, selectedUsers);
  this.checkUserOffDuty();
}

public checkUserOffDuty(): void {
const results = this.composeHelperService.updateOffDutyUsers(this.composeData,this.allUsersDataList);
this.composeData.selectedOffDutyUsers = results.selectedOffDutyUsers;
this.composeData.selectedUserDataWithCStatus = results.selectedUserDataWithCStatus;
}

public selectPatientData(id: string, name: string): void {
  this.patientId = id;
  this.patientName = name;
  this.showPatientProfilePopup = true;
}

public openProfilePopUp(event:{event: Event, userId: string}): void {
  this.showProfileModal = true;
  this.selectedUserIdDetails = event?.userId;
  event?.event?.stopPropagation();
}

public openServiceProfilePopUp(event:{event: Event, service:Reference}):void{
  this.showServiceModal = true;
  this.selectedService = event?.service;
  event?.event?.stopPropagation();
}

public openGroupProfilePopUp(event:{event: Event, group:Reference}):void{
  this.showGroupModal = true;
  this.selectedgroup = event?.group
  event?.event?.stopPropagation();
}

public allUsersDataUpdatedList(usersList: Reference[]):void{
  this.allUsersDataList = usersList;
}

public getFormattedList(allUserServiceGroupList: Reference[]): Reference[] {
  return allUserServiceGroupList.map(list => {
    const matchedProfiles: Reference[] = [];
    // Handle the service type
    if (list.type === this.userType.Role) {
        list.data.user_ids?.forEach((id: { $oid: string }) => {
            const matchedProfile = allUserServiceGroupList.find((userId) => userId.id === id.$oid);
            if (matchedProfile) {
                matchedProfiles.push(matchedProfile);
            }
        });
        list['matchedProfiles'] = matchedProfiles;
    }
    //  Handle coverage profiles & Use the full list for matching coverage profiles
    if (list.data.status?.c) {
      const coverageProfile = allUserServiceGroupList.find((user) => user.id === list?.data?.status?.c?.ref);
      if (coverageProfile) {
        list['coverageProfile'] = coverageProfile;
      }
    }
    return list;
  });
}
public getImageUrl(image_id: string): string {
  return this.imageUrlPath + image_id + "_profile.png";
}
public openSaveAsMessagingGrpModal(event: boolean): void {
  this.showGroupModal = this.showGroupModal ? event : true;
  this.cd.detectChanges(); // Trigger change detection
}

public showUserProfile(showProfileModal: boolean): void {
  this.showProfileModal = showProfileModal;
}

public showChildProfileModal(showProfileModal: boolean):void{
  this.showProfileModal = showProfileModal;
}

public updateToSearchDataValue(value: string):void{
  this.updateDataValue('to', value);
}
public updateDataValue(key: keyof composeArray, value: string): void {
  this.popupService.updateComposePopUp(key, value);
}

public getHeight(): number {
  const inputElement = document.getElementById('composeMessage') as HTMLTextAreaElement | null;
  if (inputElement) {
    return inputElement.scrollHeight;
  }
  // Default height if the element is not found or not rendered yet
  return 0;
}
public getStyle(): { 'height.px': number } {
  const inputElement = document.getElementById('composeMessage') as HTMLTextAreaElement | null;
  return { 'height.px': this.getHeight() };
}
public validateAndPost(): boolean {
  const enterToSendValue = localStorage.getItem(`${this.userId}_quick_send`);
  return (enterToSendValue) ? JSON.parse(enterToSendValue) : false;
}

public uploadFile(event: any): void {
  this.composeHelperService.uploadFile(this.userId, event).subscribe(
    uploadedFiles => {
      this.composeData.uploadedFiles = uploadedFiles;
    },
    error => {
      console.error('Error during file upload:', error);
    }
  );
}
public removeFile(index: number): void {
  this.composeData.uploadedFiles.splice(index, 1);
}
public closeOffDutySection(event: boolean): void {
  this.showOffDutySection = event;
}

public toggleUrgentState(): void {
   this.formStates.isUrgent = ! this.formStates.isUrgent;
  this.showUrgentMessage = true;
  setTimeout(() => {
    this.showUrgentMessage = false;
  }, 3000);
}

public closeServiceTeamModal(closeModal:boolean):void{
  this.showServiceModal = closeModal; 
}

public syncUsers(currentUsers: Reference[], idsToUpdate: string[], allUsersDataList: Reference[]): Reference[] {
  // Step 1: Retain users with 'available' status
  const usersToRetain = currentUsers.filter(item => item?.data?.status?.s === 'available');
  // Step 2: Filter based on idsToUpdate
  let updatedUsers = currentUsers.filter(item => idsToUpdate.includes(item?.data?._id.$oid));
  // Step 3: Add missing users from idsToUpdate
  idsToUpdate.forEach(id => {
    if (!updatedUsers.some(item => item?.data?._id.$oid === id)) {
      const userToAdd = allUsersDataList.find(user => user?.data?._id.$oid === id);
      if (userToAdd) updatedUsers.push(userToAdd);
    }
  });

  // Combine while avoiding duplicates
  return [...usersToRetain, ...updatedUsers.filter(user => !usersToRetain.includes(user))];
}


public trackByPatientId(index: number, patient: Patient): string {
  return patient.id; // Return a unique identifier for each patient
}
}