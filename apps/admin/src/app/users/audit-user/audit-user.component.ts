import { Component, DestroyRef, Input, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { CookieService, UserService } from '@amsconnect/shared';
import { Subscription } from 'rxjs';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DateUtilsService } from '@amsconnect/shared';
import { UserInfoService } from 'apps/admin/src/services/user-info.service';

@Component({
  selector: 'web-messenger-audit-user',
  templateUrl: './audit-user.component.html',
  styleUrls: ['./audit-user.component.scss'],
})
export class AuditUserComponent implements OnInit {
  @Input() userId = '';
  @Input() userName = '';
  public currentUserId = '';
  public subscription = new Subscription();
  public auditForm!: FormGroup;
  public localTimeZone = '';
  public auditNote = '';
  public showAuditNotePopUp = false;
  public formatType = 'txt';
  public successError = '';
  public showErrorPopup = false;
  public submitted = false;
  public currentMonthDate = "";
  public getCurrentTimeZone:string = ""; 
  public showSuccessPopup:boolean= false;
  public modalTitleMessage = "";
  public modalShowMessage = "";
  constructor(
    private userSvc: UsersService,
    private userDataSvc: UserService,
    private cookieSvc: CookieService,
    private fb: FormBuilder,
    private destroySub: DestroyRef,
    private dateUtilSvc: DateUtilsService,
    public userInfoSvc: UserInfoService
  ) {
    this.destroySub.onDestroy(() => {
      this.subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
    this.currentMonthDate = this.dateUtilSvc.formatDate(new Date());
    this.subscription = this.userDataSvc.userId$.subscribe(id => this.currentUserId = id);
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.localTimeZone = localTimeZone;
    this.getCurrentTimeZone = new Date().toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2] == 'GMT+5:30' 
    ? 'IST' 
    :new Date().toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2];
    this.initializeForm();
    // Subscribe to changes in 'timespan' control
    this.auditForm.get('timespan')?.valueChanges.subscribe(value => {
      if (value === 'all') {
        // Set 'From' date to 7 days ago
        this.updateDateRange(this.dateUtilSvc.getDaysAgo(7), null);
      } else if (value === 'custom') {
        // Set 'From' date to the same date of the previous month
        this.updateDateRange(this.dateUtilSvc.getPreviousMonthDate(), null);
      }
    });
  }

  private initializeForm():void{
    this.auditForm = this.fb.group({
      timespan: ['custom'], // 'messageFromCustomDateRange' selected by default
      customDateRange: this.fb.group(
        {
          from: ['', Validators.required], // Set one month before today's date
          to: ['', Validators.required], // Set today's date
        },
        { validators: this.dateRangeValidator } as AbstractControlOptions
      ),
      timezone: ['US/Central'], // CST timeZone selected by default
    });
    this.auditForm.get('customDateRange')?.patchValue({
      from: this.dateUtilSvc.formatDate(this.dateUtilSvc.getPreviousMonthDate()),
      to: this.dateUtilSvc.formatDate(new Date()),
    });
  }

  public updateDateRange(fromDate: Date, toDate: Date | null): void {
    this.auditForm.get('customDateRange')?.patchValue({
      from: this.dateUtilSvc.formatDate(fromDate),
      to: this.dateUtilSvc.formatDate(toDate ? toDate: new Date())
    });
  }

  public dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    return from && to && from > to ? { dateRangeInvalid: true } : null;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.auditForm.controls;
  }

  public getUserAuditLogs(
    format: string,
    timeZone: string,
    note: string,
    fromTime: string,
    toTime: string
  ): void {
    const aCookieValue = this.cookieSvc.getCookie('a');
    const formData = new FormData();
    formData.append('user_id', this.userId);
    formData.append('time_from', fromTime);
    formData.append('time_to', toTime);
    formData.append('note', note);
    formData.append('format', format);
    formData.append('timeZone', timeZone);
    formData.append('X-cureatr-user', this.currentUserId);

    if (aCookieValue) {
      formData.append('a', aCookieValue);
    }
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const reponseType = this.formatType === 'json' ? 'blob' : 'text';

    this.userSvc.getAuditUserLogs(formData, reponseType).subscribe((data) => {
      if (typeof data === "string") {
        if (data.startsWith('{')) {
          this.showErrorModalpopup('Error',JSON.parse(data).message);
        }else{
          let blobData;
        let mimeType;
        // Determine MIME type based on format
        // eslint-disable-next-line prefer-const
        mimeType = format === 'json' ? 'application/json' : 'text/plain';
  
        if (typeof data === 'string' || format === 'json') {
          // If the response is a string or JSON, convert it to a Blob
          blobData = new Blob([data], { type: mimeType });
        } else {
          // If the response is already a Blob, use it directly
          blobData = data;
        }
  
        const blobUrl = URL.createObjectURL(blobData);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `audit_log_${this.userName}_${currentTimeInSeconds}.${format}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
        this.cancelAuditNotePopup();
        this.submitted = false;
        }
      }else{
        let blobData;
        let mimeType;
        // Determine MIME type based on format
        // eslint-disable-next-line prefer-const
        mimeType = format === 'json' ? 'application/json' : 'text/plain';
  
        if (typeof data === 'string' || format === 'json') {
          // If the response is a string or JSON, convert it to a Blob
          blobData = new Blob([data], { type: mimeType });
        } else {
          // If the response is already a Blob, use it directly
          blobData = data;
        }  
        const blobUrl = URL.createObjectURL(blobData);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `audit_log_${this.userName}_${currentTimeInSeconds}.${format}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
        this.cancelAuditNotePopup();
        this.submitted = false;
      }
    });
  }

  public getAuditUserFormData(): void {
    const fromTime = this.dateUtilSvc.auditUserConvertFromDateUnix(`${this.f['customDateRange'].value.from}T00:00:00`,this.localTimeZone);
    const toTime = this.dateUtilSvc.auditUserConvertToDateUnix(`${this.f['customDateRange'].value.to}T00:00:00`,this.localTimeZone);
    this.getUserAuditLogs(
      this.formatType,
      this.f['timezone'].value,
      this.auditNote,
      fromTime.toString(),
      toTime.toString()
    );
  }

  public openAuditNotePopUp(formatType: string): void {
    this.submitted = true;
    // Check if the auditForm is invalid or if the date range is invalid
    if (this.auditForm.invalid || this.f['customDateRange'].errors?.['dateRangeInvalid']) {
      // If the date range is invalid, clear the 'To' date field
      if (this.f['customDateRange'].errors?.['dateRangeInvalid']) {
        this.updateDateRange(this.dateUtilSvc.getPreviousMonthDate(), null);
      }
      return;
    }
    this.showAuditNotePopUp = true;
    this.formatType = formatType;
  }

  public cancelAuditNotePopup(): void {
    this.showAuditNotePopUp = false;
    this.auditNote = '';
  }

  public onAuditNoteChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.startsWith(' ')) {
      inputElement.value = ''; // Clear the input
      this.auditNote = ''; // Update the form control value
    }
  }

  public cancelpopup(): void { 
    this.showSuccessPopup = false; 
  }

  public showErrorModalpopup(title:string, message:string): void { 
    this.showAuditNotePopUp = false;
    this.showSuccessPopup = true;
    this.modalTitleMessage=title;
    this.modalShowMessage =  message;
  }
}
