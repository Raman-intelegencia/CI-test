import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduledStatusPopupComponent } from './scheduled-status-popup.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScheduledStatusService } from '../../services/schedule-status.service';
import { AuthService } from '@amsconnect/shared';

describe('ScheduledStatusPopupComponent', () => {
  let component: ScheduledStatusPopupComponent;
  let fixture: ComponentFixture<ScheduledStatusPopupComponent>;
  let scheduledStatusService: ScheduledStatusService;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  const errorMessage = 'An error occurred';  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduledStatusPopupComponent],
      imports: [ HttpClientModule,TranslateModule.forRoot(),HttpClientTestingModule,],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduledStatusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    scheduledStatusService = TestBed.inject(ScheduledStatusService);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('get the scheduled status',()=>{
  const user_id = "vjbvjr34"
    let dummyData = {   
      "status": "ok",
      };
      scheduledStatusService.showScheduleStatus(user_id).subscribe(data => {
      expect(data).toEqual(dummyData);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });    
  })

  it('delete the scheduled status',()=>{
    const user_id = "vjbvjr34"
    const object_id = "wjfjwfkrf4556klgf"
      let dummyData = {   
        "status": "ok",
        };
        scheduledStatusService.deleteScheduleStatus(user_id,object_id).subscribe(data => {
        expect(data).toEqual(dummyData);
      },
      error => {
        expect(error).toEqual(errorMessage);
      });    
    })
    
    it('scheduled status heading',()=>{
     let showScheduleStatusHeading;
          authService.authResponseData$.subscribe(data => {
          const first_name = data.user.first_name;
        showScheduleStatusHeading = `${first_name}'s Scheduled Status`;
      },
      error => {
        expect(error).toEqual(errorMessage);
      });
    })
  });
