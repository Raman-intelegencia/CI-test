import { Component, ElementRef, EventEmitter, Input, Output, } from '@angular/core';
import { Reference } from '../../models/profile.model';
import { AuthService, ConvertDateAndTimePipe, DateUtilsService,  UserService  } from '@amsconnect/shared'; 
import { FormBuilder, FormGroup } from '@angular/forms';
import { ScheduledStatusService } from '../../services/schedule-status.service';
import { ScheduleStatus } from '../../models/schedule-status.model';
import { OnCallPopUpClass } from 'libs/shared/src/lib/helpers/modals/current-service-team/serviceTeamPopUp/onCallPopUp/on-call-pop-up-class';
const STATUS_OPTIONS: {
  value: string;
  label: string;
}[] = [
    { value: 'busy', label: "Busy" },
    { value: 'off', label: "Off Duty" },
  ];
@Component({
  selector: 'web-messenger-schedule-new-status-popup',
  templateUrl: './schedule-new-status-popup.component.html',
  styleUrls: ['./schedule-new-status-popup.component.scss'],
})

export class ScheduleNewStatusPopupComponent extends OnCallPopUpClass {
  public selectedUsers: Reference[] = [];
  public showAutoResponsePopup= false;
  public showModal = true;
  public showFromTimeSuggestions = false;
  public currentDate = "";
  public status = STATUS_OPTIONS;
  public coverageId = '';
  public searchResults: Reference[] = [];
  public autoResponse: string | undefined;
  public setselectedStatus: string[] | undefined = [];
  public customAutoResponse = "";
  public autoResponseFormValue="default";
  public scheduledStatusForm!: FormGroup;
  public errorMessage = "";
  public isEnableSubmit = false;
  public userId = "";
  @Input() showScheduledNewStatus = false;
  public selectedStatus = "";
  @Output() showScheduledNewStatusEvent = new EventEmitter<boolean>(); 
  constructor( private userService: UserService,
    private convertDateAndTimePipe: ConvertDateAndTimePipe,
    public fb: FormBuilder, dateUtilSvc: DateUtilsService, authService: AuthService, public scheduledStatusService: ScheduledStatusService, ) {
    super(authService, dateUtilSvc)
  }

  ngOnInit(): void {
    this.scheduledStatusForm = this.fb.group({
      status: [""],
      start_date: [""],
      end_date: [""],
      start_time: [""],
      end_time: [""]
    });
    this.subscribeToFormChanges();
    this.subscription.add(this.userService.userId$.subscribe(res => {
      this.userId = res;
    })); 
  }
  
  public showAutoResponseModal(): void {
    this.showAutoResponsePopup = true;
    this.customAutoResponse = this.autoResponse ?? '';
  }

  public autoResponseFormResponseValue(autoResponseFormValue:string):void{
   this.autoResponseFormValue = autoResponseFormValue;
  }

   public customAutoResponseValue(responseData: string): void {
    this.autoResponse = responseData;
  }

  public showAutoResponsePopupValue(showAutoResponse:boolean):void{
    this.showAutoResponsePopup = showAutoResponse;
  }

 public selectedUsersValue(usersData:Reference[]):void{
  this.selectedUsers = usersData; 
  }

  public setSelectedStatus(): void {
    this.selectedStatus = this.scheduledStatusForm.get('status')?.value;
    if ( this.selectedStatus && !this.setselectedStatus?.includes( this.selectedStatus)) {
      this.setselectedStatus?.push( this.selectedStatus); 
      this.autoResponse = this.selectedStatus === 'busy' ? `I am busy. ` : `I am off duty.`
    }
  }

  public back():void{
    this.showScheduledNewStatus=!this.showScheduledNewStatus;
    this.showScheduledNewStatusEvent.emit(this.showScheduledNewStatus);
  }

  public scheduleStatusHandle(): void {
    const startDateValue = this.scheduledStatusForm?.get('start_date')?.value;
    const endDateValue = this.scheduledStatusForm?.get('end_date')?.value;
    const startDateTime = this.convertDateAndTimePipe.transform(startDateValue , 'convertToUTCFormat', this.fromTime ? this.fromTime : "")??'';
    const endDateTime = this.convertDateAndTimePipe.transform(endDateValue , 'convertToUTCFormat', this.toTime ? this.toTime : "")??'';
    const start = new Date(startDateTime).toISOString();
    const end = new Date(endDateTime).toISOString();
    let selectedUserName;
    this.selectedUsers.filter(user => {
      selectedUserName = `${user.data.first_name} ${user.data.last_name}`
      this.coverageId = user.id   
    })
    if( this.autoResponseFormValue === "default" && selectedUserName){
      this.autoResponse =`${this.autoResponse} Covered by ${selectedUserName}`
    }
    const userScheduleStatus: ScheduleStatus = {
      user_id: this.userId,
      status: this.scheduledStatusForm.get('status')?.value,
      duration: "custom",
      start_date: start,
      end_date: end,
      coverage: this.coverageId,
      away_message_mode:  this.autoResponseFormValue,
      away_message: this.autoResponse || this.customAutoResponse,
    }
    this.scheduledStatusService.saveScheduleStatus(userScheduleStatus).subscribe();
    this.scheduledStatusForm.reset();
    this.fromTime = "";
    this.toTime = "";
    this.selectedUsers = [];
    this.autoResponse = "";
    this.customAutoResponse = "";
    this.showScheduledNewStatus = !this.showScheduledNewStatus;
    this.showScheduledNewStatusEvent.emit(this.showScheduledNewStatus);
  }

  public subscribeToFormChanges(): void {
    this.scheduledStatusForm.valueChanges.subscribe(() => {
      this.updateSubmitButtonStyle();
    });
  }
 
  public selectStartTime(timeSlot: string, event: Event): void {
    event?.stopPropagation();
    this.fromTime = timeSlot;
    this.onCallPopUpState.selectedFromTimeSlot = timeSlot;
    this.onCallPopUpState.showFromTimeSuggestions = false;
    if (this.fromTime) {
      this.updateSubmitButtonStyle();
    }
  }

  public selectEndTime(timeSlot: string, event: Event): void {
    event?.stopPropagation();
    this.toTime = timeSlot;
    this.onCallPopUpState.selectedToTimeSlot = timeSlot;
    this.onCallPopUpState.showToTimeSuggestions = false;
    if (this.toTime) {
      this.updateSubmitButtonStyle();
    }
  }

  public updateSubmitButtonStyle(): void {
    const startDateValue = this.scheduledStatusForm?.get('start_date')?.value;
    const endDateValue = this.scheduledStatusForm?.get('end_date')?.value;
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    const selectStatus = this.scheduledStatusForm.get('status')?.value;
    const currentDate = new Date();
    const startDateTime = this.convertDateAndTimePipe.transform(startDateValue || '', 'convertToUTCFormat', this.fromTime ? this.fromTime : "");
    const endTimeValue = this.convertDateAndTimePipe.transform(endDateValue || '', 'convertToUTCFormat', this.toTime ? this.toTime : "");
    const startTime = new Date(startDateTime as string);
    const currentTime = new Date(currentDate);
    const endTime = new Date(endTimeValue as string);
 
    this.errorMessage = (endDate && endDate < startDate) ? "Please enter valid date." : "";
     
    if (startDate.toDateString() === currentDate.toDateString() && startTime < currentTime) {
      this.errorMessage = "Please select future time range.";
      this.fromTime = "";
    }

    if (endDate.toDateString() === currentDate.toDateString() && endTime < currentTime) {
      this.errorMessage = "Please select future time range.";
      this.toTime = "";
    }

    this.isEnableSubmit = (startDate && endDate && this.fromTime && this.toTime && selectStatus) ?true:false;
  }

  public closePopup() : void {
    this.showScheduledNewStatus = !this.showScheduledNewStatus;
    this.showScheduledNewStatusEvent.emit(this.showScheduledNewStatus);
  }
}
