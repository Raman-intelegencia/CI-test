import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OffDutyModalComponent } from './off-duty-modal.component';
import { OtpService, ProfileStatusService } from '@amsconnect/shared'; // Import required dependencies
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Subscription } from 'rxjs';

describe('OffDutyModalComponent', () => {
  let component: OffDutyModalComponent;
  let fixture: ComponentFixture<OffDutyModalComponent>;
  let mockSubscription: Subscription;
  // Mock dependencies
  const otpServiceStub = {
    authResponse: {
      // Define your mock auth response here
    }
  };
  const profileStatusStub = {
    loadLatestResponse: {
      // Define your mock auth response here
    }
  };

  beforeEach(() => {
     mockSubscription = new Subscription();
     jest.spyOn(mockSubscription, 'unsubscribe').mockImplementation(() => {
      // Mock the behavior of the unsubscribe method if needed
    });    TestBed.configureTestingModule({
      declarations: [OffDutyModalComponent],
      imports:[ TranslateModule.forRoot(),HttpClientTestingModule],
      providers: [
        { provide: OtpService, useValue: otpServiceStub },{provide:ProfileStatusService,useValue:profileStatusStub},
      ]
    });

    fixture = TestBed.createComponent(OffDutyModalComponent);
    component = fixture.componentInstance;
    component['subscription'] = mockSubscription;

  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch auth response data on getAuthResponse', () => {
    // Create a spy for the 'loadLatestWithJournalId' property and cast it as a Jest spy
    const loadLatestWithJournalIdSpy = jest.spyOn(component['profileStatus'], 'loadLatestWithJournalId' ,'get') as unknown as jest.Mock<string>;

    // Set up a custom getter for the property
    loadLatestWithJournalIdSpy.mockImplementation(() => {
      // You can return a custom value here if needed
      return 'customValue';
    });

    // Call the method you want to test
    component.getAuthResponse();

    // Add expectations for the authResponse and other properties
    expect(component.authResponse).toBeDefined();
    expect(component.loadLatestResponse).toBeDefined();

    // Verify that the 'loadLatestWithJournalId' property has been accessed
    expect(loadLatestWithJournalIdSpy).toHaveBeenCalled();
  });
  
  it('should unsubscribe from the subscription on ngOnDestroy', () => {
    // Call ngOnDestroy
    component.ngOnDestroy();

    // Expect the 'unsubscribe' method to have been called
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

});
