import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserProfileModalComponent } from './user-profile-modal.component';
import { ProfileStatusHelperService } from '../../../services/profile-status-helper.service';
import { AuthService, AuthUser, Config, UserProfileService, UsersAuthResponse ,SelectedThreadHelperService} from '@amsconnect/shared';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserProfileModalComponent', () => {
  let component: UserProfileModalComponent;
  let fixture: ComponentFixture<UserProfileModalComponent>;
  let userProfileService: UserProfileService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProfileModalComponent],
      providers: [
        TranslateService,
        ProfileStatusHelperService,
        SelectedThreadHelperService,
        AuthService,
        UserProfileService,
      ],
      imports:[HttpClientTestingModule,TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileModalComponent);
    component = fixture.componentInstance;
    userProfileService = TestBed.inject(UserProfileService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties', () => {
    expect(component.max_journal_id).toBeUndefined();
  });

  it('should fetch user profile data', () => {
    const mockUserProfileData: UsersAuthResponse = {
      status: '',
      user: {} as AuthUser,
      config: {} as Config
    };
    jest.spyOn(userProfileService, 'userProfile').mockReturnValue(of(mockUserProfileData));

    component.ngOnInit();
    expect(component.storeImageUrl).toBe('');
  });

  it('should fetch shifts and update properties', () => {
    const mockShiftsResponse = {
      shifts: [
        { id: 1, currently_active: false },
        { id: 2, currently_active: true },
      ],
    };

    // Spy on userProfileService.shifts and return a mock response
    spyOn(userProfileService, 'shifts').and.returnValue(of(mockShiftsResponse));

    // Call the shifts method
    component.shifts('selectedUserId');

    expect(component.shiftsData).toEqual(mockShiftsResponse.shifts);
    expect(component.scheduledServiceTeam.length).toEqual(1); // Check the number of scheduled shifts
    expect(component.currentServiceTeam.length).toEqual(1); // Check the number of current shifts
  });

  it('should fetch user thread response and update getUserThreadValue', () => {
    const mockUserThreadResponse = [
      { id: 1,  },
      { id: 2, },
    ];
    spyOn(userProfileService, 'userThreadResponse').and.returnValue(of(mockUserThreadResponse));
    component.getUserThreadResponse('selectedUserId');
    expect(component.getUserThreadValue).toEqual(mockUserThreadResponse);
  });

  afterEach(() => {
    fixture.destroy();
  });
});
