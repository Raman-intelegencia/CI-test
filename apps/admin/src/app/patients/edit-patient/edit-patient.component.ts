import { CookieService, DateUtilsService, status } from '@amsconnect/shared';
import { ChangeDetectorRef, Component, DestroyRef, ElementRef, Input, OnInit, ViewChild,Renderer2  } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CreatePatientResponse, Patient } from 'apps/admin/src/modals/patients.model';
import { PatientsService } from 'apps/admin/src/services/patients.service';
import { genderOptions, states } from '../add-patient/states';
import { FilteredPatientData, PatientAddress, PatientData, PatientName, PrimaryInsurance } from '../../../modals/patients.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { InstitutionsService } from '../../../services/institutions.service';
import { AppNavigationService } from '../../../services/app-navigation.service';
@Component({
  selector: 'web-messenger-edit-patient',
  templateUrl: './edit-patient.component.html'
})
export class EditPatientComponent implements OnInit {
  @ViewChild('instSearch') instSearchInput!: ElementRef<HTMLInputElement>;
  @Input() instituteName:string  = "";
  @Input() patientId:string  = "";
  public editPatentsForm!: FormGroup;
  public policyStartDate!: string;
  public policyEndDate!:string;
  public statesList = states;
  public submitted: boolean = false;
  public genderList = genderOptions;
  public showSuccessPopup = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string="";
  public currentDate ="";
  public isPolicyNumberReadOnly: boolean = true; 
  public userId =""
  public changeDetectionForm:boolean = false;
  public disabledFormChanged: boolean = false;
  public subscription: Subscription = new Subscription();
  public showPlaceholder = false;
  public filteredChildInst: {id: string,short_name: string,name: string}[]  = [];
  public filteredChildData: {id: string,short_name: string,name: string}[]  = [];
  public isAssociatedOuInputFocused = false;
  public isCollapseOpen = false;
  public childInst:{id: string,short_name: string,name: string}[] =[];
  public showDiscardMessage: boolean = false;
  public modalCloseTextMessage:string = "";
  public pidValueOfPatients:string = "";
  constructor(
    public patientsSvc: PatientsService, public formBuilder: FormBuilder,
    public cookieService: CookieService, private dateUtilSvc: DateUtilsService,
    public router: Router, private route: ActivatedRoute,
    public destroySub: DestroyRef,private elementRef: ElementRef,
    private institutionSvc: InstitutionsService,public cd: ChangeDetectorRef, public navigateSvc: AppNavigationService,){
    this.userId = this.route.snapshot.queryParams['user_id'];
    this.initializeForm();
    this.destroySub.onDestroy(() => {this.subscription.unsubscribe();});
  }

  ngOnInit(): void {
    this.getInstDetails(); 
    this.currentDate = this.dateUtilSvc.formatDate(new Date());
    this.patientsSvc.setSearchPatientInstitute(this.instituteName);
  }

  public initializeForm(): void {
    this.editPatentsForm = this.formBuilder.group({
      iid: new FormControl(""),
      pid: new FormControl("", [Validators.required]),
      name: this.formBuilder.group({
        prefix: new FormControl(""),
        given: new FormControl("",[Validators.required]),
        middle: new FormControl(""),
        family: new FormControl("",[Validators.required]),
        suffix: new FormControl(""),
      }),
      dob: new FormControl("", [Validators.required]),
      sex: new FormControl(""),
      pcm_enabled: new FormControl(""),
      address: this.formBuilder.group({
        street_address: new FormControl(""),
        street_other: new FormControl(""),
        location: new FormControl(""),
        city: new FormControl(""),
        state: new FormControl(""),
        zip: new FormControl(""),
        country: new FormControl(""),
      }),
      medicaid_id: new FormControl(""),
      ssn: new FormControl(""),
      associated_ou: this.formBuilder.array([]),
      primary_insurance: this.formBuilder.group({
        policy_number: new FormControl(""),
        policy_start_date: new FormControl(""),
        policy_end_date: new FormControl(""),
      })
    });
  }

  public get associatedOuArray():FormArray { return this.editPatentsForm.get('associated_ou') as FormArray; }

  public toggleCollapse(event: Event): void {
    event.stopPropagation();
    this.isCollapseOpen = !this.isCollapseOpen;
    if (this.isCollapseOpen && this.instSearchInput) {
      setTimeout(() => this.instSearchInput.nativeElement.focus(), 0); // Focus the input // used in future
    }
  }

  public closeCollapseOnBlur(event: FocusEvent): void { 
    event.stopPropagation();
    setTimeout(() => {
      if (!this.elementRef.nativeElement.contains(event.relatedTarget)) {
        this.isAssociatedOuInputFocused = false;
      }
    },100);
  }

  public addAssociatedOu(event: Event, child: { id: string, short_name: string, name: string }): void {
    event.stopPropagation();
    if (!this.associatedOuArray.value.some((inst:{id: string, short_name: string, name: string}) => inst.id === child.id)) {
      this.associatedOuArray.push(this.formBuilder.control(child));
      this.filteredChildInst = this.filteredChildInst.filter(inst => inst.id !== child.id);
    }
    this.cd.detectChanges();
  }

  public removeAssociatedOu(event: MouseEvent, institutionId: string): void {
    event.stopPropagation();
    const index = this.associatedOuArray.value.findIndex((inst:{ id: string, short_name: string, name: string }) => inst.id === institutionId);
    if (index !== -1) {
      const [removed] = this.associatedOuArray.value.splice(index, 1);
      this.associatedOuArray.removeAt(index);
      const isNotInFilteredList = !this.filteredChildInst.some(inst => inst.id === institutionId);
      if (isNotInFilteredList) {
        const originalIndex = this.childInst.findIndex(inst => inst.id === institutionId);
        if (originalIndex !== -1) {
          this.filteredChildInst.splice(originalIndex, 0, removed);
        }
      }
    }
  }

  public getInstDetails():void{
    this.institutionSvc.getInstitutionDetails(this.instituteName).subscribe(data => {
      if(data){
        this.childInst = data.institution.child_institutions;
        this.filteredChildInst = this.childInst;
        this.filteredChildData = data.institution.child_institutions;
        this.getSelectedPatientsDetails();
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

  public getSelectedPatientsDetails():void{
    this.patientsSvc.getPatientDetails(this.instituteName, this.patientId).subscribe((data: CreatePatientResponse)=> {
      if(data && data.status !== 'error'){
        this.setFormValues(data.patient);
      }
    });
  }

  public setFormValues(data: Patient): void {   
    this.pidValueOfPatients = data.pid; 
    const policyNumberValue = data?.primary_insurance?.policy_number || '';
    this.editPatentsForm.patchValue({
      iid: this.instituteName,
      pid: data.pid,
      name: {
      prefix: data.name_prefix, given: data.given_name, 
      middle: data.middle_name,family: data.last_name,suffix: data.name_suffix,
      },
      address: {
        street_address: data?.address?.street_address,
        street_other: data?.address?.street_other,
        location: data?.address?.location,
        city: data?.address?.city,
        state: data?.address?.state,
        zip: data?.address?.zip,
        country: data?.address?.country,
      },
      dob: data.dob,
      sex: data.sex,
      pcm_enabled:data.pcm_enabled === 'N' ? false:true,
      associated_ou: data.associated_ou,
      time_created:data.time_created ,
      time_updated: data.time_updated,
      ssn: data.ssn,
      medicaid_id: data.medicaid_id,
      primary_insurance: {
        policy_number: policyNumberValue,
        policy_start_date: data.primary_insurance?.start_date.split('T')[0],
        policy_end_date: data?.primary_insurance?.end_date.split('T')[0],
      },
    });
    this.setAssociatedOUs(data.associated_ou);
    this.onChangeFormDisabledRemoved();
  }

  public get f():{[key:string]:AbstractControl} {  return this.editPatentsForm.controls; }

  public get n():{[key:string]:AbstractControl} { 
    return this.getCompletionMessageFormGroup.controls;
  }

  public get getCompletionMessageFormGroup(): FormGroup {
    return this.editPatentsForm.get('name') as FormGroup;
  }

  public editPatentsSubmit():void{
    this.submitted = true;
    if (this.editPatentsForm.invalid) {  return;}
    const filteredData = this.filterFormData(this.editPatentsForm.value);
    this.patientsSvc.editPatient(this.instituteName,filteredData).subscribe((data: CreatePatientResponse) => {
      if (data.status == status.StatusCode.OK) {
        this.navigateSvc.navigate([`/patients`],{ queryParams: { user_id: this.userId } });
      }else if(data.status == status.StatusCode.ERROR){
        this.showErrorTitleMsgModal(data)
      }
    })
  }

  public filterFormData(data: PatientData): FilteredPatientData {
    const aCookieValue = this.cookieService.getCookie("a");
    const filteredData: Partial<FilteredPatientData> = {};
    if (aCookieValue) { filteredData.a = aCookieValue }
    if (data.iid) filteredData.iid = data.iid;
    if (data.pid) {
      filteredData.pid = this.pidValueOfPatients;
      if(data.pid !== this.pidValueOfPatients){filteredData.new_pid = data.pid;}
    };
    if (data.dob) filteredData.dob = data.dob;
    if (data.sex) filteredData.sex = data.sex;
    if (typeof data.pcm_enabled === 'boolean') filteredData.pcm_enabled = data.pcm_enabled;
    if (data.medicaid_id) filteredData.medicaid_id = data.medicaid_id;
    if (data.ssn) filteredData.ssn = data.ssn;
    if (data.associated_ou && data.associated_ou.length > 0) {
      filteredData.associated_ou = data.associated_ou.map(ou => ou.id);
    } else if(!data.associated_ou.length) {
      filteredData.associated_ou = [];
    }
    if (this.hasValuesInGroup(data.name)) { filteredData.name = { ...data.name }; }
    if (this.hasValuesInGroup(data.address)) { filteredData.address = { ...data.address }; }
    if (this.hasValuesInGroup(data.primary_insurance)) {
      filteredData.primary_insurance = { ...data.primary_insurance };
    }
    return filteredData as FilteredPatientData;
  }

  private hasValuesInGroup(group: PatientName | PrimaryInsurance | PatientAddress): boolean {
    return Object.values(group).some(value => value !== '' && value !== null && value !== undefined);
  }

  public cancelEditPatientForm(): void {
    if(this.showDiscardMessage === true) {
      this.showSuccessPopup = true;
      this.modalTitleMessage = "Discard Patient Changes?";
      this.modalShowMessage = "You have unsaved changes to this patient, are you sure you want discard them?";
      this.modalCloseTextMessage = 'Discard';
    }else{
      this.navigateSvc.navigate([`/patients`],{ queryParams: { user_id: this.userId } });
    }
  }

  public showErrorTitleMsgModal(data:CreatePatientResponse) {
    this.showSuccessPopup = true;
    this.modalTitleMessage = data.status;
    this.modalCloseTextMessage = 'OK';
    if(data.message)this.modalShowMessage = data.message;
  }

  public cancelpopup(): void {this.showSuccessPopup = false; }

  public setAssociatedOUs(ff:string[]):void {
    let settingAssociatedOUs 
    settingAssociatedOUs = this.filteredChildData.filter(item => ff.includes(item.id));
    const associatedOuArray = this.editPatentsForm.get('associated_ou') as FormArray;
    while (associatedOuArray.length) {associatedOuArray.removeAt(0);}
    settingAssociatedOUs.forEach(item => {
      const formGroup = this.formBuilder.group({id: item.id,short_name: item.short_name,name: item.name});
      associatedOuArray.push(formGroup);
    });
  }

  public onChangeFormDisabledRemoved(): void {
    this.editPatentsForm.valueChanges.subscribe(() => {
      this.disabledFormChanged = true;
      this.showDiscardMessage = true;
    });
  }
   public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault();}
  }
  public performDiscardForm(showTitle:string): void {
    if(showTitle === "Discard Patient Changes?"){ this.navigateSvc.navigate([`/patients`],{ queryParams: { user_id: this.userId } });
    }else{ this.showSuccessPopup = false; }
  }
}