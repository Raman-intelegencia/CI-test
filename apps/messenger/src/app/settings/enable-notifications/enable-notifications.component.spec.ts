import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnableNotificationsComponent } from './enable-notifications.component';
import { HttpClientModule } from '@angular/common/http';
import { SettingsService } from 'apps/messenger/src/services/settings.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('EnableNotificationsComponent', () => {
  let component: EnableNotificationsComponent;
  let fixture: ComponentFixture<EnableNotificationsComponent>;
  let settingsService:SettingsService;
  let httpTestingController: HttpTestingController;
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnableNotificationsComponent ],
      imports:[HttpClientModule,HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnableNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    settingsService = TestBed.inject(SettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle messages checkbox selection', () => {
    const checkbox = fixture.nativeElement.querySelector('#messages');
    expect(component.isCheckedMessages).toBe(false);
 
  });

  it('should toggle pager checkbox selection', () => {
    const checkbox = fixture.nativeElement.querySelector('#pager');
    expect(component.isCheckedPager).toBe(false);
  });

  it('should save the changes', () => { 
    const formData = new FormData();
    formData.append('key', 'pref_mute_pager');
    formData.append('value',"0");
    const aCookieValue = "AGcH-9ZZdlzHAgfzPxtRnl9LOFR-HGpzzI_W0eW9OeuTHtHTV_kbT7WwyNlo96BbiD8QV7sCj2cFsCRdnyMkPnrkh7zlxqzEyRR-d4gFHCVaQ63aMRMOdmmnI4XGYJJ9vwpcFH3Q18Y9lC7fzoY027hRlQXxEkL4Wg|64e68311dbb490d58aacbc9d" ;
    formData.append('a',aCookieValue);
    const response={
      status:"ok"
    }
    settingsService.setUserProperty(formData).subscribe(data => {
      expect(data).toEqual(response);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
  });

});
