import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceTeamPopUpComponent } from './service-team-pop-up.component';
import { Role, RoleResponse } from '@amsconnect/shared';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceTeamsService } from 'libs/shared/src/lib/services/service-teams.service';

describe('ServiceTeamPopUpComponent', () => {
  let component: ServiceTeamPopUpComponent;
  let fixture: ComponentFixture<ServiceTeamPopUpComponent>;
  let mockServiceTeamsService: Partial<ServiceTeamsService>;
  let mockChangeDetectorRef: Partial<ChangeDetectorRef>;

  const role1: Role = {
    _id: '1',
    description: 'Role 1',
    iid: 'I1',
    role_type: 'type1',
    time_updated: '2023-01-01T00:00:00Z',
  };

  const role2: Role = {
    _id: '2',
    description: 'Role 2',
    iid: 'I2',
    role_type: 'type2',
    time_updated: '2023-01-02T00:00:00Z',
  };

  const mockRoleResponse: RoleResponse = {
    status: 'ok',
    roles: [role1, role2],
    count: 0,
  };

  beforeEach(async () => {
    mockServiceTeamsService = {
      getServiceRoles: jest.fn().mockReturnValue(of(mockRoleResponse)),
      getRecentServiceRoles: jest.fn().mockReturnValue(of(mockRoleResponse)),
    };

    mockChangeDetectorRef = {
      detectChanges: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports:[ServiceTeamPopUpComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ServiceTeamsService, useValue: mockServiceTeamsService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceTeamPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add role to selected list and remove from recent and other lists', () => {
    // Set up the initial state with empty selectedServiceRoleList
    component.selectedServiceRoleList = [];
    component.filteredRecentServiceRoles = [role1]; 
    component.filteredOtherServiceRoles = [role1, role2]; 

    // Call the function being tested

    // Check the expectations
    expect(component.selectedServiceRoleList).toContainEqual(role1);
    expect(component.filteredRecentServiceRoles).not.toContainEqual(role1);
    expect(component.filteredOtherServiceRoles).not.toContainEqual(role1);
  });

  it('should remove role from selected list and add back to filtered lists when calling removeSelectedService', () => {
    // Set up the initial state with role in selectedServiceRoleList
    component.selectedServiceRoleList = [role1];
    component.filteredRecentServiceRoles = []; 
    component.filteredOtherServiceRoles = [role2]; 

    // Call the function being tested

    // Check the expectations
    expect(component.selectedServiceRoleList).not.toContainEqual(role1);
    expect(component.filteredRecentServiceRoles).toContainEqual(role1);
    expect(component.filteredOtherServiceRoles).toContainEqual(role1);
  });

  it('should remove role from filtered lists when calling removeServiceFromList', () => {
    // Set up the initial state with role in filtered lists
    component.filteredRecentServiceRoles = [role1];
    component.filteredOtherServiceRoles = [role1, role2];

    // Call the function being tested
    component.removeServiceFromList(role1);

    // Check the expectations
    expect(component.filteredRecentServiceRoles).not.toContainEqual(role1);
    expect(component.filteredOtherServiceRoles).not.toContainEqual(role1);
  });


  it('should update filtered lists based on search input', () => {
    component.recentServiceRoleList = [role1];
    component.otherServiceRolesList = [role1, role2];

    // Create a real HTMLInputElement element
    const inputElement = document.createElement('input');
    inputElement.value = 'Role 1'; // Initialize with the desired value
    
    // Create an ElementRef with the real input element


    expect(component.filteredRecentServiceRoles).toEqual([role1]);
    expect(component.filteredOtherServiceRoles).toEqual([role1]);
  });

});