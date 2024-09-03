import { CommonService, CookieService, SettingsService, Shift } from "@amsconnect/shared";

const SCHEDULAR_TYPE = {
  MANUAL_SCHEDULER: 'manual',
};

enum Current_Service_team_Enum {
  On = 'on',
  Off = 'off',
  manual = 'manual'
}
enum Scheduling_Checkbox_Enum {
  one = '1',
}
export class CurrentServiceTeamClass {
  public schedularType = SCHEDULAR_TYPE.MANUAL_SCHEDULER;
  public showCurrentServiceTeamPopup = true;
  public scheduledServiceTeam: Shift[] = [];
  public currentServiceTeam: Shift[] = [];
  public schedulingcheckBoxVal: 'on' | 'off' = 'on';
  public schedulingCheckbox = "0";
  public selectedCurrentShiftId = '';
  public selectedScheduledShiftId = '';
  public schedulingCheckboxValue = Scheduling_Checkbox_Enum.one;
  public showSchedulingCheckboxOffPopUp = true;
  public off = Current_Service_team_Enum.Off;
  public manual = Current_Service_team_Enum.manual;
  public showtooltip = false;
  public aCookieValue = this.cookieService.getCookie('a');
  public shiftsApiCall = false;
  public isDeleting = false;
  constructor
  (
    public settingsService: SettingsService,
     public cookieService: CookieService, public commonService: CommonService,) { }
  public closeTooltip(): void {
    this.showtooltip = false;
    const formData = new FormData();
    formData.append('key', 'seen_coach_mark_scheduling_checkbox');
    formData.append('value', '1');
    if (this.aCookieValue) {
      formData.append('a', this.aCookieValue);
    }
    this.settingsService.setUserProperty(formData).subscribe();
    let schedulingCheckboxValue: FormDataEntryValue | null = formData.get('value');
    if (schedulingCheckboxValue !== null && !isNaN(Number(schedulingCheckboxValue))) {
      this.commonService.setSchedulingCheckbox(Number(schedulingCheckboxValue));
    }
  }

  public showSchedulingOffCheckBoxPopUpChanged(): void { 
    this.showSchedulingCheckboxOffPopUp = !this.showSchedulingCheckboxOffPopUp;
  }
  
  public  trackByShiftId(index: number, shift: Shift): string {
    return shift.id; // Return a unique identifier for each shift

  }
}
