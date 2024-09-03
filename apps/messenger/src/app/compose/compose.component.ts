import {ComposeMessageService, Patient,  PatientsSearchResult,PopupServiceService,UserService,composeArray, ModalComponent, Reference,} from "@amsconnect/shared";
import { CommonModule } from "@angular/common";
import {Component,Input,Output, EventEmitter,SimpleChanges,HostListener,ViewChild,ElementRef, OnInit,OnDestroy, ChangeDetectorRef, OnChanges} from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators,} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { combineLatest } from "rxjs";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { QuickMessagesComponent } from "../quick-messages/quick-messages.component";
import { OffDutyUserPickerComponent } from "../offduty-user-picker/offduty-user-picker.component";
import { PatientProfilePopupComponent } from "../patient-profile-popup/patient-profile-popup.component";
import { UserProfileModalComponent } from "../messages/user-profile-modal/user-profile-modal.component";
import { ComposeHelperService } from "../../services/compose-helper.service";
import { ServiceTeamsPopUpComponent } from "../serviceTeamsPopUp/service-teams-pop-up.component";
import { SaveAsMessagingGrpComponent } from "../messages/conversation-lists-detail/conversation-settings/save-as-messaging-grp/save-as-messaging-grp.component";
import { ComposeHelperClass } from "./compose-helper.class";
import { UsersSearchComponent } from "../common/users-search/users-search.component";
import { ComposeService } from "../../services/compose.service";
import { ProfileStatusHelperService } from "../../services/profile-status-helper.service";
@Component({
    selector: "web-messenger-compose",
    templateUrl: "./compose.component.html",
    styleUrls: ["./compose.component.scss"],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ModalComponent, DragDropModule, QuickMessagesComponent, OffDutyUserPickerComponent, PatientProfilePopupComponent, UserProfileModalComponent, ServiceTeamsPopUpComponent, UsersSearchComponent, SaveAsMessagingGrpComponent]
})
export class ComposeComponent extends ComposeHelperClass implements OnInit, OnDestroy,OnChanges {
  @Input() composeArrayIndex = 0;
  @Input() composeArrayLength = 0;
  @ViewChild("inputField") inputField!: ElementRef;
  @Input() composePopupObjectData: composeArray = {
    to: [],
    patient: "",
    subject: "",
    message: "",
    id: 0,
    minimized: false,
    eventType:""
  };
  @Input() patientData: Patient[] = [];
  @Output() closeComposePopup = new EventEmitter<void>();
  @ViewChild("toSearchInput") toSearchInput!: ElementRef;
  @Input() selectedUserId = '';
  @Input() coverageId = '';
  @Input() sendCoverageIdToComposePopup = false;
  @Input() getIdAndtype!: { coverageId: string; type: string; };
  @Input() showPatientTab = false;
  constructor(
    composeService: ComposeMessageService,
    private formBuilder: FormBuilder,
    popUpService: PopupServiceService,
    private userService: UserService,
    composeHelperService:ComposeHelperService, 
    cd: ChangeDetectorRef, 
    public composeServices:ComposeService,private profileStatusHelperServ : ProfileStatusHelperService
    ) {
      super(composeService, composeHelperService, popUpService,cd)
    this.composeForm = this.formBuilder.group({
      to: "",
      patient: "",
      subject: "",
      message: ["", Validators.required],
      urgent: false,
      enterToSend: false,
    });
    this.subscription.add(this.composeHelperService.coverageId$.subscribe(
      (state) => {
        this.coverageId = state;  
      }
    )); 
  }
  ngOnChanges(changes: SimpleChanges): void { 
    this.composeData.currentIndex = this.composeArrayIndex;
    this.formStates.collapseVisible = !this.composePopupObjectData["minimized"];  
    if (this.patientData.length && !this.composeData.selectedPatients.length && !this.composePopupObjectData.to.length) {
      this.composeData.selectedPatients.push(this.patientData[0]);
      this.composeData.selectedPatients.length > 0 ? this.composeForm.get("patient")?.disable() : this.composeForm.get("patient")?.enable();
    }
    if (changes['composePopupObjectData'] && changes['composePopupObjectData'].currentValue){
      this.composeData.selectedUsers = [...changes['composePopupObjectData'].currentValue.to];
    }   
  }
  ngOnInit(): void {
    this.subscription = combineLatest([
      this.userService.userId$,
      this.userService.imageUrlPath$,
    ]).subscribe(([userId, imageUrlPath]) => {
      this.userId = userId;
      this.imageUrlPath = imageUrlPath;
    });
    this.composeFormControls["enterToSend"].setValue(this.validateAndPost());
    this.getHeight; 
    if ( this.coverageId && !this.selectedUserId) {
      this.selectedCoverageId(this.coverageId); 
      }  
    if(this.selectedUserId &&  !this.coverageId){ 
      this.selectedProfileUserId(this.selectedUserId);
    }
  }

  public adjustOverflowY(): void {
    const textarea: HTMLTextAreaElement = this.inputField.nativeElement;
    this.composeHelperService.commonAdjustOverflowY(textarea);
  }
  public setQuick_send(): void {
    localStorage.setItem(`${this.userId}_quick_send`, JSON.stringify(!this.composeFormControls['enterToSend'].value));
  }
  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "Enter" && this.composeFormControls["enterToSend"].value && this.composeFormControls["message"].value.trim() !== "" && this.composeData.selectedUsers.length) {
      this.createThread();
    }
  }
  public handleEnterKeyboardEvent(event: Event): void {
    const enterToSend = this.composeFormControls["enterToSend"]?.value;
    const messageValue = this.composeFormControls["message"]?.value;
    const selectedUsersLength = this.composeData.selectedUsers.length;
    const keyboardEvent = event as KeyboardEvent;
      if(keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey){
        event.preventDefault();
        if (enterToSend && messageValue !== "" && selectedUsersLength) {
          this.createThread();
        }
        else if(!enterToSend){
          this.moveCursorToNextLine();
        }
      }
    }
  public moveCursorToNextLine(): void {
    const textarea = document.getElementById('composeMessage') as HTMLTextAreaElement | null;
    if(textarea)
    {
      const textAreaVal = this.composeService.moveCursorToNextLine(textarea);
          this.composeForm.get('message')?.setValue(textAreaVal);
    }
  }
  public onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      if (target) {
        let value = target.value;
        // Check if the last character is a newline
        if (value.endsWith('\n')) {
          // Remove the last character
          value = value.slice(0, -1);
          // Update the textarea value without the newline
          target.value = value;
        }
        // Update your form control with the modified value
        this.composeForm?.get('message')?.setValue(value);
    
        // Adjust the textarea height
        target.style.height = 'auto'; // Reset height to auto
        target.style.height = target.scrollHeight + 'px'; // Set the updated height
      }
    }
  }
  public get composeFormControls() {
    return this.composeForm.controls;
  }
  public selectedProfileUserId(id: string): void { 
    this.composeHelperService.selectedProfileUserId(id).subscribe(({ userList, selectedUsers }) => { 
      if (selectedUsers) {     
      this.composeData.selectedUsers = selectedUsers ? [selectedUsers] : [];
      this.composePopupObjectData.to = selectedUsers? [selectedUsers] : []; 
        this.popupService.addUserToCompose(this.composeData.currentIndex, selectedUsers);
      }  
      else {
        this.subscription.add(this.composeHelperService.userProfileData$.subscribe(
          (userProfileData) => {
            this.composeData.selectedUsers = [userProfileData];   
            this.composePopupObjectData.to = [userProfileData];
            this.popupService.addUserToCompose(this.composeData.currentIndex, userProfileData);
          }
        ));
      }
      });
  }

  public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType: string = this.messageType.composeMessage): void {
    if(this.selectedUserId){
      this.composeHelperService.sendUserIdToCompose("")
    }
    this.composeServices.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
 }

 public addComposeQueryParamsForSendMsg(id:string):void {
  this.coverageId ? this.composeHelperService.setCoverageId("") : '';
  this.composeServices.addComposeQueryParamsForUserId(id);
 }

  public selectedCoverageId(id:string) : void {
    this.composeHelperService.selectedProfileUserId(id).subscribe(({ userList, selectedUsers } )=> {
    if(selectedUsers) {    
    this.composeData.selectedUsers = selectedUsers ? [selectedUsers] : [];
      this.composePopupObjectData.to = selectedUsers? [selectedUsers] : [];  
      this.popupService.addUserToCompose(this.composeData.currentIndex, selectedUsers);
    }
    else {
      this.subscription.add(this.composeHelperService.coverageUserData$.subscribe(
        (coverageData) => {
          this.composeData.selectedUsers = [coverageData];   
          this.composePopupObjectData.to = [coverageData];
          this.popupService.addUserToCompose(this.composeData.currentIndex, coverageData);
        }
      ));
    }
    });
  }
  public toggleCollapse(): void {
    !this.composePopupObjectData["minimized"] &&
      this.composeData.currentIndex === 0 ? (this.formStates.collapseVisible = !this.formStates.collapseVisible) : this.popupService.swapComposePopUps(this.composeData.currentIndex);
  }
 
  public getPatientsList(): void {
    const patientSearchText = this.composeFormControls["patient"].value;
    this.selectedPatientName = patientSearchText;    
    if (this.showPatientTab) {
    this.composeService.searchPatients(patientSearchText).subscribe((data: PatientsSearchResult) => {
      this.composeData.patientsDataList = data.patients;
    });
  }
  }
  public createThread(): void {
    if(this.createThreadApiCall){
      return;
    }
    if(!this.composePopupObjectData?.to?.length){ //check if recipients are selected and continue
      return;
    }
    this.createThreadApiCall = true; // Indicate that an API call is now in progress
    this.composeFormControls["urgent"].patchValue(this.formStates.isUrgent);
    this.composeService.createThread(this.composeForm.value,
      this.composePopupObjectData.to,
      this.composeData.uploadedFiles.map((file) => (file.id !== null ? file.id.toString() : "")).filter((id) => id !== ""),
      this.composeData.selectedPatients[0]?.name || this.selectedPatientName, this.composeData.selectedPatients[0]?.id ?? ""
    )
      .subscribe({
        next: (response) => {         // Success handling
            const result = response;
            this.profileStatusHelperServ.setShowHideUserProfileFlag(false);
            this.closeComposePopup.emit();
        },
        error: (error) => {
          console.error('Error creating new thread:', error); // Error handling
        },
        complete: () => {
          this.createThreadApiCall = false   // Reset the API call flag on completion
        }
      });
  }
  public closePopup(): void {
    this.composePopupObjectData?.to && this.composePopupObjectData?.to.length > 0 ? (this.formStates.showDiscardModal = true) : this.closeComposePopup.emit();
  }
  public confirmDiscard(): void {
    this.formStates.showDiscardModal = false;
    this.closeComposePopup.emit();
  }

  public showUpdatedUsersInInput(event: Reference[] | undefined): void { 
    if (event) {
      this.composePopupObjectData.to = [
        ...this.composePopupObjectData.to.map(selectedUser => {
          const matchingEventUser = event.find(eventUser =>
            selectedUser?.data?.status?.c?.ref === eventUser.data?._id.$oid
          );
          // If there is a matching user in the event array, replace the selectedUser
          return matchingEventUser ? matchingEventUser : selectedUser;
        }),
       
      ];
    }   
    if(this.composeData.selectedOffDutyUsers?.length === 1 && this.composeData.selectedOffDutyUsers.map(users=> users?.data?.status?.s === 'available') ){
      this.composeData.selectedOffDutyUsers = [];
    }     
  }
 
  public selectPatient(patient: Patient): void {
    this.composeData = this.composeHelperService.selectPatient(this.composeData, patient);
    this.composeFormControls["patient"].setValue('');
    this.composeFormControls["patient"]?.disable(); // disable the control
    this.showSelectedPatientDiv = false;
  }
  public selectPatientNotInDb(): void {
    this.selectedPatient = this.selectedPatientName;
    this.composeData.selectedPatients.length = 0;
    this.composeData.patientsDataList = [];
    this.showSelectedPatientDiv = false;
    this.composeFormControls["patient"].setValue('');
    this.composeFormControls["patient"]?.disable();
  }
  public removePatient(patient: Patient): void {
    this.composeData = this.composeHelperService.removePatient(
      this.composeData,
      patient
    );
    this.composeFormControls["patient"]?.enable(); // enable the control
    this.composeService
      .searchPatients()
      .subscribe((data: PatientsSearchResult) => {
        this.composeData.patientsDataList = data.patients;
        this.showSelectedPatientDiv = true;
      });
  }
  public removePatientNotInDb(): void {
    this.selectedPatient = "";
    this.selectedPatientName = "";
    this.composeFormControls["patient"]?.enable(); // enable the control
    this.composeService
      .searchPatients()
      .subscribe((data: PatientsSearchResult) => {
        this.composeData.patientsDataList = data.patients;
        this.showSelectedPatientDiv = true;
      });
  }
 
  public selectedQuickMessage(data: string): void {
    this.composeFormControls["message"].setValue(data);
    this.composeFormControls["enterToSend"].setValue(true);
    this.createThread();
  }
  
  public getFormattedNames(): string {
  return this.composeHelperService.getFormattedNames(this.composePopupObjectData.to);
  }

  public getOffDutySection(): void {
    this.showOffDutySection =
      this.composeData?.selectedOffDutyUsers !== undefined &&
        this.composeData?.selectedOffDutyUsers?.length > 0 ? true : false;
        this.composeData.selectedOffDutyUsers = this.composePopupObjectData.to.filter(user=> user?.data?.status?.s !== 'available');
  }
  public showManuallyUpdatedUsersInInput(event: Reference[]): void {
    // Assuming this.composePopupObjectData.to is an array and you want to avoid duplicates
    const existingIds = this.composePopupObjectData.to.map(item => item?.data?._id.$oid); 
    const uniqueEvent = event.filter(item =>
      !existingIds.includes(item?.data?._id.$oid)
    );
    this.composePopupObjectData.to.push(...uniqueEvent);
  } 
  // Update the selected users after selection of recipients who are unavailable
  public removeUserFromListById(idsToUpdate: string[]): void {
    this.composePopupObjectData.to = this.syncUsers(this.composePopupObjectData.to, idsToUpdate, this.allUsersDataList)
    if(this.composeData.selectedOffDutyUsers?.length === 1 && this.composeData.selectedOffDutyUsers.map(users=> users?.data?.status?.s === 'available') ){
      this.composeData.selectedOffDutyUsers = [];
    }
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}