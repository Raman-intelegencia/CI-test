import { CookieService } from '@amsconnect/shared';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { UsersCsvPreviewInterfaceData, batchPreviewResponseData, csvPreviewBatchInterfaceData } from 'apps/admin/src/modals/csv_preview.models';
import { JobResponse } from 'apps/admin/src/modals/institutionsConfig.model';
import { InstitutionsConfigService } from 'apps/admin/src/services/institutionsConfig.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'web-messenger-upload-users-preview',
  templateUrl: './upload-users-preview.component.html',
  styleUrls: ['./upload-users-preview.component.scss'],
})
export class UploadUsersPreviewComponent implements OnInit {
  public newJobID:string | null = "";
  public subscription: Subscription = new Subscription();
  public newUserData:UsersCsvPreviewInterfaceData[] = [];
  public existingUserData:UsersCsvPreviewInterfaceData[] = [];
  public jobId!:string;
  public currentURL!: string;
  public uploadForm: FormGroup;
  public uploadTypes = [
    { value: 'new_user', label: 'Add new users only, skip existing users' },
    { value: 'new_and_existing_user', label: 'Add new users and update existing users' },
    { value: 'existing_user', label: 'Update existing users only' },
  ];

  public showSuccessPopup = false;
  public modalTitleMessage: string = "";
  public modalShowMessage: string = "";
  public csvUploadJobID!:string;
  constructor(
    public institutionsConfigService: InstitutionsConfigService,
    public cookieService: CookieService,
    public router: Router,
    public formBuilder: FormBuilder,
    ){
    this.currentURL = this.router.url;
    this.uploadForm = this.formBuilder.group({
      uploadType: new FormControl('')
    });    
  }


  ngOnInit(): void {
    this.getBatchUsersData()
  }

  public getBatchUsersData(): void {
    this.newJobID = new URLSearchParams(this.currentURL.split('?')[1]).get('jobID');
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a");
    if (aCookieValue) { 
      formData.append("a", aCookieValue); 
    }
    if(this.newJobID){
      formData.append("jobId",this.newJobID)
    }
    const uploadType = this.uploadForm.controls['uploadType'].value;
    if (uploadType !== "") {
      formData.append("uploadType", uploadType);
    }
    this.institutionsConfigService.userCSVUpdate(formData).subscribe((data: JobResponse | csvPreviewBatchInterfaceData | batchPreviewResponseData) => {
      if(data) {
        if(this.iscsvPreviewBatchInterfaceData(data)){
          this.existingUserData = data.existing_users;
          this.newUserData = data.new_users;
          this.jobId = data.job_id;
        }else{
          this.csvUploadJobID = data.job.id;
          this.modalTitleMessage = data.job.state;
          this.modalShowMessage = data.job.summary;
          this.showSuccessPopup = true;
        }
      }
    });
  }

  public cancelpopup(): void {
    this.showSuccessPopup = false; 
    this.navigateToPreviousURL();
  }

  public navigateToPreviousURL(): void {
    let modifiedURL1 = this.currentURL.match(/^(\/[^\/]+\/[^\/]+)/) ;
    let hignenergy = modifiedURL1 ? modifiedURL1[0] : ''
    this.router.navigate([`${hignenergy}`]);
  }  

  public iscsvPreviewBatchInterfaceData(data: JobResponse | csvPreviewBatchInterfaceData|batchPreviewResponseData): data is csvPreviewBatchInterfaceData {
    return (data as csvPreviewBatchInterfaceData).job_id !== undefined;
  }
  
}

