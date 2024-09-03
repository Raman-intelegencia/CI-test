import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { InstitutionService, AuthService, SettingsService } from "@amsconnect/shared";
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let institutionService: jest.Mocked<InstitutionService>;
  let authService: jest.Mocked<AuthService>;
  let settingsService: jest.Mocked<SettingsService>;

  beforeEach(() => {
    institutionService = {
      getInstitutions: jest.fn(),
    } as unknown as jest.Mocked<InstitutionService>;

    authService = {
      authResponseData$: of({ }),
    } as unknown as jest.Mocked<AuthService>;

    settingsService = {
      setUsersImage: jest.fn(),
    } as unknown as jest.Mocked<SettingsService>;

    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports:[RouterTestingModule,TranslateModule.forRoot()],
      providers: [
        { provide: InstitutionService, useValue: institutionService },
        { provide: AuthService, useValue: authService },
        { provide: SettingsService, useValue: settingsService },
      ],
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should fetch institutions and user data on ngOnInit', fakeAsync(() => {
    // Mock the responses from services
    const institutionResponse = { /* your institution data */ };
    institutionService.getInstitutions.mockReturnValue(of(institutionResponse));

    fixture.detectChanges();
    tick(); // Ensure asynchronous operations are completed

    expect(component.institutions).toEqual(institutionResponse);
    // Add more expectations as needed for other data updates
  }));

  it('should update storeImageUrl on file upload', () => {
    const mockFile = new File(['dummy'], 'dummy.txt');
    const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,...' };
    const mockEvent = { target: { files: [mockFile] } };

    // Mock FileReader
    jest.spyOn(window, 'FileReader').mockImplementation(() => mockReader);

    component.uploadFile(mockEvent as unknown as Event);

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

});
