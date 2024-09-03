import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@amsconnect/shared';
import { OtpService } from '@amsconnect/shared';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let userService: UserService;
  let otpService: OtpService;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports:[TranslateModule.forRoot()],
      providers: [
        TranslateService,
        UserService,
        OtpService,
        Router,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    otpService = TestBed.inject(OtpService);
    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call usersAuth and set user permissions', async () => {
    const authResponse = { config: { client_permissions: { patient_centric_messaging: true } }, user: { status: { r: [] } } };
    const userPermissions = { client_permissions: { patient_centric_messaging: true } };
    spyOn(otpService, 'userAuth').and.returnValue(Promise.resolve());
    spyOn(otpService, 'authResponse').and.returnValue(authResponse);
    spyOn(userService, 'setUserPermissions');
    
    await component.usersAuth();
    
    expect(otpService.userAuth).toHaveBeenCalled();
    expect(component.authResponse).toEqual(authResponse);
    expect(component.showPatientTab).toBe(true);
    expect(component.showServices).toEqual([]);
    expect(userService.setUserPermissions).toHaveBeenCalledWith(userPermissions);
  });

  it('should set stored url associations', () => {
    const authResponse = { user: { _id: { $oid: 'user_id' } } };
    spyOn(localStorage, 'getItem').and.returnValue('{"url_user_associations": {}, "account_information": {}}');
    spyOn(localStorage, 'setItem');
    spyOn(otpService, 'authResponse').and.returnValue(authResponse);

    component.authResponse = authResponse;
    component.setStoredUrlAssociations();

    expect(localStorage.getItem).toHaveBeenCalledWith('jStorage');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'jStorage',
      JSON.stringify({
        url_user_associations: { 0: 'user_id' },
        account_information: { 0: authResponse },
      })
    );
  });

  it('should toggle dropdown', () => {
    component.isDropdownOpen = false;
    component.toggleDropdown();
    expect(component.isDropdownOpen).toBe(true);
    
    component.toggleDropdown();
    expect(component.isDropdownOpen).toBe(false);
  });

  it('should check if router link is active', () => {
    spyOn(router, 'isActive').and.returnValues(true, false);
    expect(component.isRouterLinkActive('/path1')).toBe(true);
    expect(component.isRouterLinkActive('/path2')).toBe(false);
  });
});
