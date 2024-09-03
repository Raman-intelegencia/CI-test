import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, } from '@angular/core';
import { UserPermissionsService } from '../../../services/user-permissions.service';
import { FormArray, FormBuilder, FormGroup, } from '@angular/forms';
import {
  AppendedInstitution, CombinedGrant, FileGrant, FileGrantAccessUserPermission, Grant,
  PermissionData, Target, UserPermissionGrant, UserPermissionsReponse,
} from '../../../modals/users.model';
import { TranslateService } from '@ngx-translate/core';
import { InstitutionsService } from '../../../services/institutions.service';
import { AuthService, InstitutionDetails, InstitutionSearchResponse, UsersAuthResponse, status, } from '@amsconnect/shared';
import { UserPermissionHelper } from './user-permission-helper.class';
import { Subscription } from 'rxjs';
import { UserInfoService } from 'apps/admin/src/services/user-info.service';

@Component({
  selector: 'web-messenger-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss'],
})
export class UserPermissionsComponent extends UserPermissionHelper implements OnChanges, OnInit {
  @Input() userId = '';
  public isEditMode = false;
  public userPermissions!: Grant[];
  public allInstitutions: InstitutionDetails[] = [];
  public selectedInstitute: InstitutionDetails[] = [];
  public isInstituteInputFocused = false;
  public successError = "";
  public showErrorPopup = false;
  public subscription = new Subscription;
  public isEditPermissionButtonVisible = false;

  constructor(
    private userPermissionsSvc: UserPermissionsService,
    translate: TranslateService,
    private institutionSvc: InstitutionsService,
    fb: FormBuilder,
    authSvc: AuthService,
    destroySub: DestroyRef,
    public userInfoSvc: UserInfoService,
  ) {
    super(fb, translate, authSvc, destroySub)

    this.destroySub.onDestroy(() => {
      this.subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
    this.initializeFormControlLabelMapping();
    this.getInstitutions();
    this.subscription = this.authSvc.authResponseData$.subscribe((response: UsersAuthResponse) => {
      this.isEditPermissionButtonVisible = response.user.access_group_actions_map.client_user_permissions;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
    if (changes['userId'].currentValue) {
      this.getUserPermissions(this.userId);
      this.userInfoSvc.setUserInfoPageRedirection(true);
    }
  }

  public getInstitutions(instituteSearchText?: string): void {
    const searchTxt = instituteSearchText ? instituteSearchText : '';
    this.institutionSvc
      .searchInstitutitons(searchTxt, false)
      .subscribe((data: InstitutionSearchResponse) => {
        this.allInstitutions = data.institutions;
        this.allInstitutions.unshift({
          id: "*",
          parent_iid: "*",
          short_name: "*",
          name: "*",
          is_locked: false,
        })
      });
  }

  public toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  public getUserPermissions(userId: string): void {
    this.userPermissionsSvc
      .getUserPermissions(userId)
      .subscribe((data: UserPermissionsReponse) => {
        this.userPermissions = data.permission.grants;
        this.userInstitutions = data.institutions;
        this.initializePermissionsForm(this.userPermissions);
      });
  }

  public trackByFn(index: number): number {
    return index; // Returns the index as a unique identifier
  }

  public turnOnAllAdminPermissions(event: Event, index: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const grantFormGroup = this.grantsFormArray
      .at(index)
      .get('actions') as FormGroup;

    // Permissions to exclude from being updated
     const excludePermissions = [
    'admin-external-messaging',
    'communicate-out',
    'user-update-schedule', 
    'view-phi',
    'manage-third-party-integration',
    'manage-integrated-service-team'
    ];

    this.allActions.forEach((permission) => {
      // Check if the permission should be updated
    if (grantFormGroup.controls[permission] && !excludePermissions.includes(permission)) {
      grantFormGroup.controls[permission].setValue(isChecked);
    }
    });
  }

  public extractInstitutionName(instId: string | undefined): string {
    // Check if instId is undefined or a wildcard
    if (!instId || instId === '*') {
      return instId ?? 'Unknown'; // Return 'Unknown' or a similar placeholder if instId is undefined
    }
    // Ensure userInstitutions is defined and has the key instId
    if (this.userInstitutions && this.userInstitutions[instId]) {
      return this.userInstitutions[instId].short_name;
    }
    // Return a placeholder or an error message if the institution is not found
    return 'Institution Not Found';
  }

  public handleInstitutionInputBlurEvent(): void {
    setTimeout(() => {
      this.isInstituteInputFocused = false;
    }, 200); // Delay of 200ms (you can adjust this based on your needs)
  }

  private buildInstitutionTargets(institutions: AppendedInstitution[]): Target[] {
    return institutions.map(inst => ({
      type: 'i',
      entity: { type: 'i', iid: inst.id },
    }));
  }

  private buildFileGrantTargets(filePaths: string[]): Target[] {
    return filePaths
      .filter(path => path.trim() !== '')
      .map(path => ({ type: 'f', entity: { type: 'f', path } }));
  }

  private filterGrantsWithTargets(grants: CombinedGrant[]): CombinedGrant[] {
    return grants.filter(grant => grant.targets.length > 0);
  }

  public updateUserPermissions(): void {
    const formValues = this.permissionsForm.value;
    // Filter out grants with no selected institutions (targets) before mapping
     const grantsWithTargets = formValues.grants.filter((grant: UserPermissionGrant) => grant.institutions && grant.institutions.length > 0);

    if (grantsWithTargets.length === 0 && formValues.grants.length > 0) {
      this.actionTargetModal = true;
      console.error('Error: No targets selected for institution grants.');
      return; // Stop execution if there are no grants with selected targets
    }
    // Construct the grants payload with non-empty targets
    const grantsPayload = formValues.grants.map((grant: UserPermissionGrant) => ({
      actions: Object.keys(grant.actions).filter(action => grant.actions[action]),
      targets: this.buildInstitutionTargets(grant.institutions),
    }));
  
    const fileGrantsPayload = (formValues.fileGrants || []).map((fileGrant: FileGrant) => {
      const actions = [];
      // Directly check for 'filearea-read' and 'filearea-write' according to your form structure
      if (fileGrant.actions['filearea-read']) {
        actions.push('filearea-read');
      }
      if (fileGrant.actions['filearea-write']) {
        actions.push('filearea-write');
      }
    
      return {
        actions,
        targets: this.buildFileGrantTargets(fileGrant.filePaths),
      };
    });
    // Combine and filter the grants
    const finalPayload: PermissionData = {
      grants: this.filterGrantsWithTargets([...grantsPayload, ...fileGrantsPayload]),
      entity: { type: 'u', user_id: this.userId },
    };

    this.userPermissionsSvc.updateUserPermissions(this.userId, finalPayload).subscribe((data) => {
      if (data.status === status.StatusCode.OK) {
        this.showErrorPopup = false;
        this.toggleEditMode();
        this.userPermissions = data.permission.grants;
        this.userInstitutions = data.institutions;
        this.initializePermissionsForm(data.permission.grants);
        this.isEditMode = false;
      };
    });
    this.authSvc.usersAuth().subscribe((data:UsersAuthResponse) => {      
        this.authSvc.setAuthUsersReponse(data);
    });
  }

  public cancelEditPermissions():void{
    this.initializePermissionsForm(this.userPermissions);
    this.isEditMode = false;
  }

  public removeInstitutePermissions(grantIndex:number):void{
    const institutionsArray = (this.grantsFormArray.at(grantIndex) as FormGroup).get('institutions') as FormArray;
    const grantFormGroup = this.grantsFormArray
      .at(grantIndex)
      .get('actions') as FormGroup;

    this.allActions.forEach((permission) => {
      if (grantFormGroup.controls[permission]) {
        grantFormGroup.controls[permission].setValue(false);
      }
    });
    institutionsArray.removeAt(0);
    this.grantsFormArray.removeAt(grantIndex);
  }
  
  // close the error modal & create the modal message
  public closepopup(): void {
    this.successError = '';
    this.showErrorPopup = false;
  }

  public showErrorMsg(data: UserPermissionsReponse): void {
    this.successError = data.message || '';
    this.showErrorPopup = true;
  }

  public showFileGrantsMessage(titleHeading: string, titleMessage: string): void {
    this.showErrorPopup = true;
    this.modalTitle = titleHeading;
    this.successError = titleMessage;
  }
}
