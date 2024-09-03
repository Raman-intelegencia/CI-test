import {
  Role,
  Shift,
  loadLatestMessage,
  UpdateStatusResponse,
} from '@amsconnect/shared';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { SELECTED_SERVICE_ROLE_LIST, UserUpdateStatus } from '../../../../models/profile.model';
import { Subscription } from 'rxjs';

@Injectable()
export class ServiceTeamClass {
  public isUserProfileModalEvent = false;
  public otherServiceRolesList: Role[] = [];
  public otherServiceTeamList: Shift[] = [];
  public recentServiceRoleList: Role[] = [];
  public recentServiceList: Role[] = [];
  public selectedServiceRoleList: Role[] = [];
  public filteredOtherService: Shift | undefined;
  public filteredOtherServiceRoles: Role[] = this.otherServiceRolesList;
  public filteredRecentServiceRoles: Role[] = this.recentServiceRoleList;
  public showServiceTeamScheduleHeading = '';
  public showServiceTeamScreen = false;
  public openOnCallPopup = false;
  public subscription: Subscription[] = [];
  public journalId = 0;
  public serviceSearchTxt = '';
  public settingsLabelStates = {
    archiveChats: false,
  };
  public loadLatestResponse!: loadLatestMessage;
  public updatedUserStatusResponse!: UpdateStatusResponse;
  public userUpdateStatus: UserUpdateStatus = {
    status: '',
    away_message_mode: '',
    role: [],
    coverage: '',
    scheduler_type: '',
    removed_manual_role: '',
    away_message: '',
  };
  public showServiceTeamPopup = true;
  public scheduler_type: string | undefined;
  public shiftsData: Shift[] = [];
  public storeSelectedRole!: Role;
  public checkForOptOut = false;
  public optOutMsg = '';
  public storeSelectedIndex!: number;
  public yesOptOutButtontext = '';
  public getSelectedRoleValue: string[] = [];
  public storeSelectedService: string[] = [];
  public setSelectedServiceRoleList: SELECTED_SERVICE_ROLE_LIST = {
    selectedServiceTeam: [],
    selectedServiceRoleList: [],
  };
  public role: string | string[] = [];
  public removal_role: string | string[] = [];
  constructor(public cd: ChangeDetectorRef){

  }
  public showOnCallPopup(): void {
    this.openOnCallPopup = true;
    this.showServiceTeamPopup = false;
    this.cd.detectChanges();
  }

  public clearAllSelected(event: Event): void {
    event?.stopPropagation();
    this.selectedServiceRoleList = [];
    this.storeSelectedService = [];
    this.filteredRecentServiceRoles = this.recentServiceRoleList;
    this.filteredOtherServiceRoles = this.otherServiceRolesList;
  }

  public removeServiceFromList(role: Role): void {
    this.filteredOtherServiceRoles = this.filteredOtherServiceRoles.filter(
      (serviceRole) => {
        if(role._id) {
         return role._id !== serviceRole._id
        } else {
         return role.description !== serviceRole.description
        }
      }
    );
  }
  public onServiceRoleSearch(event: string): void {
    this.serviceSearchTxt = event;
    this.filteredRecentServiceRoles = this.serviceSearchTxt
      ? this.recentServiceRoleList.filter((role) =>
          role.description.toLowerCase().includes(this.serviceSearchTxt)
        )
      : this.recentServiceRoleList;
    this.filteredOtherServiceRoles = this.serviceSearchTxt
      ? this.otherServiceRolesList.filter((role) =>
          role.description.toLowerCase().includes(this.serviceSearchTxt)
        )
      : this.otherServiceRolesList;
    // Update the view manually using ChangeDetectorRef
    this.cd.detectChanges();
  }
  
  public openServiceTeamPopup(showPopup:boolean):void{
    this.showServiceTeamPopup = showPopup;
    this.openOnCallPopup = false;    
  }

  // Function to clear the search input and reset the patientData array
  public clearSearchInput(): void {
    // Clear the value of the patientSearchTxt input
    this.serviceSearchTxt = "";
    // Get the IDs of the selected roles
    const selectedRoleIds = this.selectedServiceRoleList.map(
      (role) => role._id
    );
    // Filter the recentServiceRoleList to include only unselected roles
    this.filteredRecentServiceRoles = this.recentServiceRoleList.filter(
      (role) => !selectedRoleIds.includes(role._id)
    );
    // Filter the otherServiceRolesList to include only unselected roles
    this.filteredOtherServiceRoles = this.otherServiceRolesList.filter(
      (role) => !selectedRoleIds.includes(role._id)
    );
  }
  
  public trackByRoleId(index: number, selectedRole: Role): string {
    return selectedRole._id; // Return a unique identifier for each selected role
  }
}
