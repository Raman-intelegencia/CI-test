import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ConvertDateAndTimePipe, CookieService, CreateShiftRequest, FilterDaysOfWeekPipe, Recurring, UpdateStatusResponse, createShiftResponse, loadLatestMessage, Shift, UsersAuthResponse, AuthService, Role, Users, DateUtilsService } from "@amsconnect/shared";
import { TranslateModule } from "@ngx-translate/core";
import { FormatServiceTeamPipe } from "@amsconnect/shared";
import { DateTimePipe } from "../../../../pipes/date-time-pipe.pipe";
import { OnCallPopUpClass } from "./on-call-pop-up-class";
import { DEFAULT_DAYS_OF_WEEK } from "./daysOfWeek";
import { InboxHelperService } from "../../../../../services/messenger-services/inbox-helper.service";
import { ServiceTeamsService } from "../../../../../services/messenger-services/service-teams.service";
import { User } from "libs/shared/src/lib/models/users.model";
import { SELECTED_SERVICE_ROLE_LIST, UserUpdateStatus, profileResponse } from "../../../../../models/profile.model";
import { ModalComponent } from "../../../modal/modal.component";
@Component({
    selector: "web-messenger-on-call-pop-up",
    standalone: true,
    templateUrl: "./on-call-pop-up.component.html",
    styleUrls: ["./on-call-pop-up.component.scss"],
    providers: [ConvertDateAndTimePipe, DateTimePipe],
    imports: [CommonModule, FormsModule, TranslateModule, ConvertDateAndTimePipe, FilterDaysOfWeekPipe, FormatServiceTeamPipe, ModalComponent]
})
export class OnCallPopUpComponent extends OnCallPopUpClass implements OnInit,OnDestroy,OnChanges {
 @Input() public getSelectedRoleValue: string[] = [];
 @Input() public storeSelectedRole!: Role;
 @Input() userId= ''
 @Output() openServiceTeamListPopup = new EventEmitter<boolean>();
 @Input()selectedServiceRoleList:SELECTED_SERVICE_ROLE_LIST={
  selectedServiceTeam: [],
  selectedServiceRoleList:[],
}
@Output() backOnCallClickedEvent = new EventEmitter<Event>();
@Output() callPopupBackClickedEvent = new EventEmitter<Event>();
  @Input() userData: User | null = null;
  @Input()
  userProfileResponse!: profileResponse;
  @Input() userDataFromMessenger: Users | null = null;
  public maxLength = 27;
  public DEFAULT_DAYS_OF_WEEK = DEFAULT_DAYS_OF_WEEK;
  public currentDate = "";
  
 
  @Input() public openOnCallPopup = false;
  constructor(
    private serviceTeamsService:ServiceTeamsService ,
    private cookieService: CookieService,
    private dateTimePipe:DateTimePipe,
    private inboxHelperSvc: InboxHelperService,
    authService: AuthService,
    private convertDateAndTimePipe : ConvertDateAndTimePipe,
    dateUtilSvc: DateUtilsService
  ) { 
    super(authService, dateUtilSvc)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['openOnCallPopup']){
    this.showOnCallPopup = true;
  }
  this.onCallPopUpState.selectedToDate = '';
  this.onCallPopUpState.selectedFromDate = '';
  if (this.selectedServiceRoleList) {
    const recurring = this.selectedServiceRoleList.selectedServiceTeam.map(list => list.recurring);
    if (recurring.length && this.selectedServiceRoleList.selectedServiceTeam[0]?.recurring) {
      this.showSelectedDaysOfWeek = true;
      this.onCallPopUpState.selectedRadio = recurring ? 'repeating' : '';
      this.getSelectedRoleValue = (this.getSelectedRoleValue || [])
        .map(role => role).filter(roleArray => roleArray !== undefined).flat() as string[];
      const fromDate = this.selectedServiceRoleList.selectedServiceTeam[0].start;
      let onEditFromDate = this.dateUtilSvc.changeTimezone(fromDate);
      onEditFromDate = this.dateUtilSvc.DateFormat(onEditFromDate);
      this.fromDate = onEditFromDate;
      const toDate = this.selectedServiceRoleList.selectedServiceTeam[0]?.end;
      let onEditToDate = toDate?.length? this.dateUtilSvc.changeTimezone(toDate): "";
      onEditToDate = this.dateUtilSvc.DateFormat(onEditToDate);
      this.toDate = onEditToDate;
      this.fromTime = this.formatTime(this.selectedServiceRoleList.selectedServiceTeam, 'start_time');
      this.toTime = this.formatTime(this.selectedServiceRoleList.selectedServiceTeam, 'end_time');
      const daysOfWeek = this.selectedServiceRoleList.selectedServiceTeam.map(selectedDaysOfWeek => selectedDaysOfWeek.recurring?.days);
      // Convert daysOfWeek to the expected format
      const convertedDaysOfWeek = daysOfWeek.flat().map((dayValue) => {
        return { label: this.DEFAULT_DAYS_OF_WEEK[dayValue!].label, value: dayValue?.toString() || '' };
      });
      this.onCallPopUpState.selectedDaysOfWeekVal = convertedDaysOfWeek || null;
      this.enableSaveButton = true;
    }
    if (!this.selectedServiceRoleList.selectedServiceTeam[0]?.recurring && this.selectedServiceRoleList.selectedServiceTeam.length) {
      this.onCallPopUpState.selectedRadio = !this.selectedServiceRoleList.selectedServiceTeam[0]?.recurring ? 'oneTime' : '';
      this.getSelectedRoleValue = (this.getSelectedRoleValue || [])
        .map(role => role)
        .filter(roleArray => roleArray !== undefined)
        .flat() as string[];
      const fromDate = this.selectedServiceRoleList.selectedServiceTeam.map(fromDateVal => fromDateVal.start).join(', ');
      let onEditFromDate = this.dateUtilSvc.changeTimezone(fromDate);
      onEditFromDate = this.dateUtilSvc.DateFormat(onEditFromDate)
      this.fromDate = onEditFromDate;
      const toDate = this.selectedServiceRoleList.selectedServiceTeam.map(fromDateVal => fromDateVal.end).join(', ');
      let onEditToDate = this.dateUtilSvc.changeTimezone(toDate);
      onEditToDate = this.dateUtilSvc.DateFormat(onEditToDate);
      this.toDate = onEditToDate;
      const fromTime = this.selectedServiceRoleList.selectedServiceTeam[0].start;
      this.fromTime = this.dateTimePipe.transform(fromTime)?.split(',')[0] || null;
      const toTime = this.selectedServiceRoleList.selectedServiceTeam[0]?.end ? this.selectedServiceRoleList.selectedServiceTeam[0]?.end : '';
      this.toTime = this.dateTimePipe.transform(toTime)?.split(',')[0] || null;
      this.enableSaveButton = true;
    }
  }}

  ngOnInit(): void {
    this.currentDate = this.dateUtilSvc.formatDate(new Date());
    this.toDateMinValue = this.currentDate;
    this.inboxHelperSvc.user$.subscribe(( currentUser) => {
        this.loggedInUserDetails = currentUser;
      })
    this.getServiceTeamScheduleHeading();
    this.validDays();
  }

  public getServiceTeamScheduleHeading():void {
    this.authSubscription = this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {        
        this.authResponse = data;
        const firstName = this.userData?.first_name || this.userProfileResponse?.profile?.first_name || data?.user?.first_name;
        this.onCallPopUpState.showServiceTeamScheduleHeading = `${firstName}'s Service Teams Schedule`;
      }
    );
  }
  public onRadioChange(value: string):void {
    this.onCallPopUpState.selectedRadio = value;
    this.onCallPopUpState.showFromTimeSuggestions = false;
    this.onCallPopUpState.showToTimeSuggestions = false;
    if(value === 'repeating'){
      this.onCallPopUpState.selectedFromDate = ''
      this.onCallPopUpState.selectedToDate = ''; 
      this.validDays();
    }
  }

  public convertDaysOfWeekToNumberArray(selectedDaysOfWeek: string | string[]): number[] {
    if (Array.isArray(selectedDaysOfWeek)) {
      // Join the array into a string
      selectedDaysOfWeek = selectedDaysOfWeek.join(',');
    }
    const daysArray = selectedDaysOfWeek.split(',').map(Number);
    return daysArray;
  }

//showSelectedDaysOfWeek is true when you click on edit of recurring otherwise goes on else condition and select selectedDaysOfWeek
  public toggleDaySelection(day: string):void {
   if(this.showSelectedDaysOfWeek) {
   this.onCallPopUpState.temprarySelectedDaysOfWeek.includes(day)? this.onCallPopUpState.temprarySelectedDaysOfWeek.filter(selectedDay => day!== selectedDay): this.onCallPopUpState.temprarySelectedDaysOfWeek.push(day);
    this.onCallPopUpState.selectedDaysOfWeek = this.onCallPopUpState.selectedDaysOfWeekVal.map(selectedDay => selectedDay.value).filter(dayValue => day!==dayValue);
    this.onCallPopUpState.selectedDaysOfWeek = this.onCallPopUpState.selectedDaysOfWeek.filter(selecteDay => !this.onCallPopUpState.temprarySelectedDaysOfWeek.includes(selecteDay));
   } else {
    if (this.onCallPopUpState.selectedDaysOfWeek.includes(day)) {
      this.onCallPopUpState.selectedDaysOfWeek = this.onCallPopUpState.selectedDaysOfWeek.filter(
        (selectedDay) => selectedDay !== day
      );
    } else {
      this.onCallPopUpState.selectedDaysOfWeek.push(day);
    }
  }
}

  public isSaveDisabled():boolean{
    if (this.onCallPopUpState.selectedRadio === 'oneTime') {
      return !((this.onCallPopUpState.selectedFromDate  &&this.onCallPopUpState.selectedFromTimeSlot && this.onCallPopUpState.selectedToDate && this.onCallPopUpState.selectedToTimeSlot)|| (this.fromDate && this.toDate && this.toTime && this.fromTime));
    } else if (this.onCallPopUpState.selectedRadio === 'repeating') {
      return !((this.onCallPopUpState.selectedFromDate && this.onCallPopUpState.selectedDaysOfWeek.length && this.onCallPopUpState.selectedFromTimeSlot && this.onCallPopUpState.selectedToTimeSlot) || (this.fromDate && this.toTime && this.fromTime)
      );
    }
    return false;
  }

  public saveOnCallSchedule(): void {
    let userData: any;
    let isUserProfile: boolean;

    if (this.userProfileResponse) {
        userData = this.userProfileResponse.profile;
        isUserProfile = true;
    } else if (this.userDataFromMessenger?._id) {
        userData = this.userDataFromMessenger;
        isUserProfile = false;
    } else {
        userData = this.userData;
        isUserProfile = false;
    }

    if (this.onCallPopUpState.selectedRadio === 'addToTeams') {
        this.updateStatus(userData);
    } else {
        this.createShifts();
    }
}

private updateStatus(userData: any): void {  
        this.subscription = this.serviceTeamsService.shiftsData$.subscribe(
            (shifts: Shift[]) => {
                this.scheduler_type = shifts.length > 0 ? shifts[0].scheduler_type : '';
                const updateObject: UserUpdateStatus = {
                    status: userData?.status?.s ?? '',
                    role: this.getSelectedRoleValue,
                    coverage: userData?.status?.c?.ref,
                    away_message: userData?.status?.away_message,
                    away_message_mode: userData?.status?.away_message_mode ?? '',
                    scheduler_type: this.scheduler_type ? this.scheduler_type : 'manual',
                    removed_manual_role: this.storeSelectedRole?.description,
                    user_id: this.userId ? this.userId : userData?._id?.$oid,
                };
                this.serviceTeamsService.usersUpdateStatus(updateObject).subscribe(
                    (userStatusResponse: UpdateStatusResponse) => {
                        this.onCallPopUpState.updateStatusResponseData = userStatusResponse;
                        this.showOnCallPopup = false;
                        this.backOnCallClickedEvent.emit();
                    }
                );
            }
        );
}

  public createShifts(): void {    
    if(this.onCallPopUpState.selectedRadio === "repeating") {
      this.startDateAndTime = this.dateUtilSvc.formatDateToCustomString(this.fromDate)
      this.endDateAndTime = this.toDate === ""? "Invalid date": this.dateUtilSvc.formatDateToCustomString(this.toDate);
    } else {
      this.startDateAndTime = this.convertDateAndTimePipe.transform(this.fromDate, 'convertToUTCFormat', this.fromTime? this.fromTime: "");
      this.endDateAndTime = this.convertDateAndTimePipe.transform(this.toDate, 'convertToUTCFormat', this.toTime? this.toTime: "");
      this.startDateAndTime = this.startDateAndTime ? this.dateUtilSvc.formatDateToCustomString(this.startDateAndTime.toString()): '';
      this.endDateAndTime = this.endDateAndTime? this.dateUtilSvc.formatDateToCustomString(this.endDateAndTime.toString()): '';
    }
    const formData:CreateShiftRequest = {
      start: this.startDateAndTime, end: this.endDateAndTime?? null, roles: this.getSelectedRoleValue, user_id:this.userId ? this.userId : this.userData?._id?.$oid
    };
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) {
      formData.a =  aCookieValue;
    }
    if (this.onCallPopUpState.selectedRadio === "repeating") {
      const recurring: Recurring = {
        start_time: this.convertDateAndTimePipe.transform(this.fromTime? this.fromTime: "", 'convert12HourTo24Hour'),
        end_time: this.convertDateAndTimePipe.transform(this.toTime? this.toTime: "", 'convert12HourTo24Hour'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        days: this.onCallPopUpState.selectedDaysOfWeek.length? this.convertDaysOfWeekToNumberArray(this.onCallPopUpState.selectedDaysOfWeek.join(',')): this.selectedServiceRoleList.selectedServiceTeam[0]?.recurring?.days,
      };
      formData.recurring = recurring
    }
    // If you edit the exiting team, so call update shift api else create shift
    if(this.selectedServiceRoleList.selectedServiceTeam.length) {
      const selectedTeamId = this.selectedServiceRoleList.selectedServiceTeam[0]?.id;
      this.serviceTeamsService.updateShifts(formData, selectedTeamId).subscribe((data: createShiftResponse) => {
        this.shiftsResponseData(data);
      })
    } else {
      this.serviceTeamsService.createShifts(formData).subscribe((data: createShiftResponse) => {
        this.shiftsResponseData(data);
      })
    }
  }

  public shiftsResponseData(data: createShiftResponse) {
    this.onCallPopUpState.createShiftResponseData = data;
      this.onCallPopUpState.isErrorStatus = data.status === 'error';      
      this.showOnCallPopup = false;
      this.callPopupBackClickedEvent.emit();
  }
  
  public openServiceListModal(event: Event){
    event?.stopPropagation();
    this.showOnCallPopup = false;
    this.openServiceTeamListPopup.emit(true);
  }
 
  public closeErrorPopup(): void {
    this.onCallPopUpState.isErrorStatus = !this.onCallPopUpState.isErrorStatus;
  }

  public closeOnCallPopup(event: Event): void{
    event?.stopPropagation();
    this.showOnCallPopup = false;
    this.backOnCallClickedEvent.emit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}