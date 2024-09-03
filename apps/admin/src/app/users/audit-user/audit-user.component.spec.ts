import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditUserComponent } from './audit-user.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DateUtilsService } from '@amsconnect/shared';
import { CookieService, UserService } from '@amsconnect/shared';
import { UsersService } from '../../../services/users.service';
import { TranslateModule } from '@ngx-translate/core';

describe('AuditUserComponent', () => {
  let component: AuditUserComponent;
  let fixture: ComponentFixture<AuditUserComponent>;
  const mockDateUtilsService = {
    getPreviousMonthDate: jest.fn(),
    getDaysAgo: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditUserComponent ],
      providers:[UserService, UsersService, CookieService,
        { provide: DateUtilsService, useValue: mockDateUtilsService },],
      imports:[HttpClientTestingModule, TranslateModule.forRoot()]
    })
    .compileComponents();
  // Reset mock implementations before each test
  mockDateUtilsService.getPreviousMonthDate.mockReset();
  mockDateUtilsService.getDaysAgo.mockReset();
    fixture = TestBed.createComponent(AuditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form values based on DateUtilsService', () => {
    // Mocking return values
    const mockPreviousMonthDate = new Date('2021-01-01');
    mockDateUtilsService.getPreviousMonthDate.mockReturnValue(mockPreviousMonthDate);
    const mockSevenDaysAgo = new Date('2021-01-25');
    mockDateUtilsService.getDaysAgo.mockReturnValue(mockSevenDaysAgo);
  
    fixture = TestBed.createComponent(AuditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  
    // Test if the form is initialized with the mocked dates
    expect(component.auditForm.get('customDateRange')?.get('from')?.value).toBe(mockPreviousMonthDate);
  
    // Simulate value change in the form
    component.auditForm.get('timespan')?.setValue('all');
    fixture.detectChanges();
  
    // Test if the form values are updated based on the mocked return value
    expect(component.auditForm.get('customDateRange')?.get('from')?.value).toBe(mockSevenDaysAgo);
  });

  it('should update date range when timespan changes', () => {
    // Setting up the mock return value
    const mockSevenDaysAgo = new Date('2020-12-24');
    mockDateUtilsService.getDaysAgo.mockReturnValue(mockSevenDaysAgo);
  
    fixture = TestBed.createComponent(AuditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  
    // Trigger the value change
    component.auditForm.get('timespan')?.setValue('all');
    fixture.detectChanges();
  
    // Check if the 'from' date is updated correctly
    expect(component.auditForm.get('customDateRange')?.get('from')?.value).toEqual(mockSevenDaysAgo);
  });
  
  it('should correctly update the date range', () => {
    const testFromDate = new Date('2020-12-01');
    const testToDate = new Date('2020-12-31');
    component.updateDateRange(testFromDate, testToDate);
    expect(component.auditForm.get('customDateRange')?.get('from')?.value).toEqual(testFromDate);
    expect(component.auditForm.get('customDateRange')?.get('to')?.value).toEqual(testToDate);
  });
  
});