import { InstitutionDetails, InstitutionSearchResponse, selectedInputInstitutions } from '@amsconnect/shared';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdditionalGrantDetails, InstituePermissionResponse, InstitutionJson, Permission } from '../../../modals/institutionsPermission.model';
import { Institution } from '../../../modals/users.model';
import { AppNavigationService } from '../../../services/app-navigation.service';
import { InstitutionsService } from '../../../services/institutions.service';
@Component({
  selector: 'web-messenger-institution-permissions',
  templateUrl: './institution-permissions.component.html',
  styleUrls: ['./institution-permissions.component.scss']
})
export class InstitutionPermissionsComponent implements OnInit{
  @Input() institutionID= "";
  setInstitutePermission: FormGroup;
  public allInstitutionsData: InstitutionDetails[] = [];
  public createAddittion = false;
  public institutionSearchValue = '';
  public selectedInstitutions: string[] | undefined = [];
  public showSuccessPopup = false;
  public modalTitleMessage = "";
  public modalShowMessage = "";
  public selectedInstituteName:string[]=[];
  public allInstitutions: InstitutionDetails[] = [];
  @ViewChild("institutionInput", { static: true })
  institutionInput!: ElementRef<HTMLInputElement>;
  @ViewChild("institutionInputGrant", { static: true })
  institutionInputGrant!: ElementRef<HTMLInputElement>;
  public isInstituteInputFocused = false;
  public isInstituteInputFocusedAdditionalGrant = false;
  public isInputFocused: boolean[] = [];
  public institution_ID: InstitutionDetails | undefined;
  public storeInstitutionPermission!: { [key: string]: Institution; };
  public changesMade=false;
  public storeInstitutePermission!: Permission;
  public selectedInstitutionId: string[] = [];
  constructor(private fb: FormBuilder, 
    private InstitutionService: InstitutionsService, public navigateSvc: AppNavigationService,
    ) {
    this.setInstitutePermission = this.fb.group({
      communicatein: [false, Validators.required],
      communicateout: [false, Validators.required],
      instadmin: [false, Validators.required],
      instName: [],
      searchpatientsin: [false, Validators.required],
      searchpatientsout: [false, Validators.required],
      instId : [],
      additionalGrants: this.fb.array([]),
    });
  }
  ngOnInit(): void {    
    this.InstitutionService
      .searchInstitutitons("*", false)
      .subscribe((responseData: InstitutionSearchResponse) => {
        this.allInstitutionsData = responseData?.institutions;        
        this.allInstitutions = responseData?.institutions;
       this.institution_ID = this.allInstitutionsData.find((institution) => institution.id === this.institutionID);       
        this.fetchInstitutionDetails();
      });
      this.setInstitutePermission.valueChanges.subscribe(() => {
        this.changesMade = true;
      });
  }

   public fetchInstitutionDetails(): void {
    this.InstitutionService.getInstitutionPermissions(this.institutionID).subscribe(
      (data: InstituePermissionResponse) => {
        if (data.status == "ok") {          
          this.storeInstitutionPermission = data.institutions;
          this.storeInstitutePermission = data?.permission;
          this.updateAdditionalGrants(data.permission);
        }
      }
    );
  }
public updateAdditionalGrants(permission: Permission): void {
  const grants = permission?.grants || [];
  this.createAddittion = true;
  grants.forEach((grant) => { 
   this.getGrantsTargetsValue(grant);
  });
}
public getGrantsTargetsValue(grant: any): void {
  let grantsArr: {instName: string[];communicatein: boolean;communicateout: boolean;searchpatientsin: boolean;searchpatientsout: boolean;instadmin: boolean;instId: string[] }[] = [];  
  let instName: string[] = [];
  let institute;
  let instId :string[] = [];
  grant.targets.forEach((target: { entity: { iid: string } }) => {
    instId.push(target?.entity?.iid);
      institute = this.checkInstituteName(target?.entity?.iid);
      if(target?.entity?.iid === '*'){
       institute = '*';
      }
    instName.push(institute?institute : '');
  });
  grantsArr.push({
    instName: [...instName], // Use spread operator to avoid referencing the same array in each object
    communicatein: grant.actions.includes('communicate-in'),
    communicateout: grant.actions.includes('communicate-out'),
    searchpatientsin: grant.actions.includes('search-patient-in'),
    searchpatientsout: grant.actions.includes('search-patient-out'),
    instadmin: grant.actions.includes('inst-admin'),
    instId: [...instId]
  });
  grantsArr.forEach(item => {
    const formGroup = this.fb.group({
      instName: [item.instName],
      communicatein: [item.communicatein],
      communicateout: [item.communicateout],
      searchpatientsin: [item.searchpatientsin],
      searchpatientsout: [item.searchpatientsout],
      instadmin: [item.instadmin],
      instId: [item.instId]
    });
    (this.additionalGrants as FormArray).push(formGroup); // Push each FormGroup individually into the FormArray
  })
}
  public onInstitutionSearchChange(searchValue: string): void {
    this.institutionSearchValue = searchValue;
    this.searchInstitutions();
  }
  // Search institutions api call
  public searchInstitutions(): void {
    let institutionSearchValue =
      this.setInstitutePermission.get("institutionSearch")?.value;
    const showLockedInstitutionsValue = this.setInstitutePermission.get(
      "showLockedInstitutions"
    )?.value;

    institutionSearchValue =
      institutionSearchValue && institutionSearchValue.trim() !== ""
        ? institutionSearchValue
        : "*";
    this.InstitutionService
      .searchInstitutitons(institutionSearchValue, showLockedInstitutionsValue)
      .subscribe((responseData: InstitutionSearchResponse) => {
        this.allInstitutionsData = responseData.institutions;
      });
  }
  public onRemoveInstitution(institutionId: string, index: number): void {    
    // Check if index is valid
    if (index >= 0 && index < this.additionalGrants.controls.length) {
        const control = this.additionalGrants.at(index); // Get the FormGroup at the specified index
        const instIdControl = control.get('instId');
        const instNameControl = control.get('instName');
        if (Array.isArray(instIdControl?.value)) {      
          // Check if the institutionId exists in the array
          if (Array.isArray(instIdControl?.value)) {
            // Find the index of the institutionId in the array
            const idIndex = instIdControl?.value.findIndex((value: string) => value === institutionId);
            // Check if the institutionId exists in the array
            if (idIndex !== -1) {
                // Remove the corresponding institutionName and institutionId
                const updatedIds = [...(instIdControl?.value || [])]; // Using default value [] if instIdControl?.value is undefined
                if (typeof idIndex === 'number') { // Type guard for idIndex
                    updatedIds.splice(idIndex, 1);
                    instIdControl?.setValue(updatedIds);
                }
                const updatedNames = [...(instNameControl?.value || [])]; // Using default value [] if instNameControl?.value is undefined
                if (typeof idIndex === 'number') { // Type guard for idIndex
                    updatedNames.splice(idIndex, 1);
                    instNameControl?.setValue(updatedNames);
                }
            }
        }   
      }
      else if (instIdControl?.value === institutionId) {
            // Reset the value if it matches the institutionId
            instIdControl?.setValue(null);
            instNameControl?.setValue(null);
        }
    }
}

public removeSelectedInstitution(): void {
  this.selectedInstitutions = [];
  this.selectedInstitutionId = [];
  // Reset the values and validators for specific controls
  this.setInstitutePermission.patchValue({
      communicatein: false,
      communicateout: false,
      instadmin: false,
      searchpatientsin: false,
      searchpatientsout: false,
      instName: null, // Reset instName if it's a FormControl
      instId:null
  });

  // Reset the validators for instName if it's a FormControl
  this.setInstitutePermission.get('instName')?.setValidators(null);
  this.setInstitutePermission.get('instName')?.updateValueAndValidity();
  this.setInstitutePermission.get('instId')?.setValidators(null);
  this.setInstitutePermission.get('instId')?.updateValueAndValidity();
}
    public removeInst(index: number):void{
      this.changesMade = true; 
      this.selectedInstituteName?.splice(index, 1);
      this.selectedInstitutionId?.splice(index,1);
      this.selectedInstitutions?.splice(index, 1);
      this.setInstitutePermission.get('instName')?.patchValue('');
    }
public  get createFormGroup(): FormGroup {
    return this.fb.group({
      communicatein: [false, Validators.required],
      communicateout: [false, Validators.required],
      instName: ['', Validators.required],
      instadmin: [false, Validators.required],
      searchpatientsin: [false, Validators.required],
      searchpatientsout: [false, Validators.required],
      instId:['', Validators.required]
    });
  }
  public addAdditionalPermission(): void {
    this.createAddittion = true;
    const additionalGrantFormGroup = this.createFormGroup;
    (this.setInstitutePermission.get('additionalGrants') as FormArray).push(additionalGrantFormGroup);
  }

  public removeAdditionalGrant(index: number):void {    
    this.additionalGrants.removeAt(index);
  }

  public get additionalGrants() {
    return this.setInstitutePermission?.get('additionalGrants') as FormArray;
  }

  public getSelectedActions(grantDetails?: AdditionalGrantDetails): string[] {
    const selectedActions: string[] = [];
    type ControlActions = {
      [key: string]: string;
    };
 let grantDetailsVal = this.extractAdditionalGrantsDetails();
    // Define the list of controls and their corresponding actions
    const controlActions: ControlActions = {
      'communicatein': 'communicate-in',
      'communicateout': 'communicate-out',
      'instadmin': 'inst-admin',
      'searchpatientsin': 'search-patient-in',
      'searchpatientsout': 'search-patient-out',
    };
 // Iterate over the controls and check which ones are true
 Object.keys(controlActions).forEach(controlName => {
  if (grantDetails && grantDetails[controlName]) {
    selectedActions.push(controlActions[controlName]);
  } else if (!grantDetails && this.setInstitutePermission.controls[controlName]?.value) {
    selectedActions.push(controlActions[controlName]);
  }
});

    return selectedActions;
  }

  public extractAdditionalGrantsDetails(): AdditionalGrantDetails[] {
    const grantDetails: AdditionalGrantDetails[] = [];
    // Iterate through each additional grant form group
    this.additionalGrants.controls.forEach((grantGroup) => {      
      const details: AdditionalGrantDetails = {
        instName: grantGroup.get('instName')?.value || '',
        communicatein: grantGroup.get('communicatein')?.value || false,
        communicateout: grantGroup.get('communicateout')?.value || false,
        searchpatientsin: grantGroup.get('searchpatientsin')?.value || false,
        searchpatientsout: grantGroup.get('searchpatientsout')?.value || false,
        instadmin: true,
        instId:grantGroup.get('instId')?.value
        // Add other details as needed for each additional grant
      };
      grantDetails.push(details);      
    });
    return grantDetails;
  }
  public checkInstituteName(checkName: string): string |undefined {    
    const institute = this.allInstitutionsData.find((insitiution) => insitiution.name == checkName);    
    if(!institute){
      let instituteId = this.allInstitutionsData.find((insitiution) => insitiution.name == checkName);      
      if(!instituteId){
        let instituteId = this.allInstitutions.find((insitiution) => insitiution.name == checkName);
        if(!instituteId){
          let instituteId = this.allInstitutions.find((insitiution) => insitiution.id == checkName);
          if(!instituteId){ 
      let instituteId = this.storeInstitutionPermission?.[checkName];      
      return instituteId?.name;
          }
return instituteId?.name;
        }
        return instituteId?.name
      }
      return instituteId?.name
    }
    else{
      return institute?.name ;
    }
  }
  public getInstitutionJson(institutionId: string, allInstitutionsData: Institution[]): InstitutionJson { 
    const institute = allInstitutionsData.find((institution) => institution.id === institutionId);    
    if (institute) {
      return {
        type: 'i',
        entity: {
          type: 'i',
          iid: institute?.id
        }
      };
    } else {
      return {}; 
    }
  }
  public setInstitutesPermission(): void {
    this.changesMade = false; 
    if (this.setInstitutePermission?.valid) {
      const instituteId = this.institutionID;
      const institute = this.storeInstitutionPermission?.[instituteId];      
let institute_Id;
if(!institute){
  institute_Id = this.allInstitutions.find((institution) => institution.id === instituteId);
}
      if (instituteId) {
        const selectedActions = this.getSelectedActions();
        const additionalGrantsDetails = this.extractAdditionalGrantsDetails();
              // Check if any value is false and return false
  const isAnyFalse = additionalGrantsDetails.some(details =>
    !details.communicatein && !details.communicateout &&
    !details.searchpatientsin && !details.searchpatientsout
  );  
  const communicateIn = this.setInstitutePermission.get('communicatein');
  const communicateOut = this.setInstitutePermission.get('communicateout');
  const searchPatientsIn = this.setInstitutePermission.get('searchpatientsin');
  const searchPatientsOut = this.setInstitutePermission.get('searchpatientsout');
    const checkFalseVal = communicateIn?.value === false && communicateOut?.value === false &&
    searchPatientsIn?.value === false && searchPatientsOut?.value === false    
        const institutePermission = this.selectedInstitutionId?.map((institutionId) => {
          this.selectedInstituteName.push(institutionId);
          return this.getInstitutionJson(institutionId, this.allInstitutionsData)
        });
        if ((this.additionalGrants.controls.some((control: AbstractControl) => !control.get('instName')?.value?.length) || isAnyFalse) &&
        !(this.additionalGrants.controls.some((control: AbstractControl) => !control.get('instName')?.value?.length) && isAnyFalse)) { 
          this.selectedInstituteName = this.selectedInstituteName.filter((value,index) =>this.selectedInstituteName.indexOf(value) === index);
          this.showSuccessPopup= true;
          this.modalTitleMessage = "Invalid Grant";
          this.modalShowMessage =  `Grants require both actions and targets. 
          Invalid grants: The grant with targets [${this.selectedInstituteName}] and no actions`;
        }  
        else if((!this.setInstitutePermission.get('instName')?.value?.length || checkFalseVal) && 
       !(!this.setInstitutePermission.get('instName')?.value?.length && checkFalseVal)){
        this.selectedInstituteName = this.selectedInstituteName.filter((value,index) =>this.selectedInstituteName.indexOf(value) === index);
        this.showSuccessPopup= true;
        this.modalTitleMessage = "Invalid Grant";
        this.modalShowMessage =  `Grants require both actions and targets. 
        Invalid grants: The grant with targets [${this.selectedInstituteName}] and no actions`;
        }           
        else{
          const grantJson = {
            grants: [
              ...(institutePermission && institutePermission.length > 0
                ? [
                    {
                        targets: this.selectedInstitutionId?.map(institutionId => ({
                        type: 'i',
                        entity: {
                          type: 'i',
                          iid: institutionId
                        }
                      })),     
                      actions: selectedActions,
                    },
          ]
                : []),
                ...additionalGrantsDetails.filter((grantDetails) => {
                  return grantDetails.instName && grantDetails.instName.length >= 1;
              }).flatMap((grantDetails) => {
                        return {
                          targets: grantDetails?.['instId']
                          .filter(iid => iid !== undefined) // Filter out undefined iids
                          .map(iid => ({
                              type: 'i',
                              entity: {
                                  type: 'i',
                                  iid: iid ?? ''
                              }
                          })),
                            actions: this.getSelectedActions(grantDetails)
                        };
                })
            ],
            entity: this.storeInstitutePermission?.entity
        };        
          this.InstitutionService.updateInstitutionPermissions(this.institutionID? this.institutionID : institute_Id?.id ?? '' , grantJson).subscribe(
            (data: InstituePermissionResponse) => {
              if (data.status == "ok") {
                this.showSuccessPopup= true;
                this.modalTitleMessage = "Institution Permission";
                this.modalShowMessage = "Institution Permission Updated";
                this.selectedInstituteName=[];
              }
            })
        }
      }
       else {
        console.error('Form is invalid. All fields are mandatory.');
      }
    }
    else{
      this.selectedInstituteName = this.selectedInstituteName.filter((value,index) =>this.selectedInstituteName.indexOf(value) === index);
      this.showSuccessPopup= true;
      this.modalTitleMessage = "Invalid Grant";
      this.modalShowMessage =  `Grants require both actions and targets. 
      Invalid grants: The grant with targets [${this.selectedInstituteName}] and no actions`;
    }

  }
  public cancelpopup(): void { 
    this.showSuccessPopup = false; 
  }
  public backToSourcePage():void{
    this.navigateSvc.navigate([`/institution/${this.institutionID}`]);
  }
  public navigateBackToSearch():void{
    this.navigateSvc.navigate(['/institution/search']);
  }

 public onInputFocus(index: number):void {
    this.isInputFocused.fill(false); // Reset all to false
    this.isInputFocused[index] = true; // Set the clicked input box to true
    this.getInstitutions('');
}

  public getInstitutions(instituteSearchText?: string): void {        
    this.allInstitutionsData = [];
    this.allInstitutions = [];
    const searchTxt = instituteSearchText ? instituteSearchText : '';
    this.InstitutionService
      .searchInstitutitons(searchTxt, false)
      .subscribe((data: InstitutionSearchResponse) => {        
        this.allInstitutionsData = data.institutions;  
        this.allInstitutions = data.institutions;  
        
        this.allInstitutionsData.unshift({
          id: "*",
          parent_iid: "*",
          short_name: "*",
          name: "*",
          is_locked: false,
        })
      // Check if the institution already exists in this.allInstitutions
      const isInstitutionsExist = this.allInstitutions.some(institution => institution.id === '*');
      // Add the institution only if it's not already present
      if (!isInstitutionsExist) {
          this.allInstitutions.unshift({
              id: "*",
              parent_iid: "*",
              short_name: "*",
              name: "*",
              is_locked: false,
          });
      }
      });
  }

  public onSelectInstitutionABC(selectedInstitutionInput: selectedInputInstitutions): void {
    const selectedInstitution = selectedInstitutionInput?.name;
    const selectedInstituteID = selectedInstitutionInput?.id;
    this.isInstituteInputFocused = false;
    this.isInstituteInputFocusedAdditionalGrant = false;
    if (this.institutionInput && this.institutionInput?.nativeElement) {
        this.institutionInput.nativeElement.value = ''; // Clear the input value
    }
    // Always push the first value
    if (this.selectedInstitutionId?.length === 0) {
        this.selectedInstitutions?.push(selectedInstitution);
        this.selectedInstitutionId?.push(selectedInstituteID);
        this.setInstitutePermission.get('instName')?.setValue(selectedInstitution);
        this.setInstitutePermission.get('instId')?.setValue(selectedInstitutionInput?.id);
    } else {
        // Check if the value is not already present before pushing
        if (!this.selectedInstitutionId?.includes(selectedInstituteID)) {
            this.selectedInstitutions?.push(selectedInstitution);
            this.selectedInstitutionId?.push(selectedInstituteID);
            this.setInstitutePermission.get('instName')?.setValue(selectedInstitution);
            this.setInstitutePermission.get('instId')?.setValue(selectedInstitutionInput?.id);
        }
    }
}


  public onSelectGrantInstitution(selectedInstitutionInput: selectedInputInstitutions, index: any, inputBox: HTMLInputElement, inputIndex: number) {
    const selectedInstitution = selectedInstitutionInput.name;
    const selectedInstituteID = selectedInstitutionInput.id;
    this.isInstituteInputFocusedAdditionalGrant = false;
    this.isInstituteInputFocused = false;
    if (this.institutionInputGrant && this.institutionInputGrant?.nativeElement) {
      this.institutionInputGrant.nativeElement.value = ''; // Clear the input value
    }    
    if (selectedInstitution) {
        const additionalGrantsArray = this.setInstitutePermission.get('additionalGrants') as FormArray;
        const grantFormGroup = additionalGrantsArray.at(index) as FormGroup;
        const grantVal = grantFormGroup.get('instName');
        const grantInstidVal = grantFormGroup.get('instId');
        if (grantInstidVal) {
          // Get the current value of grantVal as an array
          const currentValue = grantInstidVal.value as string[]; // Assuming instName is an array of strings        
          // Check if the selectedInstitution is already in the array
          if (!currentValue?.includes(selectedInstituteID)) {
              // Add the new value to the array if it's not already selected
              const updatedValue = [...currentValue, selectedInstituteID];
              // Patch the updated value back to the control
              grantInstidVal.patchValue(updatedValue);
              if (grantVal) {
                // Get the current value of grantVal as an array
                const currentValue = grantVal.value as string[]; // Assuming instName is an array of strings        
                // Check if the selectedInstitution is already in the array
                    // Add the new value to the array if it's not already selected
                    const updatedValue = [...currentValue, selectedInstitution];
                    // Patch the updated value back to the control
                    grantVal.patchValue(updatedValue);
            }
        }
      }
        this.allInstitutionsData.push(selectedInstitutionInput);         
        this.setInstitutePermission.get('instName')?.reset();
        this.isInputFocused[inputIndex] = false;
        if (inputBox) {
            inputBox.blur();
        }
    }
}

}