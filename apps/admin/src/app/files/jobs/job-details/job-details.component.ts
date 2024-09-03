import { Component, Input, OnChanges, OnDestroy, OnInit, SecurityContext, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobsService } from '../../../../services/jobs.service'
import { CookieService, DateUtilsService } from '@amsconnect/shared';
import { environment } from '@amsconnect/shared';
import { Subscription } from 'rxjs';
import { ApiJobDetailResponse, BroadcastMessagingActionsResponse, BroadcastMessagingResponse, BroadcastMessagingSummaryResponse, FormDataInterface, Job, Parameter } from '../../../../modals/jobs.model';
import { FormBuilder } from '@angular/forms';
import { JobState } from '../../../../modals/jobs.model';
import { UserInfoService } from '../../../../services/user-info.service';
import { AppNavigationService } from '../../../../services/app-navigation.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'web-messenger-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() jobId = "";
  public showSuccessPopup = "";
  public jobList: Job | null = null;
  public domainKey: string;
  public subscription: Subscription = new Subscription;
  public currentURL!: string;
  public jobStates = JobState;
  public rerun = false;
  public abort = false;
  public parameters!: Parameter[];
  public backtoMybatch = false;
  public showDownloadreportPopUp = false;
  public recipientUrl= "";
  public timeReminingShow:boolean= false;
  public timeReminingMessage:string= "";
  public typeofProcessor:string = "";
  public broadCastSummaryData!:BroadcastMessagingSummaryResponse;
  public jobListActions!:BroadcastMessagingActionsResponse;
  public constOfBroadcastMesseging:string = "broadcast_messaging";

  constructor(private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private jobsService: JobsService,
    private cookieService: CookieService,
    private dateUtilSvc: DateUtilsService,
    public navigateSvc: AppNavigationService,
    private sanitizer: DomSanitizer) {
    this.domainKey = environment.domain_key;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadMyBatchData(this.jobId);
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const someData = params['navigationFrom'];
      this.backtoMybatch = (someData == "/jobs/mine") ? false : true;
    });
    this.loadMyBatchData(this.jobId);
  }
  public loadMyBatchData(jobId: string): void {
    if (jobId) {
      this.subscription.add(
        this.jobsService.getJobDetails(jobId).subscribe((data: ApiJobDetailResponse) => {
          if (data.status === 'ok') {
            const jobList = data.job;
            jobList.time_created = this.dateUtilSvc.changeTimezone(jobList.time_created);
            jobList.time_end = this.dateUtilSvc.changeTimezone(jobList.time_end);
            jobList.time_start = this.dateUtilSvc.changeTimezone(jobList.time_start);
            this.jobList = jobList;
            this.parameters = this.jobList.values;
            this.typeofProcessor = data.job.processor
            if(data.job.actions){
              this.jobListActions = data.job.actions;
            }
            switch (data.job.allowed_states[0]) {
              case undefined:
                this.rerun = true;
                this.abort = true;
                this.timeReminingShow = false;  
                break;
              case "rerun":
                  this.rerun = false;
                  this.abort = true;  
                break;
              case "aborted":
                this.rerun = true;
                this.abort = false;  
                break;
            }
            this.getSummaryBroadcastMessaging(this.jobId);
          }
        })
      );
    } else {
      console.error('Job ID is null or undefined');
    }
  }
  public handleRerun(): void {
    if (this.jobId) {
      this.jobsService.rerunJobDetails(this.jobId, "rerun").subscribe((data: ApiJobDetailResponse) => {
        if (data.status === "ok") {
          this.navigateSvc.navigate(['/jobs/all']);
        }
      })
    }
  }
  public handleAbort(): void {
    if (this.jobId) {
      this.jobsService.rerunJobDetails(this.jobId, "aborted").subscribe((data: ApiJobDetailResponse) => {
        if (data.status === "ok") {
        this.loadMyBatchData(this.jobId);
        }
      })
    }
  }
  public viewanddownloadReceipt(receipt_url:string,event: MouseEvent,type:string,isBroadCastMesseging?:boolean): void {
    event.preventDefault();
    this.recipientUrl = receipt_url;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const formData = this.constructFormData()
    if(type=="view")
    {
      this.jobsService.viewReceiptDetails(receipt_url, formData).subscribe((response: Blob) => {
        const reader = new FileReader();
          reader.onload = () => {
              const content = reader.result as string;
              const blobUrl = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
              let tab = window.open();
              if(tab) tab.location.href = blobUrl;
          };
          reader.readAsText(response);
      }, (error) => {
        console.error('Error downloading file:', error);
      });
    }
    else if(type == "download" ){
      if(!this.jobList?.has_phi){
        if(isBroadCastMesseging === true){
          this.downloadReportFileOnCompletedStatus(isBroadCastMesseging);
        }else{
          this.downloadReportFileOnCompletedStatus();
        }
      }else{
        this.showDownloadreportPopUp = true;
      }
  }
  }

  public viewDownloadFile(type: string): void {
    if (type && this.jobId) {
      let viewDownloadFiles;
      let format = 'csv';
      const formData = this.constructFormData();
      if (type == 'viewFile' && !this.jobList?.has_phi) {
        this.jobsService.downloadJobDetails(this.jobId, formData).subscribe((response: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result as string;
            const blobUrl = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
            // Open the blob URL in a new tab
            let tab = window.open();
            if(tab) tab.location.href = blobUrl;
          };
          reader.readAsText(response);
        }, (error) => {
          console.error('Error downloading file:', error);
        });
      }
      else if (type == 'downloadFile') {
        if(!this.jobList?.has_phi){
          this.downloadReportFile()
        }else{
          this.showDownloadreportPopUp = true;
        }
      }
    }
  }

  public downloadReportFileOnCompletedStatus(broadCastMesseging?:boolean):void{
    const formData = this.constructFormData();
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    let dataforDownload:string="";
    if(broadCastMesseging === true){
      dataforDownload = this.jobListActions.details;
    }else{
      dataforDownload = this.jobId;
    }
    this.jobsService.viewReceiptDetails(dataforDownload,formData).subscribe((response: Blob) => {
      const blobUrl = URL.createObjectURL(response);
      const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, blobUrl) || '';
      if(sanitizedUrl){
          const link = document.createElement('a');
          link.href = sanitizedUrl;
          let filename: string = '';
          if(broadCastMesseging === true) {
            link.setAttribute('download', `broadcast-recipients_${currentTimeInSeconds}.csv`);
          }else{
            link.setAttribute('download', `Receipt_Dowload_${currentTimeInSeconds}.csv`);
          }
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
      }
    }, (error) => {
      console.error('Error downloading file:', error);
    });
  }

  public downloadReportFile():void{
    const formData = this.constructFormData();
    this.jobsService.downloadJobDetails(this.jobId, formData).subscribe((response: Blob) => {
      const blobUrl = URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = blobUrl;
      let filename: string = '';

      if (this.jobList && this.jobList.filename && this.jobList.filename.endsWith('.csv')) {
        filename = this.jobList.filename.slice(0, -4);
      }
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, (error) => {
      console.error('Error downloading file:', error);
    });
  }

  // Method to be called when the export button is clicked
  public onExportreport(): void {
    if(this.jobList?.state === this.jobStates.Completed){
      this.downloadReportFileOnCompletedStatus();
    }else{
      this.downloadReportFile();
    }
    this.cancelDownloadreportPopUp();
  }

  public cancelDownloadreportPopUp(): void {
    this.showDownloadreportPopUp = false;
  }

  

  public constructFormData():FormDataInterface{
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
    const formData:FormDataInterface = {
      force_download: true,
      inline: true,
      a: aCookieValue,
      'X-cureatr-user': userId
    };
    return formData;
  }

  public navigateToBack(): void {
    (this.backtoMybatch) ? this.navigateSvc.navigate([`/jobs/all`]) : this.navigateSvc.navigate([`/jobs/mine`])
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public handleRefresh(): void {
    if (this.jobId) {
      this.jobsService.reRefreshDetails(this.jobId).subscribe((data: ApiJobDetailResponse) => {
        if (data.status === "ok") {
          if(data?.job?.time_remaining){
            this.timeReminingShow = true;
            this.timeReminingMessage = data?.job?.time_remaining;
          }
          this.loadMyBatchData(this.jobId);
        }
      })
    }
  }

  public navigateToPath(path:string):void{
    this.navigateSvc.navigate([`${path}`]);
  }

  public navigateToInstitution(instituteName:string):void{
    this.navigateSvc.navigate([`/institution/${instituteName}`]);
  }

  public getSummaryBroadcastMessaging(jobId: string):void{
    if(jobId){
      if(this.typeofProcessor === 'broadcast_messaging'){
        this.subscription.add(
          this.jobsService.getBroadcastMessagingSummaryDetails(this.jobListActions.summary).subscribe((data: BroadcastMessagingResponse) => {
            if (data.status === 'ok') {
              this.broadCastSummaryData = data.summary;
            }
          })
        );
      }else {
        console.error('Job ID is null or undefined');
      }
    }
  }

}