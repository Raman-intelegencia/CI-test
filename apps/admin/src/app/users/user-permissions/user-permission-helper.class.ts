import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Grant, Target } from '../../../modals/users.model';
import { AuthService, InstitutionDetails } from '@amsconnect/shared';
import { DestroyRef } from '@angular/core';

export class UserPermissionHelper {
  public permissionsForm: FormGroup;
  public formControlLabelMapping!: { [key: string]: string };
  public modalTitle = "";
  public actionTargetModal = false;
  public userInstitutions!: {
    [key: string]: { id: string; short_name: string; name: string };
  };

  public allActions = [
    'inst-admin',
    'admin-user-provisioning',
    'admin-user-lockunlock',
    'admin-user-activation',
    'admin-user-updates',
    'admin-user-update-permissions',
    'admin-user-update-pager',
    'admin-user-update-tags',
    'admin-user-audit',
    'admin-api-user-management',
    'admin-institution-provisioning',
    'admin-institution-updates',
    'admin-broadcast',
    'admin-external-messaging',
    'admin-reporting',
    'admin-ctn-management',
    'admin-ctn-reporting',
    'user-update-schedule',
    'manage-third-party-integration',
    'manage-integrated-service-team',
    'view-phi',
    'communicate-out',
  ];
  public fileGrantsPermission = ['filearea-read', 'filearea-write'];

  // Enum or constant for action types
  private readonly ActionType = {
    Institution: 'i',
    File: 'f',
  };

  constructor(
    public fb: FormBuilder,
    public translate: TranslateService,
    public authSvc: AuthService,
    public destroySub: DestroyRef,
  ) {
    this.permissionsForm = this.fb.group({
      grants: this.fb.array([]), //Initialize an empty array for permissions grants
      fileGrants: this.fb.array([]), // Initialize an empty array for file area grants
    });
  }

  public get grantsFormArray(): FormArray {
    return this.permissionsForm.get('grants') as FormArray;
  }

  public get getFileGrantsArray(): FormArray {
    return this.permissionsForm.get('fileGrants') as FormArray;
  }

  public filePathArray(filegrant: AbstractControl): AbstractControl[] {
    return (filegrant.get('filePaths') as FormArray).controls;
  }

  public getControls(control: AbstractControl | null): {
    [key: string]: AbstractControl;
  } {
    return control ? (control as FormGroup).controls : {};
  }

  private createActionsFormGroup(actions: string[], grantActions: string[]): FormGroup {
    const controls = actions.reduce<Record<string, FormControl>>((acc, action) => {
      acc[action] = new FormControl(grantActions.includes(action));
      return acc;
    }, {});

    return this.fb.group(controls);
  }


  public initializePermissionsForm(userPermissions: Grant[]): void {
    const grantsArray = this.grantsFormArray;
    const fileGrantsArray = this.getFileGrantsArray;

    grantsArray.clear();
    fileGrantsArray.clear();
    if(!userPermissions?.length){ 
      grantsArray.push(this.fb.group({
        actions: this.createActionsFormGroup(this.allActions, ['']),
        institutions: this.createInstitutionsArray([{ entity: { iid: '', type: '' }, type: '' }])
    }));
  
    }else{
    userPermissions.forEach(grant => {
      if (grant.targets.some(target => target.type === this.ActionType.Institution)) {
        const actionsGroup = this.createActionsFormGroup(this.allActions, grant.actions);
        const institutionsArray = this.createInstitutionsArray(grant.targets);
        grantsArray.push(this.fb.group({ actions: actionsGroup, institutions: institutionsArray }));
      } else if (grant.targets.some(target => target.type === this.ActionType.File)) {
        const filePathsArray = this.createFilePathsArray(grant.targets);
        const fileActionsGroup = this.createActionsFormGroup(this.fileGrantsPermission, grant.actions);
        fileGrantsArray.push(this.fb.group({ filePaths: filePathsArray, actions: fileActionsGroup }));
      }
    });
  }
  }

  private createInstitutionsArray(targets: Target[]): FormArray {
    return this.fb.array(targets
      .filter(target => target.type === this.ActionType.Institution)
      .map(target => {
        // First, check if entity.iid is defined.
      if (typeof target.entity.iid === 'string') {
        // Since iid is a string, we can now safely look it up in this.userInstitutions
        const institutionInfo = this.userInstitutions[target.entity.iid];

        // If the institutionInfo exists, include both id and short_name in the form group
        if (institutionInfo) {
          return this.fb.group({ 
            id: target.entity.iid, 
            short_name: institutionInfo.short_name // Include the short_name key and value
          });
        }
      }
      // If iid is undefined or institutionInfo does not exist, return a default structure
      return this.fb.group({ id: target.entity.iid });
    })
    );
  }

  private createFilePathsArray(targets: Target[]): FormArray {
    return this.fb.array(targets
      .filter(target => target.type === this.ActionType.File)
      .map(target => this.fb.control(target.entity.path))
    );
  }

  public initializeFormControlLabelMapping(): void {
    this.formControlLabelMapping = {
      'inst-admin': this.translate.instant('viewUserAndInstitutionInfo'),
      'admin-user-provisioning': this.translate.instant('provisionUsers'),
      'admin-user-activation': this.translate.instant('manageUserActivation'),
      'admin-user-lockunlock': this.translate.instant('lockUnlockUser'),
      'admin-user-updates': this.translate.instant('updateUserInformation&StatusSchedule'),
      'admin-user-update-permissions': this.translate.instant('updateUserPermissions'),
      'admin-user-update-pager': this.translate.instant('updateUsersPagerNo'),
      'admin-user-update-tags': this.translate.instant('updateUserTags'),
      'admin-user-audit': this.translate.instant('auditUsersMessages'),
      'admin-api-user-management': this.translate.instant('manageApiUsers'),
      'admin-institution-provisioning': this.translate.instant('provisionInstitutions'),
      'admin-institution-updates': this.translate.instant('updateInstitutionInformation'),
      'admin-broadcast': this.translate.instant('SendBroadcastMessages'),
      'admin-external-messaging': this.translate.instant('sendExternalMessages'),
      'admin-reporting': this.translate.instant('executeReports'),
      'admin-ctn-management': this.translate.instant('managePatients'),
      'admin-ctn-reporting': this.translate.instant('viewAndReportPatientData'),
      'user-update-schedule': this.translate.instant('updateUserServiceTeamSchedule'),
      'view-phi': this.translate.instant('viewPHI'),
      'communicate-out': this.translate.instant('communicateOut'),
      "filearea-read": this.translate.instant('viewFiles'),
      "filearea-write": this.translate.instant('modifyFiles'),
      'manage-third-party-integration': this.translate.instant('manage-third-party-integration'),
      'manage-integrated-service-team': this.translate.instant('manage-integrated-service-team'),
    };
  }

  public addNewPermissionsSet(): void {
    // Create a new FormGroup for actions with all actions set to false
    const actionsGroup = this.allActions.reduce<{ [key: string]: FormControl }>(
      (controls, action) => {
        controls[action] = new FormControl(false);
        return controls;
      },
      {}
    );
    // Create a new empty FormArray for institutions
    const institutionsArray = this.fb.array([]);
    // Create a new FormGroup for the grant combining actions and institutions
    const newGrantGroup = this.fb.group({
      actions: this.fb.group(actionsGroup),
      institutions: institutionsArray,
    });

    this.grantsFormArray.push(newGrantGroup);
  }

  public addInstituteToGrant(
    grantIndex: number,
    institute: InstitutionDetails,
    institutionInput: HTMLInputElement
  ): void {
    // Get the institutions FormArray of the specific grant
    const institutionsArray = (
      this.grantsFormArray.at(grantIndex) as FormGroup
    ).get('institutions') as FormArray;
    // Create a new FormGroup for the selected institute
    const newInstituteGroup = this.fb.group({
      id: institute.id,
      short_name: institute.short_name
      // Add other institute details if necessary
    });
    const newGroupValue = newInstituteGroup;
    const hasDuplicateValues = this.hasDuplicates(institutionsArray, newGroupValue);
    if (!hasDuplicateValues) {
          // Add the new FormGroup to the institutions FormArray
      institutionsArray.push(newInstituteGroup);
      institutionInput.value = "";
    }
  }
  
  public hasDuplicates(formArray: FormArray, newGroupValue: FormGroup): boolean {
    for (let control of formArray.controls) {
      if (JSON.stringify(control.value) === JSON.stringify(newGroupValue.value)) {
        return true;
      }
    }
    return false;
  }
  // Method to remove an institute from a specific grant
  public removeInstituteFromGrant(
    grantIndex: number,
    instituteIndex: number
  ): void {
    // Get the institutions FormArray of the specific grant
    const institutionsArray = (
      this.grantsFormArray.at(grantIndex) as FormGroup
    ).get('institutions') as FormArray;
    // Remove the FormGroup at the specified index
    institutionsArray.removeAt(instituteIndex);
  }

  // Function to add a new file path form control
  public addFilePath(grantIndex: number): void {
    const grantFormGroup = (
      this.permissionsForm.get('fileGrants') as FormArray
    ).at(grantIndex) as FormGroup;
    const filePathsArray = grantFormGroup.get('filePaths') as FormArray;
    filePathsArray.push(new FormControl(''));
  }

  // Method to remove a file path from a specific file grant
  public removeFilePath(fileGrantIndex: number, filePathIndex: number): void {
    const fileGrantsArray = this.permissionsForm.get('fileGrants') as FormArray;
  // Ensure the indices are within bounds
  if (fileGrantIndex >= 0 && fileGrantIndex < fileGrantsArray.length) {
    const filePathsArray = fileGrantsArray.at(fileGrantIndex).get('filePaths') as FormArray;
    // Remove the specific file path from the file paths array
    if (filePathIndex >= 0 && filePathIndex < filePathsArray.length) {
      filePathsArray.removeAt(filePathIndex);
    } else {
      console.error('Invalid filePathIndex provided for removal');
    }
    // Remove the entire file grant if there are no file paths left
    if (filePathsArray.length === 0) {
      fileGrantsArray.removeAt(fileGrantIndex);
    }
  } else {
    console.error('Invalid fileGrantIndex provided for removal');
  }
  }

  // Add this inside your class to manage the file area grants
  public addFileAreaGrant(): void {
    const fileGrantsArray =
      (this.permissionsForm.get('fileGrants') as FormArray) ||
      this.fb.array([]);
    const newFileGrantGroup = this.fb.group({
      filePaths: this.fb.array([this.fb.control('')]), // Start with one empty file path
      actions: this.fb.group({
        'filearea-read': false,
        'filearea-write': false,
      }),
    });
    fileGrantsArray.push(newFileGrantGroup);

    // If fileGrants is not already part of the form, add it
    if (!this.permissionsForm.get('fileGrants')) {
      this.permissionsForm.addControl('fileGrants', fileGrantsArray);
    }
  }

  public closeTargetActionsErrorpopup(): void {
    this.actionTargetModal = false;
  }

}
