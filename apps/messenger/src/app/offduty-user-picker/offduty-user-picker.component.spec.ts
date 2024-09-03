import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OtpService } from '@amsconnect/shared'; // Import required dependencies
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {  Subscription } from 'rxjs';
import { OffDutyUserPickerComponent } from './offduty-user-picker.component';

describe('OffDutyUserPickerComponent', () => {
  let component: OffDutyUserPickerComponent;
  let fixture: ComponentFixture<OffDutyUserPickerComponent>;
  let mockSubscription: Subscription;
  // Mock dependencies
  const otpServiceStub = {
    authResponse: {
      // Define your mock auth response here
    }
  };

  beforeEach(() => {
     mockSubscription = new Subscription();
     jest.spyOn(mockSubscription, 'unsubscribe').mockImplementation(() => {
      // Mock the behavior of the unsubscribe method if needed
    });    TestBed.configureTestingModule({
      declarations: [OffDutyUserPickerComponent],
      imports:[ TranslateModule.forRoot(),HttpClientTestingModule],
      providers: [
        { provide: OtpService, useValue: otpServiceStub },
      ]
    });

    fixture = TestBed.createComponent(OffDutyUserPickerComponent);
    component = fixture.componentInstance;
    component['subscription'] = mockSubscription;

  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

});
