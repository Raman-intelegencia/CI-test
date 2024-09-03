import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { genderOptions, states } from './states';
import { PatientsService } from '../../../services/patients.service';
import { Router } from '@angular/router';
import { InstitutionsService } from '../../../services/institutions.service';
import { FilteredPatientData, PatientAddress, PatientData, PatientName, PrimaryInsurance } from '../../../modals/patients.model';
import { catchError, of } from 'rxjs';
import { DateUtilsService } from '@amsconnect/shared';
import { AppNavigationService } from '../../../services/app-navigation.service';

@Component({
  selector: 'web-messenger-add-patient',
  templateUrl: './add-patient.component.html'
})
export class AddPatientComponent implements OnInit {
  @ViewChild('instSearch') instSearchInput!: ElementRef<HTMLInputElement>;
  @Input() instituteName ="";
  public addPatientForm!:FormGroup;
  public statesList = states;
  public genderList = genderOptions;
  public childInst:{
    id: string,
    short_name: string,
    name: string
}[] =[];
public filteredChildInst: {
  id: string,
  short_name: string,
  name: string
}[]  = [];
  public isAssociatedOuInputFocused = false;
  public isCollapseOpen = false;
  public currentDate ="";
  public disabledFormChanged: boolean = false;
  public showDiscardMessage: boolean = false;
  public showSuccessPopup = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string="";
  public modalCloseTextMessage:string = "";

  constructor(
    private fb: FormBuilder,
    private patientSvc: PatientsService,
    private router: Router,
    private institutionSvc: InstitutionsService,
    private elementRef: ElementRef,
    private dateUtilSvc: DateUtilsService,
    public navigateSvc: AppNavigationService,
  ){}

  ngOnInit(): void {
    this.currentDate = this.dateUtilSvc.formatDate(new Date());
    this.patientSvc.setSearchPatientInstitute(this.instituteName);
    this.getInstDetails();
    this.initializeAddPatientForm();
  }

  public initializeAddPatientForm():void{
    this.addPatientForm = this.fb.group({
      iid: [''],
      pid: ['', Validators.required],
      name: this.fb.group({
        prefix: [''],
        given: ['', Validators.required],
        middle: [''],
        family: ['', Validators.required],
        suffix: [''],
      }),
      dob: ['', Validators.required],
      sex: ['', Validators.required],
      pcm_enabled:[false, Validators.required],
      address: this.fb.group({
        street_address: ['', Validators.required],
        street_other: [''],
        location: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required],
        country: ['', Validators.required]
      }),
      medicaid_id:[''],
      ssn:[''],
      associated_ou:this.fb.array([]),
      primary_insurance: this.fb.group({
        policy_number: [''],
        policy_start_date: [''],
        policy_end_date: ['']
      }),
    });
    this.addPatientForm.patchValue({
      iid: this.instituteName
    });
    this.onChangeFormDisabledRemoved();
  }

  public get f():{[key:string]:AbstractControl}{
    return this.addPatientForm.controls;
  }

  public get associatedOuArray():FormArray {
    return this.addPatientForm.get('associated_ou') as FormArray;
  }

  public toggleCollapse(event: Event): void {
    event.stopPropagation();
    this.isCollapseOpen = !this.isCollapseOpen;

    if (this.isCollapseOpen && this.instSearchInput) {
      setTimeout(() => this.instSearchInput.nativeElement.focus(), 0); // Focus the input
    }
  }

  public closeCollapseOnBlur(event: FocusEvent): void {
    // Close the collapse only if the focus is moving outside the collapse content
    setTimeout(() => {
      if (!this.elementRef.nativeElement.contains(event.relatedTarget)) {
        this.isAssociatedOuInputFocused = false;
      }
    },100);
  }

  public addAssociatedOu(event: Event, child: { id: string, short_name: string, name: string }): void { 
    if (!this.associatedOuArray.value.some((inst:{id: string, short_name: string, name: string}) => inst.id === child.id)) {
      this.associatedOuArray.push(this.fb.control(child));
      this.filteredChildInst = this.filteredChildInst.filter(inst => inst.id !== child.id);
    }
  }

  public removeAssociatedOu(event: MouseEvent, institutionId: string): void {
    event.stopPropagation();
    const index = this.associatedOuArray.value.findIndex((inst:{ id: string, short_name: string, name: string }) => inst.id === institutionId);
    if (index !== -1) {
      // Remove the institution from the selected array
      const [removed] = this.associatedOuArray.value.splice(index, 1);
      this.associatedOuArray.removeAt(index);
  
      // Check if the removed institution is not already in the filtered list
      const isNotInFilteredList = !this.filteredChildInst.some(inst => inst.id === institutionId);
      if (isNotInFilteredList) {
        // Find the index in the original list
        const originalIndex = this.childInst.findIndex(inst => inst.id === institutionId);
        if (originalIndex !== -1) {
          // Add it back to the filtered list in its original position
          this.filteredChildInst.splice(originalIndex, 0, removed);
        }
      }
    }
  }

  public getInstDetails():void{
    this.institutionSvc.getInstitutionDetails(this.instituteName)
    .pipe(
      catchError(error => {
        console.error('Error occured', error);
        return of(null);
      })
    )
    .subscribe(data => {
      if(data){
        this.childInst = data.institution.child_institutions;
        this.filteredChildInst = this.childInst;
      }
    })
  }

  public onSearchChange(event:Event,searchValue: string): void {
    event?.stopPropagation();
    this.filteredChildInst = this.childInst.filter(child =>
      child.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      child.id.toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  public createPatient():void{
    // construct the payload data with form data
    const filteredData = this.filterFormData(this.addPatientForm.value);
    this.patientSvc.addPatient(this.instituteName, filteredData)
    .pipe(
      catchError(error => {
        console.error('Error occured', error);
        return of(null)
      })
    )
    .subscribe(data => {
      if(data && data.status !== 'error'){
        this.addPatientForm.reset();
        this.navigateSvc.navigate(['/patients']);
      }
    });
  }

  public filterFormData(data: PatientData): FilteredPatientData {
    const filteredData: Partial<FilteredPatientData> = {};
  
    // Handle simple fields directly
    if (data.iid) filteredData.iid = data.iid;
    if (data.pid) filteredData.pid = data.pid;
    if (data.dob) filteredData.dob = data.dob;
    if (data.sex) filteredData.sex = data.sex;
    if (typeof data.pcm_enabled === 'boolean') filteredData.pcm_enabled = data.pcm_enabled;
    if (data.medicaid_id) filteredData.medicaid_id = data.medicaid_id;
    if (data.ssn) filteredData.ssn = data.ssn;
  
    // Handle 'associated_ou' as an array of strings
    if (data.associated_ou && data.associated_ou.length > 0) {
      filteredData.associated_ou = data.associated_ou.map(ou => ou.id);
    }
  
    // Handle 'name' object
    if (this.hasValuesInGroup(data.name)) {
      filteredData.name = { ...data.name };
    }
  
    // Handle 'address' object
    if (this.hasValuesInGroup(data.address)) {
      filteredData.address = { ...data.address };
    }
  
    // Handle 'primary_insurance' object
    if (this.hasValuesInGroup(data.primary_insurance)) {
      filteredData.primary_insurance = { ...data.primary_insurance };
    }
  
    return filteredData as FilteredPatientData;
  }
  
  // Helper function to check if at least one property in the group has a value
  private hasValuesInGroup(group: PatientName | PrimaryInsurance | PatientAddress): boolean {
    return Object.values(group).some(value => value !== '' && value !== null && value !== undefined);
  }
  
  public onChangeFormDisabledRemoved(): void {
    this.addPatientForm.valueChanges.subscribe(() => {
      this.disabledFormChanged = true;
      this.showDiscardMessage = true;
    });
  }

  public performDiscardForm(showTitle:string): void {
    if(showTitle === "Discard Patient Changes?"){ 
      this.navigateSvc.navigate([`/patients`]);
    }else{ 
      this.showSuccessPopup = false; 
    }
  }

  public cancelEditPatientForm(): void {
    if(this.showDiscardMessage === true) {
      this.showSuccessPopup = true;
      this.modalTitleMessage = "Discard Patient Changes?";
      this.modalShowMessage = "You have unsaved changes to this patient, are you sure you want discard them?";
      this.modalCloseTextMessage = 'Discard';
    }else{
      this.navigateSvc.navigate([`/patients`]);
    }
  }

  public cancelpopup(): void {
    this.showSuccessPopup = false; 
  }

  public navigateBackToPatients():void{
    this.navigateSvc.navigate([`/patients`]);
  }

}