import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleNewStatusPopupComponent } from './schedule-new-status-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConvertDateAndTimePipe, Reference } from '@amsconnect/shared';
import { ScheduledStatusService } from '../../services/schedule-status.service';
import { ScheduleStatus } from '../../models/schedule-status.model';
import { ProfileStatusDropdownService } from '../../services/profile-status-dropdown.service';

describe('ScheduleNewStatusPopupComponent', () => {
  let component: ScheduleNewStatusPopupComponent;
  let fixture: ComponentFixture<ScheduleNewStatusPopupComponent>;
  let scheduledStatusService: ScheduledStatusService;
  let httpTestingController: HttpTestingController;
  let profileStatusDropdown: ProfileStatusDropdownService;
  const errorMessage = 'An error occurred';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduleNewStatusPopupComponent],
      imports: [HttpClientModule, TranslateModule.forRoot(), HttpClientTestingModule,],
      providers: [ConvertDateAndTimePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleNewStatusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    scheduledStatusService = TestBed.inject(ScheduledStatusService);
    httpTestingController = TestBed.inject(HttpTestingController);
    profileStatusDropdown = TestBed.inject(ProfileStatusDropdownService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('save the new scheduled status', () => {
    const userScheduleStatus: ScheduleStatus = {
      user_id: "ekjneke",
      status: "busy",
      duration: "custom",
      start_date: "2024-02-27T06:30:00.000Z",
      end_date: "2024-02-29T07:30:00.000Z",
      coverage: "8734933r843r3hr",
      away_message_mode: "busy",
      away_message: "I am busy. Covered by bhawana dubey",
    }
    let dummyData = {
      "status": "ok",
    };
    scheduledStatusService.saveScheduleStatus(userScheduleStatus).subscribe(data => {
      expect(data).toEqual(dummyData);
    },
      error => {
        expect(error).toEqual(errorMessage);
      });
  })

  it('set selected status', () => {
    const status = "busy";
    if (status && !component.setselectedStatus?.includes(status)) {
      component.setselectedStatus?.push(status);
      component.autoResponse = status === 'busy' ? `I am busy. ` : `I am off duty.`
    }
  });

  it('select start time', () => {
    component.fromTime = "2:30 PM";
    component.onCallPopUpState.selectedFromTimeSlot = "2:30 PM";
    component.onCallPopUpState.showFromTimeSuggestions = false;
    if (component.fromTime) {
      component.updateSubmitButtonStyle();
    }
  });

  it('select end time', () => {
    component.toTime = "5:30 PM";
    component.onCallPopUpState.selectedToTimeSlot = "5:30 PM";
    component.onCallPopUpState.showToTimeSuggestions = false;
    if (component.toTime) {
      component.updateSubmitButtonStyle();
    }
  });


  it('should set errorMessage if endDate is before startDate', () => {
    component.scheduledStatusForm.get('start_date')?.setValue('2024-02-10');
    component.scheduledStatusForm.get('end_date')?.setValue('2024-02-09');
    component.updateSubmitButtonStyle();
    expect(component.errorMessage).toBe('Please enter valid date.');
  });


  it('should enable submit button if all conditions are met', () => {
    component?.scheduledStatusForm?.get('start_date')?.setValue('2024-02-10');
    component.scheduledStatusForm.get('end_date')?.setValue('2024-02-11');
    component.fromTime = '08:00';
    component.toTime = '12:00';
    component.scheduledStatusForm.get('status')?.setValue('someStatus');
    component.updateSubmitButtonStyle();
    expect(component.isEnableSubmit).toBe(true);
  });

  it('should disable submit button if any condition is not met', () => {
    // In this case, not setting values for start_date, end_date, fromTime, toTime, and status
    component.updateSubmitButtonStyle();
    expect(component.isEnableSubmit).toBe(false);
  });
});
