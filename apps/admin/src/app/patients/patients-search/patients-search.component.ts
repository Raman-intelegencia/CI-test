import { Component, DestroyRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../../services/patients.service';
import { Patient, PatientCSVRecord, PatientRecord } from '../../../modals/patients.model';
import { UserHelperService } from '../../../services/user-helper.service';
import { Subscription, catchError, of } from 'rxjs';
import { AppNavigationService } from '../../../services/app-navigation.service';

@Component({
  selector: 'web-messenger-patients-search',
  templateUrl: './patients-search.component.html'
})
export class PatientsSearchComponent implements OnInit {
  public userId = ""
  public patientSearchForm!: FormGroup;
  public patientRecords: PatientRecord[] = [];
  public selectedInstId = ""; //selected institution id variable
  public canViewPhi = false;
  public patientSearchApiCall = false;
  public showExportDataPopUp = false;
  public subscription!: Subscription;
  public getLastNameSearch:string = "";
  public getInstituteNameSearch:string = "";
  public noResultFound=false;
  public isLastNameDecrease=false;
  public DobState="dobIntial";
  public showLoader = false; 
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private patientsSvc: PatientsService,
    private router: Router,
    private userHelperSvc: UserHelperService,
    private destroyRef: DestroyRef,
    public navigateSvc: AppNavigationService,
  ) 
  {
    this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
  }

  public getBehaviourSubjectData(): void {
    this.subscription.add(
      this.patientsSvc.dataPatientInstitutionSearch$.subscribe((institutionSearch: string) => {
        if (institutionSearch != "") {
          this.getInstituteNameSearch = institutionSearch;
          this.patientsSvc.dataPatientLastNameSearch$.subscribe((lastNameSearch:any)=>{
            this.getLastNameSearch = lastNameSearch; 
          })
          this.getPatientsResultFromEditPage(this.getInstituteNameSearch,this.getLastNameSearch);
        }
      })
    );
  }

  ngOnInit(): void {
    this.subscription = this.userHelperSvc.viewPhi$
      .pipe(
        catchError((error) => {
          // Error handling logic
          console.error('Error occurred in viewPhi$ subscription:', error);
          // Return an Observable with a default boolean value
          return of(false);
        })
      )
      .subscribe(viewPhi => {
        // Handle the viewPhi state here
        this.canViewPhi = viewPhi;
      });

    this.userId = this.route.snapshot.queryParams['user_id'];

    this.patientSearchForm = this.fb.group({
      inst: ['', Validators.required],
      pSearch: [''],
      lastName: ['']
    });
    this.getBehaviourSubjectData();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.patientSearchForm.controls;
  }

  public receiveInstituteNameID(instId: string): void {
    this.selectedInstId = instId;
    this.patientSearchForm.get('inst')?.setValue(instId);
  }

  public checkIfInstSearchIsEmpty(event: boolean): void {
    if (event) {
      this.patientSearchForm.get('inst')?.setValue('');
    }
  }

  public getAllPatients(): void {
    this.patientSearchApiCall = false;
    if (this.patientSearchForm.invalid) {
      console.error('No institution selected');
      return;
    }
    this.showLoader = true; 
    this.patientsSvc.getAllPatients(this.selectedInstId, this.f['lastName'].value).subscribe(data => {
      this.showLoader = false; 
      if(this.DobState==="descending"){
        this.patientRecords = data.patients; 
        this.patientRecords.sort(function (a, b) {
          return b.dob.localeCompare(a.dob);
        });
      }
      else if(this.DobState==="asecending"){
        this.patientRecords = data.patients;    
        this.patientRecords.sort(function (a, b) {
          return a.dob.localeCompare(b.dob);
        });
      }
      else if(this.DobState==="dobIntial"){
        if(this.isLastNameDecrease){
          this.patientRecords = data.patients;      
          this.patientRecords=this.patientRecords?.map((item) => ( item )).reverse();
        }else{
          this.patientRecords = data.patients;
        }
      }
      
      this.canViewPhi = data.can_view_phi;
      this.patientSearchApiCall = true;
      if (data.patients) {
        this.patientsSvc.setPatientLastName(this.f['lastName'].value);
        this.noResultFound = false;
      }
      else{
        this.patientSearchApiCall = false;
        this.noResultFound=true;
      }
    })
  }
  public sortOnDobDecrease():void{
    this.DobState="descending";
    this.getAllPatients();
   }

   public sortOnDobIncrease():void{
     this.DobState="asecending";
     this.getAllPatients();
    }


  public convertUtcToLocalTime(utcDate: string | undefined): string {
    if (!utcDate) {
      return ""
    }
    const date = new Date(utcDate);
    const localTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localTime.toISOString();
  }


  // Step 1: Transform Data for CSV
  private getCSVData(patientsData: PatientRecord[]): PatientCSVRecord[] {
    return patientsData.map(patient => ({
      pid: patient.pid,
      name_prefix: patient.name_prefix,
      name_given: patient.given_name,
      name_middle: patient.middle_name,
      name_family: patient.last_name,
      name_suffix: patient.name_suffix,
      dob: patient.dob,
      sex: patient.sex,
      pcm_enabled: patient.pcm_enabled,
      associated_ou: patient.associated_ou && patient.associated_ou.length > 0 ? patient.associated_ou.join('; ') : '[]',
      time_created: patient.time_created,
      time_updated: patient.time_updated
    }));
  }

  // Step 2: Convert Data to CSV Format
  private convertToCSV(data: PatientCSVRecord[]): string {
    const csvHeader = data.length ? Object.keys(data[0]).join(',') + '\n' : '';
    const csvRows = data.map(row =>
      Object.values(row).map(field => {
        if (field === null || field === undefined) {
          return '""'; // Handle null or undefined fields
        }
        return `"${field.toString().replace(/"/g, '""')}"`; // Handle fields with commas or quotes
      }).join(',')
    ).join('\n');

    return csvHeader + csvRows;
  }

  // Step 3: Export to CSV
  public exportCSV(patientsData: PatientRecord[], filename: string): void {
    const csvData = this.getCSVData(patientsData);
    const csvString = this.convertToCSV(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Trigger the file download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.cancelExportDataPopup();
  }

  // Method to be called when the export button is clicked
  public onExportClick(): void {
    this.exportCSV(this.patientRecords, `patients_${this.selectedInstId}`);
  }

  public cancelExportDataPopup(): void {
    this.showExportDataPopUp = false;
  }

  public navigateToAddPatient(): void {
    this.navigateSvc.navigate([`/patients/add/${this.selectedInstId}`]);
  }

  public navigateToEditEditPatient(selectedPatient: Patient): void {
    this.navigateSvc.navigate([`/patients/edit/${selectedPatient.iid}/${selectedPatient.pid}`], { queryParams: { user_id: this.userId } });
  }

  public transformAssociated_ou(ous: string[], maxLength: number): string {
    let truncatedString = ous.join(', ').slice(0, maxLength);
    return ous.join(', ').length > maxLength ? truncatedString + '...' : truncatedString;
  }

  public getPatientsResultFromEditPage(institute:string,lastName:string):void{
    this.patientsSvc.getAllPatients(institute, lastName).subscribe(data => {
      this.patientRecords = data.patients;
      
      this.canViewPhi = data.can_view_phi;
      this.patientSearchApiCall = true;
      if(data.patients){
        this.patientsSvc.setPatientLastName(this.getLastNameSearch);
      }
    })
  }

  public sortOnLastName():void{
    this.isLastNameDecrease=true;
    this.DobState="dobIntial"
    this.getAllPatients();
   }

  public resetSortOnLastName():void{
    this.isLastNameDecrease=false;
    this.getAllPatients();
  } 
}
