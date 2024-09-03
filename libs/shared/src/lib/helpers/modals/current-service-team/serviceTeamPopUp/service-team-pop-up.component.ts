import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService, ModalComponent, Role, RoleResponse, Shift, UpdateStatusResponse, Users, UsersAuthResponse } from "@amsconnect/shared";
import { TranslateModule } from "@ngx-translate/core";
import { CurrentServiceTeamComponent } from "../current-service-team.component";
import { OnCallPopUpComponent } from "./onCallPopUp/on-call-pop-up.component";
import { ServiceTeamClass } from "./service-team-class";
import { FormsModule } from "@angular/forms";
import { SHIFTS, UserUpdateStatus, profileResponse } from "../../../../models/profile.model";
import { InboxHelperService } from "../../../../services/messenger-services/inbox-helper.service";
import { SelectedThreadHelperService } from "../../../../services/messenger-services/selected-thread-helper.service";
import { ServiceTeamsService } from "../../../../services/messenger-services/service-teams.service";
import { UserProfileService } from "../../../../services/messenger-services/user-profile.service";
import { User } from "../../../../models/users.model";
@Component({
    selector: "web-messenger-service-team-pop-up",
    standalone: true,
    templateUrl: "./service-team-pop-up.component.html",
    styleUrls: ["./service-team-pop-up.component.scss"],
    imports: [
        CommonModule,
        TranslateModule,
        CurrentServiceTeamComponent, ModalComponent,
        FormsModule,
        OnCallPopUpComponent
    ]
})
export class ServiceTeamPopUpComponent extends ServiceTeamClass implements OnInit,OnDestroy ,OnChanges{
  @Input() userId = '';
  @Input() public selectedServiceTeam: Shift[] = [];
  @Input() public showSelectedScheduledServiceTeamsList = false;
  @Output() backClickedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() backToUserProfileModal = new EventEmitter();
  @Input() currentServiceTeam:Shift[] = [];
  @Input()scheduledServiceTeam:Shift[] = [];
  @Input() showServiceTeam = false;
  @Input() userData: User | null = null;
  @Input() userDataFromMessenger: Users | null = null;
  @Input()
  userProfileResponse!: profileResponse;
  public loadLatestUserResponse!: Users | null;
  public removedServiceList!:[]  | undefined;
  @Input() public userName = "";
  constructor(
    private serviceTeamsService: ServiceTeamsService,
    private authService: AuthService,private userProfileService:UserProfileService,
    private inboxHelperSvc:InboxHelperService,private selectedThreadHelperService: SelectedThreadHelperService,
    cd: ChangeDetectorRef
  ) {
    super(cd);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.shifts();
    if(changes["showServiceTeam"] || changes["selectedServiceTeam"]){
      this.showServiceTeamPopup = true;
    }
    this.getRecentServiceRoles();
    this.getServiceRoles();
  }

  ngOnInit(): void {
    this.getServiceTeamScheduleHeading();
    this.inboxHelperSvc.fetchThreadsAndProfiles(false); 
  }

  public getServiceTeamScheduleHeading(): void {
    this.subscription.push(this.authService.authResponseData$.subscribe(
      (data: UsersAuthResponse) => {
        const firstName = this.userData?.first_name || this.userProfileResponse?.profile?.first_name || data?.user?.first_name;
        this.showServiceTeamScheduleHeading = `${firstName}'s Service Teams Schedule`;
      }
    ));
  }

  public getServiceRoles(): void {
    this.serviceTeamsService
      .getServiceRoles(this.userId ? this.userId : this.userData?._id?.$oid)
      .subscribe((data: RoleResponse) => {  
        this.selectedServiceRoleList = [];
        this.filteredOtherServiceRoles = this.otherServiceRolesList =
          data.roles;
          for (const selectedRole of this.selectedServiceTeam) {
            this.filteredOtherServiceRoles = this.filteredOtherServiceRoles.filter((filteredRole) => {
              if (selectedRole.roles && selectedRole.roles.includes(filteredRole.description)) {
                const matchingShift: Role = {
                  description: filteredRole.description,
                  _id: filteredRole._id,
                  iid: '',
                  role_type: '',
                  time_updated: '',
                };
                if (!this.storeSelectedService.includes(matchingShift.description)) {
                  this.storeSelectedService.push(matchingShift.description);
                  this.getSelectedRoleValue.push(matchingShift.description);
                  this.selectedServiceRoleList.push(matchingShift);
                }
                this.setSelectedServiceRoleList.selectedServiceTeam = this.selectedServiceTeam;
                this.setSelectedServiceRoleList.selectedServiceRoleList.push(matchingShift);
                return false;
              }
              return true;
            });}
        // Remove the matching roles from filteredOtherServiceRoles
        this.filteredOtherServiceRoles = this.filteredOtherServiceRoles.filter(
          (filteredRole) => {
            return !this.selectedServiceRoleList.some(
              (matchingRole) =>
                matchingRole.description === filteredRole.description
            );
          }
        );        
      });
  }

  public getRecentServiceRoles(): void {    
    this.serviceTeamsService
      .getRecentServiceRoles(this.userId ? this.userId : this.userData?._id?.$oid)
      .subscribe((data: RoleResponse) => {
        this.filteredRecentServiceRoles = this.recentServiceRoleList =
          data.roles;                
           if (this.filteredRecentServiceRoles.length < 5) {
            const existingDescriptions = new Set(this.filteredRecentServiceRoles.map(role => role.description));
            const newDescriptions = this.shiftsData.flatMap(shift => !shift?.role_types?.includes("restricted") && !shift?.role_types?.includes("integrated") ? shift?.roles?.filter(role => !existingDescriptions.has(role)) ?? [] : [] ); 
           const uniqueDescriptions = new Set<string>();
           this.filteredRecentServiceRoles = this.filteredRecentServiceRoles.concat(newDescriptions
             .filter(description => {
              // Check if the description is unique
               if (!uniqueDescriptions.has(description)) {
                       uniqueDescriptions.add(description);
                        return true;
                       }
                        return false;
                 }).map(description => ({
                       description: description ?? '',
                       _id: '',
                       iid: '',
                       role_type: '',
                       time_updated: '',
              })));
      } 
          // Remove roles from filteredRecentServiceRoles that are also in selectedServiceRoleList
      this.filteredRecentServiceRoles = this.filteredRecentServiceRoles.filter(role => {
        return !this.selectedServiceRoleList.some(selectedRole => selectedRole.description === role.description);
          });
      });
  }

  public onRecentOrOtherServiceChange(role: Role,event:Event): void {
    event.stopPropagation();
    const selectedServiceRoleIndex = this.selectedServiceRoleList.findIndex(
      (r) => r.description === role.description
    );    
    if (selectedServiceRoleIndex === -1) {
      this.storeSelectedService.push(role.description);
      this.getSelectedRoleValue.push(role.description);
      this.selectedServiceRoleList.push(role);
      this.removeServiceFromList(role);
    } else {
      this.removeSelectedService(selectedServiceRoleIndex, role);
    }    
    // Fetch the data from the service and update filteredRecentServiceRoles
    this.serviceTeamsService.getRecentServiceRoles(this.userId ? this.userId : this.userData?._id?.$oid).subscribe((data: RoleResponse) => {
      if (data.roles.length > 0) {
        // Filter out roles from data.roles that are not already in selectedServiceRoleList
        const newRoles = data.roles.filter(role => 
          !this.selectedServiceRoleList.some(selectedRole => selectedRole._id === role._id)
        );
        this.filteredRecentServiceRoles = newRoles;        
      } else {        
        this.filteredRecentServiceRoles = this.filteredRecentServiceRoles.filter(role => 
          !this.selectedServiceRoleList.some(selectedRole => selectedRole.description === role.description)
        );
      }
    });
  }

  public removeSelectedService(index: number,selectedRole: Role): void {
    const removedRole = this.selectedServiceRoleList[index];
    this.storeSelectedIndex = index;
    this.storeSelectedRole = selectedRole;
    this.storeSelectedService = this.storeSelectedService.filter(item => item!=selectedRole?.description);
    this.serviceTeamsService
      .getRecentServiceRoles(this.userId)
      .subscribe((data: RoleResponse) => {
        if (index >= 0 && index < this.selectedServiceRoleList.length) {
          const removedRole = this.selectedServiceRoleList[index];
          this.selectedServiceRoleList.splice(index, 1);
          // Check if the removedRole exists in filteredRecentServiceRoles
          const roleIndexInFilteredRecent = this.filteredRecentServiceRoles.findIndex(
            (role) => role.description === removedRole.description
          );
          // If the removedRole doesn't exist in filteredRecentServiceRoles, add it
          if (roleIndexInFilteredRecent === -1) {
            this.filteredRecentServiceRoles.push(removedRole);
          }
        }
        // Add the removedRole back to filteredOtherServiceRoles if it was originally in otherServiceRolesList
        this.otherServiceRolesList.some((item) => item._id === removedRole._id)
          ? this.filteredOtherServiceRoles.push(removedRole)
          : null;
      });
  }

  public backToFirstServiceTeamScreen(event: Event): void {
    event?.stopPropagation();
    this.showServiceTeamPopup = false;
    this.checkForOptOut = false;
    this.backClickedEvent.emit();
    this.backToUserProfileModal.emit();
  }

  public shifts(): void {
    this.userProfileService.shifts(this.userId ? this.userId : this.userData?._id?.$oid).subscribe((shiftsResponse:SHIFTS) => {
      this.shiftsData = shiftsResponse?.shifts || [];
    });
  }  

  public saveUpdatedCurrentServiceTeamList(): void{
    this.currentServiceTeam = [];
    this.scheduledServiceTeam = [];
    this.subscription.push(this.inboxHelperSvc.user$.subscribe((currentUser) => {
      this.loadLatestUserResponse = currentUser ;      
        this.subscription.push(this.serviceTeamsService.shiftsData$.subscribe(
          (shifts: Shift[]) => {
            this.scheduler_type =
              shifts.length > 0 ? shifts[0].scheduler_type : ""; 
          }));
      }));
         if(this.selectedServiceRoleList.length) {
          this.role = this.selectedServiceRoleList.map(team => team?.description);
         this.removal_role = this.getSelectedRoleValue.filter(item => !this.role.includes(item));
         } else {
          this.role = [];
          this.removal_role = this.setSelectedServiceRoleList.selectedServiceRoleList.map(item => item.description);         
        }
          if(this.userData){
          var updateObject: UserUpdateStatus = {
            status: this.userData?.status?.s ?? '',
            role: this.role,
            coverage: this.userData?.status?.c?.ref,
            away_message:this.userData?.status?.away_message,
            away_message_mode: this.userData?.status?.away_message_mode ?? '',
            scheduler_type: this.scheduler_type? this.scheduler_type : 'manual',
            removed_manual_role: this.checkForOptOut? this.removedServiceList : this.removal_role,
            user_remove:this.checkForOptOut?'yes':'',
            user_id:this.userData?._id?.$oid
          }; 
         }
         else if (this.userProfileResponse) {
          var updateObject: UserUpdateStatus = {
            status: this.userProfileResponse?.profile?.status?.s ?? '',
            role: this.role,
            coverage: this.userProfileResponse?.profile?.status?.c?.ref,
            away_message:this.userProfileResponse?.profile?.status?.away_message,
            away_message_mode: this.userProfileResponse?.profile?.status?.away_message_mode ?? '',
            scheduler_type: this.scheduler_type? this.scheduler_type : 'manual',
            removed_manual_role: this.checkForOptOut? this.removedServiceList : this.removal_role,
            user_remove:this.checkForOptOut?'yes':'',
            user_id:this.userId
          };     
         }
         else {
          var updateObject: UserUpdateStatus = {
            status: this.loadLatestUserResponse?.status?.s ?? '',
            role: this.role,
            coverage: this.loadLatestUserResponse?.status?.c?.ref,
            away_message:this.loadLatestUserResponse?.status?.away_message,
            away_message_mode: this.loadLatestUserResponse?.status?.away_message_mode ?? '',
            scheduler_type: this.scheduler_type? this.scheduler_type : 'manual',
            removed_manual_role: this.checkForOptOut? this.removedServiceList : this.removal_role,
            user_remove:this.checkForOptOut?'yes':'',
            user_id:this.userId
          };  
         }
                
        this.serviceTeamsService.usersUpdateStatus( updateObject)
          .subscribe((userStatusResponse: UpdateStatusResponse) => {
            this.updatedUserStatusResponse = userStatusResponse;
            this.checkForOptOut = userStatusResponse?.user_remove?.show_pop_up || false;
            if(this.checkForOptOut) {
              this.removedServiceList = this.updatedUserStatusResponse.user_remove?.removed_service;
            }   
            this.optOutMsg = this.userId? `You are removing the last person from this "${this.removedServiceList?.join(', ')}" Are you sure you want to remove?`:
            `You are the last person in the "${this.removedServiceList?.join(', ')}" Are you sure you want to opt out?`;
            this.yesOptOutButtontext = this.userId? 'Yes, remove':'Yes, opt me out';
            if(!this.checkForOptOut){
              this.backClickedEvent.emit();
            }
            this.showServiceTeamPopup = true;
            this.selectedServiceRoleList = [];
            this.selectedThreadHelperService.showShiftsSubject$.subscribe(profileModalEvent=> {
              this.isUserProfileModalEvent = profileModalEvent;
            }
             )
            if(this.isUserProfileModalEvent && !this.checkForOptOut){
              this.backToUserProfileModal.emit();
            }
          });
    
  }

  public closeServiceTeamModal():void{
    this.checkForOptOut = false;
  }
  public closeServiceTeam(event: Event): void {
    event?.stopPropagation();
    this.showServiceTeamPopup = false;
    this.checkForOptOut = false;
    this.backClickedEvent.emit();
  }
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
