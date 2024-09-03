import { DELETE_SHIFT_RESPONSE, Shift, DayOfWeekDisplayPipe, ModalComponent, SelectedThreadHelperService,ServiceTeamPopUpComponent, DateTimePipe, ServiceTeamsHelperService, ServiceTeamsService, UserProfileService } from "@amsconnect/shared";
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { profileResponse } from "../../../../models/profile.model";
import { TimeFormatPipe } from "../../../../pipes/time-format-pipe.pipe";
const SCHEDULAR_TYPE =
{
  MANUAL_SCHEDULER: 'manual',
};
@Component({
  selector: "web-messenger-current-scheduled-service-team",
  templateUrl: "./current-scheduled-service-team.component.html",
  styleUrls: ["./current-scheduled-service-team.component.scss"],
  standalone: true,
  imports: [
    DateTimePipe,
    ServiceTeamPopUpComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DayOfWeekDisplayPipe,
    ModalComponent,
    TimeFormatPipe
  ],
})
export class CurrentScheduledServiceTeamComponent implements OnInit {
  @Input() shiftsData: Shift[] = [];
  @Input() public scheduledServiceTeam: Shift[] = [];
  @Input() currentServiceTeam: Shift[] = [];
  public showServiceTeamList = false;
  public selectedServiceRoleList: Shift[] = [];
  public closeDeleteScheduledPopup = false;
  public selectedScheduledServiceRoleList: Shift[] = [];
  public showSelectedScheduledServiceTeamsList = false;
  public showDeleteModal = false;
  public showErrorMessage = "";
  @Input() userId = "";
  public selectedUserId = "";
  @Input()
  public userProfileResponse!: profileResponse;
  @Input()
  selectedChatIds!: {
    selectedProfileUserId: string;
    selectedProfileThreadId: string;
  };
  @Input() showEnterServiceSchedule = false;
  public selectedCurrentShiftId = '';
  public selectedScheduledShiftId = '';
  public schedularType = SCHEDULAR_TYPE.MANUAL_SCHEDULER;
  public isUserProfileModal = true;
  public showScheduledServiceTeamQgenda: { [key: string]: boolean } = {};
  public showCurrentServiceTeamQgenda: { [key: string]: boolean } = {};
  constructor(
    private serviceTeamService: ServiceTeamsService,
    public serviceTeamHelperService: ServiceTeamsHelperService,
    private userProfileService: UserProfileService,
    private translateService: TranslateService, public cd: ChangeDetectorRef,
    private selectedThreadHelperService: SelectedThreadHelperService
  ) {
    this.translateService.setDefaultLang("en");
  }
  ngOnInit(): void {
    // this.shifts();
  }

  public closeDeletePopup(): void {
    this.showDeleteModal = false;
    this.showErrorMessage = "";
  }

  public openDeleteCSTModal(id: string): void {
    this.selectedCurrentShiftId = id;
    this.showDeleteModal = true;
  }

  public editCurrentServiceTeam(roles: string[] | undefined, type: string | undefined,shiftId:string): void {
    if (type === 'manual') {
      this.isUserProfileModal = true;
      this.selectedThreadHelperService.setFlagToCallShifts(true);
      this.selectedServiceRoleList = [];
      this.showServiceTeamList = true;
      this.showSelectedScheduledServiceTeamsList = false;
      const selectedServiceTeam = this.shiftsData.find(
        (serviceTeamName) => serviceTeamName.id === shiftId
      ); 
      // Assign the selected service team or an empty array to this.selectedServiceRoleList
      this.selectedServiceRoleList = selectedServiceTeam
        ? [selectedServiceTeam]
        : [];
    } else {
      this.editScheduledServiceTeamList(roles,shiftId, true);
    }
  }
  public editScheduledServiceTeamList(roles: string[] | undefined,shift_id:string, schedular_type?: boolean): void {
    this.isUserProfileModal = true;
    this.selectedServiceRoleList = [];
    this.showSelectedScheduledServiceTeamsList = true;
    this.showServiceTeamList = false;
    // Find the selected service team based on some condition
    // if schedular_type true when SST comes from CST(scheduling on) else schedule_type value is undefined
    let selectedServiceTeam: Shift | [] | undefined = []
   selectedServiceTeam = this.shiftsData.find((serviceTeamName) => serviceTeamName.id === shift_id);

    // Assign the selected service team or an empty array to this.selectedScheduledServiceRoleList
    this.selectedScheduledServiceRoleList = selectedServiceTeam
      ? [selectedServiceTeam]
      : [];
  }

  public closeSchdeuledDeletePopup(): void {
    this.closeDeleteScheduledPopup = false;
  }
  public openDeleteSSTModal(id: string): void {
    this.closeDeleteScheduledPopup = true;
    this.selectedScheduledShiftId = id;
  }
  public deleteScheduledServiceTeam(): void {    
    if (this.selectedScheduledShiftId) {
      this.serviceTeamService
        .deleteSelectedShifts(
          this.selectedScheduledShiftId,
          this.userId ? this.userId : this.selectedChatIds?.selectedProfileUserId
        )
        .subscribe((deleteSelectedShift: DELETE_SHIFT_RESPONSE) => {
          this.scheduledServiceTeam = this.scheduledServiceTeam.filter(
            (team) => team.id !== this.selectedScheduledShiftId
          );
          this.showErrorMessage =
            deleteSelectedShift.status === "error"
              ? deleteSelectedShift?.message || ""
              : "";
          this.selectedScheduledShiftId = '';
          this.closeDeleteScheduledPopup = false;
        });
    }
  }

  public backToFirstServiceTeamScreen(): void {
    this.showServiceTeamList = false;
    this.showSelectedScheduledServiceTeamsList = false;
    this.shifts();
  }

  public shifts(): void {
    this.userProfileService
      .shifts(
        this.userId ? this.userId : this.selectedChatIds?.selectedProfileUserId
      )
      .subscribe((shiftsResponse) => {
        this.shiftsData = shiftsResponse.shifts || [];
        this.selectedUserId = this.userProfileResponse?.references?.[0]
          ? this.userProfileResponse?.references[0]?.id
          : "";
        
        this.scheduledServiceTeam = this.shiftsData.filter(
          (shift: Shift) => shift.currently_active === false
        );

        this.currentServiceTeam = this.shiftsData.filter(
          (shift: Shift) => shift.currently_active === true
        );
      });
  }


  public deleteCurrentServiceTeam(): void {
    if (this.selectedCurrentShiftId) {
      this.serviceTeamService
        .deleteSelectedShifts(this.selectedCurrentShiftId, this.userId ? this.userId : this.selectedChatIds?.selectedProfileUserId
        )
        .subscribe((deleteSelectedShift) => {
          this.currentServiceTeam = this.currentServiceTeam.filter(team => team.id !== this.selectedCurrentShiftId);
          this.showErrorMessage =
            deleteSelectedShift.status === "error"
              ? deleteSelectedShift.message || ''
              : "";
          this.showDeleteModal = false;
          this.selectedCurrentShiftId = '';
        });
    }
  }
    
 public  trackByShiftId(index: number, shift: Shift): string {
  return shift?.id;
}
}
