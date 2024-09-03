import { Component, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { JobsService } from '../../../../services/jobs.service'
import { DateUtilsService } from '@amsconnect/shared';
import { environment } from 'libs/shared/src/lib/config/environment';
import { Subscription } from 'rxjs';
import { ApiJobResponse, Job } from 'apps/admin/src/modals/jobs.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobState } from '../../../../modals/jobs.model';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AppNavigationService } from '../../../../services/app-navigation.service';

@Component({
  selector: 'web-messenger-all-jobs',
  templateUrl: './all-jobs.component.html',
  styleUrls: ['./all-jobs.component.scss'],
  providers: [DatePipe]
})
export class AllJobsComponent implements OnInit,OnDestroy {
  public timeRangeForm!: FormGroup;
  public domainKey: string;
  public subscription: Subscription = new Subscription;
  public jobList: Job[] = [];
  public showSuccessPopup = "";
  public jobStates = JobState;
  public newJobID: string | null = "";
  public currentURL!: string;
  public HeaderMessage: string = "";
  public AllBatchJobs: boolean = false;
  public showAllJobsButton: boolean = true;
  public getCurrentTimeZone:string = ""; 
  public localTimeZone = '';
  public intervalId: any;
  public afterID:string| undefined = "";
  public beforeID:string = "";
  public showLoader:boolean = false;
  public setCounter:number = 0;
  public scrollBeginOrNot:boolean = false;
  public previousScrollPosition = 0;
  public scrollTimeout: any;
  public canInvokeScrollFunction = true;
  public isLoader = false

  constructor(public router: Router,private fb: FormBuilder,private JobsService: JobsService, public navigateSvc: AppNavigationService, 
    private dateUtilSvc: DateUtilsService,
    private elementRef: ElementRef) {
    this.domainKey = environment.domain_key;
    this.currentURL = this.router.url;
    this.AllBatchJobs = this.router.url.includes('/jobs/all');
  }
  ngOnInit(): void {
    this.localTimeZone= Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.getCurrentTimeZone = new Date().toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2] == 'GMT+5:30' 
    ? 'IST' 
    :new Date().toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2];
    this.loadMyBatchData();    
  }
  public loadMyBatchData(): void {
    this.initDateTimeForm();
    this.AllBatchJobs ? this.getAllBatchJobs() : this.getMyBatchJobs();
  }
  private initDateTimeForm(): void {
    this.timeRangeForm = this.fb.group({
      timeFrom: [null, Validators.required],
      timeTo: [null, Validators.required]
    });
  }

  public convertToTimeZone(formatteddate: string,shiftOneDay:boolean,toDateShift?:boolean):string {
    let dateString:string;
    let timeZoneOffset: string;
    let finalDateTimeGmt:string;
    switch (this.localTimeZone) {
      case 'Asia/Calcutta':
        if(shiftOneDay === true){
        const dateObject = new Date(formatteddate);
        const increasedDate = new Date(dateObject);
        increasedDate.setDate(dateObject.getDate() - 1);
        return finalDateTimeGmt = `${this.dateUtilSvc.formatDate(increasedDate)}T18:30:00Z`;
        }else{
          return finalDateTimeGmt = `${formatteddate}T18:30:00Z`;
        }
      default:
        dateString = new Date().toString();
        timeZoneOffset = this.dateUtilSvc.extractTimeZoneOffsetIncludeDST(dateString,formatteddate);
        if(toDateShift === true){
          const dateObject = new Date(formatteddate);
          const increasedDate = new Date(dateObject);
          increasedDate.setDate(dateObject.getDate() + 1);
          return finalDateTimeGmt = `${this.dateUtilSvc.formatDate(increasedDate)}T${timeZoneOffset}:00Z`;
        }else{
          return finalDateTimeGmt = `${formatteddate}T${timeZoneOffset}:00Z`;
        }
    }
  }

  public getMyBatchJobs(): void {
    this.isLoader = true;
    let ownerParam: boolean | undefined;
    let bucketParam: string | undefined;
    this.newJobID = new URLSearchParams(this.currentURL.split('?')[1]).get('bucketName');
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const formattedDate = (date: Date): string => { return date.toISOString(); };

    this.timeRangeForm.get('timeFrom')?.setValue(this.formattedDate(oneWeekAgo));
    this.timeRangeForm.get('timeTo')?.setValue(this.formattedDate(currentDate));

    bucketParam = undefined;
    ownerParam = true;
    
    this.subscription.add(
      this.JobsService.getAllJobs(this.convertToTimeZone(this.formattedDate(currentDate),false,true), this.convertToTimeZone(this.formattedDate(oneWeekAgo),true), ownerParam, bucketParam)
        .subscribe((data: ApiJobResponse) => {
          this.isLoader = false;
          if (data.status === "ok") {
            let allJobs = data.jobs;
            if(data.before){
              this.beforeID = data.before;
            }
            this.jobList = allJobs.map(job => {
              return {
                ...job,
                time_created: this.dateUtilSvc.changeTimezone(job.time_created)
              };
            });
            if(data.jobs !== undefined){
              this.afterID = data.jobs.filter((item)=> item.state=="aborted" || item.state=="new" ).at(-1)?.id;
              this.runAfterJob();
            }
          }
        })
    );
  }
  //Here API trigger for getting MY Batch Files details
  public getAllBatchJobs(): void {
    this.isLoader = true;
    this.showAllJobsButton = false;
    this.AllBatchJobs = true;
    let ownerParam: boolean | undefined;
    let bucketParam: string | undefined;
    this.newJobID = new URLSearchParams(this.currentURL.split('?')[1]).get('bucketName');
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    oneWeekAgo.setHours(23, 59, 59, 999);
    const formattedDate = (date: Date): string => { return date.toISOString();};
    this.timeRangeForm.get('timeFrom')?.setValue(this.formattedDate(oneWeekAgo));
    this.timeRangeForm.get('timeTo')?.setValue(this.formattedDate(currentDate));

    this.subscription.add(
      this.JobsService.getAllJobs(this.convertToTimeZone(this.formattedDate(currentDate),false,true), this.convertToTimeZone(this.formattedDate(oneWeekAgo),true), ownerParam, bucketParam)
        .subscribe((data: ApiJobResponse) => {
          this.isLoader = false;
          if (data.status === "ok") {
            let allJobs = data.jobs;
            if(data.before){ this.beforeID = data.before;}
            this.jobList = allJobs.map(job => {
              return {...job, time_created: this.dateUtilSvc.changeTimezone(job.time_created)}});
            if(data.jobs !== undefined){
              this.afterID = data.jobs.filter((item)=> item.state=="aborted" || item.state=="new" ).at(-1)?.id;
              this.runAfterJob();
            }
          }}));
  }

  public refreshMyBatchTab(): void { this.loadMyBatchData();}

  public navigateToDetails(job: Job): void {
    let navigateToDetails = this.AllBatchJobs ? "/jobs/all" : "/jobs/mine";
    this.navigateSvc.navigate([`/job/${job?.id}`], { queryParams: { navigationFrom: navigateToDetails } })
  }
  // Implement your logic to format the date to match the datetime-local input format
  public formattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  public listAllBatchFile(): void { this.navigateSvc.navigate([`/jobs/all`]);}

  //Here on clicking of this function selected datetime  API trigger for getting MY Batch details
  public onBatchJobsSearch(): void {
    if (this.timeRangeForm.valid) {
      const parsedDateTo = new Date(this.timeRangeForm.get('timeTo')?.value);
      const parsedDateFrom = new Date(this.timeRangeForm.get('timeFrom')?.value);
      parsedDateTo.setHours(23, 59, 59, 999);
      parsedDateFrom.setHours(0, 0, 0, 0);
      const formattedDateTo = parsedDateTo.toISOString();
      const formattedDateFrom = parsedDateFrom.toISOString();

      const formattedDateToAccordingTimezone = this.convertToTimeZone(this.timeRangeForm.get('timeTo')?.value,false,true);
      const formattedDateFromAccordingTimezone = this.convertToTimeZone(this.timeRangeForm.get('timeFrom')?.value,true);
      
      let owner = this.router.url.includes('/jobs/all') ? undefined : true;
      this.subscription.add(this.JobsService.getAllJobs(formattedDateToAccordingTimezone, formattedDateFromAccordingTimezone, owner).subscribe((data: ApiJobResponse) => {
        if (data.status == "ok") {
          this.jobList = data.jobs.map(job => {
            return {...job, time_created: this.dateUtilSvc.changeTimezone(job.time_created)}});

          if(this.jobList !== undefined){
            this.afterID = data.jobs.filter((item)=> item.state=="aborted" || item.state=="new" ).at(-1)?.id;
            this.runAfterJob();
          }
        }}))
      }
  }
  ngOnDestroy(): void {
    if (this.intervalId) { clearInterval(this.intervalId);}
    this.subscription.unsubscribe();
  }

  public capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public navigateToBucket(): void { this.navigateSvc.navigate([`/filearea/${this.newJobID}`]); }

  public runAfterJob(): void {
    clearInterval(this.intervalId);
    const delay = 30000;
    this.intervalId = setInterval(() => { this.runAgainAfterJobsFetchedUsingAfterKey();}, delay);
  }

  public runAgainAfterJobsFetchedUsingAfterKey(isBeforeAfterKey?:string): void {
    this.AllBatchJobs = true;
    this.newJobID = new URLSearchParams(this.currentURL.split('?')[1]).get('bucketName');
    const currentDate = this.timeRangeForm.get('timeTo')?.value;
    const oneWeekAgo = this.timeRangeForm.get('timeFrom')?.value;

    let apiCall;
    if(this.router.url.includes('/jobs/all')  && isBeforeAfterKey === 'before'){
      apiCall = this.JobsService.getBeforeJobsOnInterval(this.convertToTimeZone(currentDate,false,true), 
      this.convertToTimeZone(oneWeekAgo,true),this.beforeID)
      this.showLoader = true
    }else if(this.router.url.includes('/jobs/mine')  && isBeforeAfterKey === 'before'){
      apiCall = this.JobsService.getBeforeJobsOnInterval(this.convertToTimeZone(currentDate,false,true), 
      this.convertToTimeZone(oneWeekAgo,true),this.beforeID,true)
      this.showLoader = true
    } else{
      apiCall = this.JobsService.getAfterJobsOnInterval(this.convertToTimeZone(currentDate,false,true), 
      this.convertToTimeZone(oneWeekAgo,true),this.afterID)
    }
    this.subscription.add(
      apiCall.subscribe((data: ApiJobResponse) => {
        if(data.jobs.filter((item)=> item.state=="aborted" || item.state=="new" ).at(-1)?.id === undefined){
          this.afterID = undefined;
        }
          if (data.status === "ok") {
            if(data.jobs.length > 0) {
              let intervalJobs = data.jobs
              .filter(item2 => !this.jobList.some(item1 => item1.id === item2.id))
              .map(job => {
                return { ...job,time_created: this.dateUtilSvc.changeTimezone(job.time_created)}});
              this.showLoader = false;
              this.jobList.push(...intervalJobs);
            }
            if(this.router.url.includes('/jobs/all')  && isBeforeAfterKey === 'before'){
              if(this.setCounter >= 2){
                this.setCounter = 0;
                if(data.before){ this.beforeID = data.before;}
              }
            }
            if(this.router.url.includes('/jobs/mine')  && isBeforeAfterKey === 'before'){
              if(this.setCounter >= 2){
                this.setCounter = 0;
                if(data.before){ this.beforeID = data.before; }
              }
            }
          }
        })
    );
  }

  @HostListener('scroll', ['$event']) onScroll(event: Event) {
    if (!this.canInvokeScrollFunction) {
      return;
    }
    const target = event.target as HTMLElement;
    const currentScrollPosition = target.scrollTop;

    if (currentScrollPosition > this.previousScrollPosition) {
      const scrollPercentage = (currentScrollPosition + target.clientHeight) / target.scrollHeight * 100;
      if (scrollPercentage >= 85) {
        this.scroll('before');
        this.canInvokeScrollFunction = false;
        this.resetScrollFunctionTimeout();
    }}
    this.previousScrollPosition = currentScrollPosition;
  }

  public resetScrollFunctionTimeout():void {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.canInvokeScrollFunction = true;
    }, 3000);
  }

  public scroll(scrollKeyItem:string):void{
    this.setCounter++;
    this.runAgainAfterJobsFetchedUsingAfterKey(scrollKeyItem);
  }

  public navigateToUser(userId:string):void{
    this.navigateSvc.navigate([`/user/${userId}`]);
  }

  public navigateToInstitution(instId:string):void{
    this.navigateSvc.navigate([`/institution/${instId}`]);
  }


  public getProgressPercentage(processPercentage:number): string {
    if(processPercentage){
      return `${((Math.round(processPercentage * 100) / 100) * 100).toFixed(0)} %`;
    }else{
      return "0 % ";
    }
  }
}