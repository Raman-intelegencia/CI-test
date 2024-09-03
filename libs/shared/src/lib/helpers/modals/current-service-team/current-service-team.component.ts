import { AuthService,CommonService,CookieService,DayOfWeekDisplayPipe, DELETE_SHIFT_RESPONSE, ModalComponent, SettingsService, Shift, Users, UsersAuthResponse,} from '@amsconnect/shared';
import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ServiceTeamPopUpComponent } from './serviceTeamPopUp/service-team-pop-up.component';
import { CurrentServiceTeamClass } from './current-service-team-class';
import { UserProfileService } from '../../../services/messenger-services/user-profile.service';
import { ServiceTeamsService } from '../../../services/messenger-services/service-teams.service';
import { InboxHelperService } from '../../../services/messenger-services/inbox-helper.service';
import { ServiceTeamsHelperService } from '../../../services/messenger-services/service-team-helper.service';
import { SHIFTS } from '../../../models/profile.model';
import { DateTimePipe } from "../../pipes/date-time-pipe.pipe";
import { User } from '../../../models/users.model';
@Component({
    selector: 'web-messenger-current-service-team',
    templateUrl: './current-service-team.component.html',
    styleUrls: ['./current-service-team.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        DayOfWeekDisplayPipe,
        ModalComponent,
        ServiceTeamPopUpComponent,
        DateTimePipe
    ],
    providers:[DateTimePipe]
})
export class CurrentServiceTeamComponent extends CurrentServiceTeamClass implements OnInit, OnDestroy {
  @Input() showCurrentServiceTeam!: string[];
  @Input() userData: User | null = null;
  @Input() userDataFromMessenger: Users | null = null;
  @Output() closeServiceTeamEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() showServiceTeamPopUp = new EventEmitter(false);
  public shiftsData: Shift[] = [];
  public schedulingcheckBox = true;
  public showSchedulingCheckboxOffPopUpVal = true;
  public showServiceTeamScheduleHeading = '';
  private scheduleCheckBoxSubscription: Subscription = new Subscription();
  private authSubscription: Subscription = new Subscription();
  private autoScheduleSubscription: Subscription = new Subscription();
  public authResponse!: UsersAuthResponse;
  public showSelectedServiceTeamsList = false;
  public selectedServiceRoleList: Shift[] = [];
  public closeDeletePopup = false;
  public showErrorMessage = '';
  public selectedScheduledServiceRoleList: Shift[] = [];
  public showSelectedScheduledServiceTeamsList = false;
  public closeDeleteScheduledPopup = false;
  public hideTurnedOffCheckbox = false;
  public description  ="";
  // public isDeleting: boolean = false; // Flag to track if deletion is in progress
  constructor(
    private userProfileService: UserProfileService,
    cookieService: CookieService,
    private authService: AuthService,
    settingsService: SettingsService,
    private serviceTeamService: ServiceTeamsService,
    public serviceTeamHelperService: ServiceTeamsHelperService,
    commonService: CommonService,
    private inboxHelperSvc: InboxHelperService
  ) {
    super(settingsService,cookieService, commonService);
  }

  ngOnInit(): void {
    this.getServiceTeamScheduleHeading();
    this.inboxHelperSvc.fetchThreadsAndProfiles(false);
    this.schedulingcheckBox = this.userDataFromMessenger?.auto_schedule === 'on' ? true : false;
    this.scheduleCheckBoxSubscription = this.inboxHelperSvc.user$.subscribe(
      (state) => {
        this.schedulingCheckbox = state?.properties?.seen_coach_mark_scheduling_checkbox?.toString() ?? '';
        this.showtooltip = this.schedulingCheckbox === '1' ? false : true;
        this.showtooltip = this.schedulingCheckbox === '0' ? true : false;
      } 
    );    
    this.shifts();
  }

  public getServiceTeamScheduleHeading(): void {
    this.authSubscription = this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        this.authResponse = data;
      }
    );
    this.schedulingcheckBox =
      this.authResponse?.user?.auto_schedule === 'on' ||
      this.authResponse?.user?.auto_schedule === 'no_shifts';
    const first_name = this.authResponse?.user?.first_name;
    if (this.userData) {
      this.showServiceTeamScheduleHeading = `${this.userData?.first_name}'s Service Teams Schedule`;
    }
    else {
      this.showServiceTeamScheduleHeading = `${first_name}'s Service Teams Schedule`;
    }
  }
  // Toggle the scheduling checkbox on user action
  public toggleScheduling(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.hideTurnedOffCheckbox = target.checked;
    this.schedulingcheckBoxVal = this.hideTurnedOffCheckbox ? 'on' : 'off';
    this.autoShifts();
  }

  // Automatically trigger shifts update based on scheduling checkbox
  public autoShifts(): void {
    this.userProfileService
      .shiftsAuto(this.schedulingcheckBoxVal,this.userData?._id?.$oid)
      .subscribe((shiftsResponse) => {
        this.schedulingcheckBoxVal =
          shiftsResponse?.auto_schedule || shiftsResponse?.user?.auto_schedule;
          this.schedulingcheckBox = shiftsResponse?.user?.auto_schedule === 'on' ? true : false;
          if(this.userDataFromMessenger?.auto_schedule){
            this.userDataFromMessenger.auto_schedule = shiftsResponse?.user?.auto_schedule === 'on' ? 'on' : 'off';
          }
          if(this.userData?.auto_schedule){
            this.userData.auto_schedule = shiftsResponse?.user?.auto_schedule === 'on' ? 'on' : 'off';
          }
      });
  }

  // Fetch shifts data and categorize into scheduled and current service teams
  public shifts(): void {    
    this.shiftsApiCall = true;
    this.userProfileService?.shifts(this.userData?._id.$oid).subscribe((shiftsResponse: SHIFTS) => {
      if(shiftsResponse.status == 'ok'){
        this.shiftsData = shiftsResponse?.shifts || [];
        this.showSchedulingCheckboxOffPopUpVal = this.showSchedulingCheckboxOffPopUp;
        this.serviceTeamService.setShiftsData(this.shiftsData);
        this.schedulingcheckBoxVal = 'on';
        
        this.currentServiceTeam = this.shiftsData.filter((shift: Shift) => shift?.currently_active === true).map(shift => {
          const integratedService = shiftsResponse?.role_type.flatMap(role => role?.integrated).find(service => shift.roles?.includes(service.description) && service.tag);
          if (integratedService) {
            shift.tag = integratedService.tag;
          } 
          return shift;
        });

        this.scheduledServiceTeam = this.shiftsData.filter((shift: Shift) => shift?.currently_active === false).map(shift => {
          const integratedService = shiftsResponse?.role_type.flatMap(role => role?.integrated).find(service => shift.roles?.includes(service.description) && service.tag);
          if (integratedService) {
            shift.tag = integratedService.tag;
          } 
          return shift;
        });
        this.shiftsApiCall =false;
      }else{
        this.shiftsApiCall = false;
      }
    });
  } 

  // Convert time from string format to formatted display format
  public convertTime(time: string): string {
    const date = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    date.setHours(hours, minutes);
    // Format the date using formatDate utility
    return formatDate(date, 'h:mm a', 'en-US');
  }

  public showCurrentServiceTeamList(roles: string[] | undefined, type: string | undefined, shiftId: string): void {
    if (type === 'manual') {
      this.showCurrentServiceTeamPopup = false;
      this.showSelectedServiceTeamsList = true;
      this.showSelectedScheduledServiceTeamsList = false;   
      // Find the selected service team based on some condition
      const selectedServiceTeam = this.shiftsData.find(
        (serviceTeamName) => serviceTeamName.id === shiftId
      );     
      // Assign the selected service team or an empty array to this.selectedServiceRoleList
      this.selectedServiceRoleList = selectedServiceTeam
        ? [selectedServiceTeam]
        : [];
    } else {
      this.showScheduledServiceTeamList(roles,shiftId,true);
    }

  }
  public showScheduledServiceTeamList(roles: string[] | undefined, shift_id:string,schedular_type?: boolean): void {
    this.showCurrentServiceTeamPopup = false;
    this.showSelectedScheduledServiceTeamsList = true;
    this.showSelectedServiceTeamsList = false;
    // Find the selected service team based on some condition
    // if schedular_type true when SST comes from CST(scheduling on) else schedule_type value is undefined
    let selectedServiceTeam: Shift | [] | undefined = []
      selectedServiceTeam = this.shiftsData.find((serviceTeamName) => serviceTeamName.id === shift_id);
    // Assign the selected service team or an empty array to this.selectedScheduledServiceRoleList
    this.selectedScheduledServiceRoleList = selectedServiceTeam
      ? [selectedServiceTeam]
      : [];
  }

  public closeServiceTeamPopup(): void {
    this.showCurrentServiceTeamPopup = false;
    this.showServiceTeamPopUp.emit(false);
    this.closeServiceTeamEvent.emit();
  }

   // Hide the service team popup
   public backToProfilePopup(): void {
    this.showCurrentServiceTeamPopup = false;
    this.showServiceTeamPopUp.emit(false);
    this.closeServiceTeamEvent.emit();
  }
  public addServiceTeams(): void {
    this.selectedServiceRoleList = [];
    this.showSelectedServiceTeamsList = true;
  }

  public backToFirstServiceTeamScreen(): void {    
    this.showCurrentServiceTeamPopup = true;
    this.showSelectedServiceTeamsList = false;
    this.showSelectedScheduledServiceTeamsList = false;
    this.shifts();
  }
  public callPopupBackClickedEvent(): void {
    this.showCurrentServiceTeamPopup = true;
    this.showSelectedServiceTeamsList = false;
  }
  public openDeleteCSTModal(id: string): void {
    this.selectedCurrentShiftId = id;
    this.closeDeletePopup = true;
  }
  public deleteCurrentServiceTeam(): void {    
    if (this.selectedCurrentShiftId && !this.isDeleting) {
      this.isDeleting = true; // Set the flag to true to indicate deletion is in progress{
      this.serviceTeamService
        .deleteSelectedShifts(this.selectedCurrentShiftId,this.userData?._id.$oid)
        .subscribe((deleteSelectedShift) => {
          this.currentServiceTeam = this.currentServiceTeam.filter(
            (team) => team.id !== this.selectedCurrentShiftId
          );
          this.shiftsData = this.shiftsData.filter(
            (team) => team.id !== this.selectedCurrentShiftId
          );
          this.showErrorMessage =
            deleteSelectedShift.status === 'error'
              ? deleteSelectedShift.message || ''
              : '';
          this.closeDeletePopup = false;
          this.selectedCurrentShiftId = '';
          this.inboxHelperSvc.fetchThreadsAndProfiles(false);
          this.isDeleting = false; // Reset the flag after deletion is complete
        });
    }
  }

  public closeErrorPopup(): void {
    this.closeDeletePopup = false;
  }

  public closeSchdeuledDeletePopup(): void {
    this.closeDeleteScheduledPopup = false;
  }
  public openDeleteSSTModal(id: string): void {
    this.selectedScheduledShiftId = id;
    this.closeDeleteScheduledPopup = true;
  }
  public deleteScheduledServiceTeam(): void {
    if (this.selectedScheduledShiftId) {
      this.serviceTeamService
        .deleteSelectedShifts(this.selectedScheduledShiftId,this.userData?._id.$oid)
        .subscribe((deleteSelectedShift: DELETE_SHIFT_RESPONSE) => {
          this.scheduledServiceTeam = this.scheduledServiceTeam.filter(
            (team) => team.id !== this.selectedScheduledShiftId
          );
          this.shiftsData = this.shiftsData.filter(
            (team) => team.id !== this.selectedScheduledShiftId
          );
          this.showErrorMessage =
            deleteSelectedShift.status === 'error'
              ? deleteSelectedShift?.message || ''
              : '';
          this.selectedScheduledShiftId = '';
          this.closeDeleteScheduledPopup = false;
        });
    }
  }

  // unsubscribe the subscription to prevent data leaks
  ngOnDestroy(): void {
    this.scheduleCheckBoxSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
    this.autoScheduleSubscription.unsubscribe();
  }
}
