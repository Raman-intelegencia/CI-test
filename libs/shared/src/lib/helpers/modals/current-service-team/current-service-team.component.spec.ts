import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { CurrentServiceTeamComponent } from "./current-service-team.component";
import { OtpService, Shift, UserProfileService } from "@amsconnect/shared";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe('CurrentServiceTeamComponent', () => {
  let component: CurrentServiceTeamComponent;
  let fixture: ComponentFixture<CurrentServiceTeamComponent>;
  let mockUserProfileService: Partial<UserProfileService>;
  let mockOtpService: Partial<OtpService>;
  const mockShiftsResponse: Shift[] = [
    {
      currently_active: false,
      end: "",
      id: "64be1e88f882b10a73fb3ddf",
      role_types: ["restricted"],
      roles: ["Restricted 1111"],
      start: "",
      time_updated: "",
      scheduler_type: "",
      recurring: {
        timezone: "",
        start_time: "",
        end_time: "",
        days: [],
      },
    },
  ];

  beforeEach(async () => {
    mockUserProfileService = {
      shifts: jest.fn().mockReturnValue(of(mockShiftsResponse)),
      shiftsAuto: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [CurrentServiceTeamComponent],
      providers: [
        { provide: UserProfileService, useValue: mockUserProfileService }
      ]
    }).compileComponents();

    mockOtpService = {
      authUser: {
        first_name: "MockFirstName",
        access_group_actions_map: [],
        admin: [],
        auto_schedule: "",
        cache_key: "",
        cell_phone: "",
        cellphone_verify: false,
        date_last_login: [],
        email: "",
        email_comm: false,
        flag_active: false,
        has_password: false,
        image_id: "",
        inst_migrating: false,
        is_initial_password: false,
        is_temp_password: false,
        journal_id: 0,
        last_name: "",
        num_bad_pins: 0,
        phi_iids: [],
        pin: "",
        profile: {
          dept: "",
          iid: "",
          iname: "",
          ishort: "",
          pager_number: "",
          title: "",
        },
        properties: [],
        sms_comm: false,
        status: {
          s: "",
          r: [],
          r_type: [],
          away_message_mode: "",
          is_signed_out: false,
        },
        _id: { $oid: "" },
        flag_basic: false,
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        CurrentServiceTeamComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentServiceTeamComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should toggle scheduling", () => {
    (
      mockUserProfileService.shiftsAuto as jest.Mock<Observable<any>>
    ).mockReturnValue(of({ auto_schedule: "on" }));
    expect(component.schedulingcheckBox).toBe(false);
    expect(component.schedulingcheckBoxVal).toBe("on");
  });

  it("should fetch shifts data", () => {
    jest
      .spyOn(mockUserProfileService, "shifts")
      .mockReturnValue(of({ shifts: mockShiftsResponse }));
    component.shifts();
  });

  it("should populate shiftsData on shifts call", () => {
    jest
      .spyOn(mockUserProfileService, "shifts")
      .mockReturnValue(of({ shifts: mockShiftsResponse }));
    component.shifts();
    expect(component.shiftsData).toBeInstanceOf(Array<Shift>);
    expect(component.schedulingcheckBoxVal).toBe("on");
    expect(component.scheduledServiceTeam).toBeInstanceOf(Array<Shift>);
    expect(component.currentServiceTeam).toBeInstanceOf(Array<Shift>);
  });

  it("should hide the service team popup", () => {
    component.backToProfilePopup();
    expect(component.schedulingcheckBoxVal).toBe("");
    expect(component.currentServiceTeam).toEqual([]);
    expect(component.scheduledServiceTeam).toEqual([]);
  });
  it("should convert time correctly", () => {
    const iso8601Time = "14:00";
    const formattedTime = component.convertTime(iso8601Time);
    expect(formattedTime).toEqual("2:00 PM");
  });
});
