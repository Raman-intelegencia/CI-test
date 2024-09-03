import { AuthService, DateUtilsService, UpdateStatusResponse, Users, UsersAuthResponse, createShiftResponse } from '@amsconnect/shared';
import { formatDate } from '@angular/common';
import { Subscription } from "rxjs";
import { DEFAULT_DAYS_OF_WEEK } from './daysOfWeek';

export class OnCallPopUpClass {
  public authSubscription: Subscription = new Subscription();
  public onCallPopUpClassState = {
    showServiceTeamScheduleHeading: '',
    validDays: [] as string[],
    selectedFromDate: '',
    selectedToDate: '',
  };
  public fromDate ='' ;
  public toDate = '';
  public fromTime!: string | null;
  public toTime!:string|null;
  public showSelectedDaysOfWeek = false
  public enableSaveButton = false;
  public showOnCallPopup = true;
  public authResponse!: UsersAuthResponse;
  public loggedInUserDetails!: Users | null;
  public scheduler_type: string | undefined;
  public subscription: Subscription = new Subscription();

  public onCallPopUpState = {
    selectedRoles: [] as string[],
    selectedRadio: "addToTeams",
    currentDate: new Date().toISOString().split("T")[0],
    selectedFromDate: '',
    selectedToDate: '',
    toDateDisabled: true,
    allTimeSlots: this.generateTimeSlots(),
    selectedFromTimeSlot: "",
    selectedToTimeSlot: "",
    showFromTimeSuggestions: false,
    showToTimeSuggestions: false,
    selectedDaysOfWeek: [] as string[],
    temprarySelectedDaysOfWeek:[] as string[],
    validDays: [] as string[],
    showServiceTeamScheduleHeading: '',
    updateStatusResponseData: {} as UpdateStatusResponse,
    createShiftResponseData: {} as createShiftResponse,
    isErrorStatus: false,
    daysOfWeek: null,
    selectedDaysOfWeekVal:[{ label: '', value: '' }] || DEFAULT_DAYS_OF_WEEK
  };
  public toDateMinValue = "";
  public startDateAndTime!: string | Date | null;
  public endDateAndTime!: string | Date | null;

  constructor(
    public authService: AuthService,
    public dateUtilSvc: DateUtilsService
    ) {}

  public formatDate(data: any[], property: string): string {
    return data.map(item => item[property]).filter(val => typeof val === 'string').join(', ').split('T')[0];
  }
  
  public formatTime(data: any[], property: string): string {
    return this.convertTime(data.map(item => item.recurring[property]).filter(val => typeof val === 'string').join(', '));
  }
  
  public convertTime(time: string): string {
    const date = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes);
    // Format the date using formatDate utility
    return formatDate(date, "h:mm a", "en-US");
  }

  public convertToISOFormat(date: string):string{
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${month}-${day}-${year}`;
  }
  

  public generateTimeSlots(): string[] {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      // eslint-disable-next-line prefer-const
      for (let minute of ["00", "30"]) {
        const amPm = hour < 12 ? "AM" : "PM";
        const formattedHour = (hour % 12 || 12).toString().padStart(2, "0"); // Add leading zero
        options.push(`${formattedHour}:${minute} ${amPm}`);
      }
    }
    return options;
  }

  public fromDateChange(): void {
    if (this.fromDate) {
      // Directly use this.fromDate as it's already in 'YYYY-MM-DD' format
      this.onCallPopUpState.selectedFromDate = this.fromDate;
      // Reset and configure the 'to' date picker based on the new 'from' date
      this.resetToDatePicker();
      this.toDateMinValue = this.dateUtilSvc.formatDate(new Date(this.fromDate));
      // Additional logic for 'from' time picker
      if (this.onCallPopUpState.selectedRadio !== "repeating") {
        this.resetTimePickers();
      }
      // Clear the selected 'to' date and recompute valid days
      this.onCallPopUpState.selectedToDate = '';
      this.validDays();
    }
  }

  public toDateChange():void{
    if(this.toDate){
      this.onCallPopUpState.selectedToDate = this.toDate;
      if (this.onCallPopUpState.selectedRadio !== "repeating") {
          this.toTime = "";
      }
      this.validDays();
    }
  }
  
  private resetToDatePicker(): void {
    this.toDate = ''; // Clear the 'to' date model
    // this.toDateConfig.min = this.onCallPopUpState.selectedFromDate;
    // this.toDateConfig = { ...this.toDateConfig };
    this.onCallPopUpState.toDateDisabled = false;
  }
  
  private resetTimePickers(): void {
    // this.fromTimePicker.nativeElement.value = "";
    // this.toTimePicker.nativeElement.value = "";
    this.fromTime = "";
    this.toTime ="";
  }

  public validDays():void {
    this.onCallPopUpState.validDays = this.computeDaysInRange();
  }

  public computeDaysInRange(): string[] {
    this.onCallPopUpState.validDays = []; // Clear previous data
    // If toDate is not set, return all days.
    if (!this.onCallPopUpState.selectedFromDate || !this.onCallPopUpState.selectedToDate) {      
      return ['0', '1', '2', '3', '4', '5', '6'];
    }
    const fromDate = new Date(this.onCallPopUpState.selectedFromDate);
    const toDate = new Date(this.onCallPopUpState.selectedToDate);
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      // Convert Sunday to 1, Monday to 2, and so on up to Saturday as 7
      const dayValue = String(d.getDay());
      if (!this.onCallPopUpState.validDays.includes(dayValue)) {
        this.onCallPopUpState.validDays.push(dayValue);
      }
    }
    return this.onCallPopUpState.validDays;
  }
  // Handle from time slot selection
  public selectFromTime(timeSlot: string,event:Event): void {
    event?.stopPropagation();
    this.fromTime = timeSlot;
    this.onCallPopUpState.selectedFromTimeSlot = timeSlot;
    this.onCallPopUpState.showFromTimeSuggestions = false;
  }
  // Handle to time slot selection
  public selectToTime(timeSlot: string,event:Event): void {
    event?.stopPropagation();
    this.toTime = timeSlot;
    this.onCallPopUpState.selectedToTimeSlot = timeSlot;
    this.onCallPopUpState.showToTimeSuggestions = false;
  }

  public trackByRoleId(index: number, role: string): number {
    return index;
  }
}