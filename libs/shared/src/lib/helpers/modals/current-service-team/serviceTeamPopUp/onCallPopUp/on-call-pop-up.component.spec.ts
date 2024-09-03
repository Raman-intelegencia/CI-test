import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnCallPopUpComponent } from "./on-call-pop-up.component";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import { OtpService } from "@amsconnect/shared";
import { ServiceTeamsService } from "libs/shared/src/lib/services/service-teams.service";

describe("OnCallPopUpComponent", () => {
  let component: OnCallPopUpComponent;
  let fixture: ComponentFixture<OnCallPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnCallPopUpComponent, HttpClientModule,  TranslateModule.forRoot()],
      providers:[ServiceTeamsService, {
        provide: OtpService,
        useValue: {
          authUser: { first_name: '' }, // Provide a mock value here
        },
      },]
    }).compileComponents();

    fixture = TestBed.createComponent(OnCallPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should generate time slots', () => {
    const timeSlots = component.generateTimeSlots();
    expect(timeSlots.length).toBeGreaterThan(0);
    // For example, if you want to check the format of generated time slots:
    const pattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    timeSlots.forEach(timeSlot => {
      expect(pattern.test(timeSlot)).toBe(true);
    });
  });

  it('should convert 12-hour times to 24-hour format', () => {
    const testCases = [
      { input: '12:00 AM', expected: '00:00' },
      { input: '12:00 PM', expected: '12:00' },
      { input: '06:30 AM', expected: '06:30' },
      { input: '09:45 PM', expected: '21:45' },
    ];
  
   
  });

});
