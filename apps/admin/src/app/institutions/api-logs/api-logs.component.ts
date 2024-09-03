import { CookieService, DateUtilsService, UpdateStatusResponse, createShiftResponse } from '@amsconnect/shared';
import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InstitutionsAPILogsDataResponse, LogsData } from 'apps/admin/src/modals/instituteApiLogs.model';
import { Actor, ApiLogData, EventObject, ProcessedUserEventData, UserEventData, UserEventLogResponse } from 'apps/admin/src/modals/users.model';
import { InstitutionsEventsLogsService } from 'apps/admin/src/services/institutionsEventLog.service';
import { UsersService } from 'apps/admin/src/services/users.service';
import { DEFAULT_DAYS_OF_WEEK } from './daysOfWeek';
import { TimeSelectSearchComponent } from '../../generic/timeSearchSelect/time-select-search.component';
import { AppNavigationService } from 'apps/admin/src/services/app-navigation.service';

@Component({
  selector: 'web-messenger-api-logs',
  templateUrl: './api-logs.component.html'
})
export class ApiLogsComponent implements OnInit {
  @Input() instituteId = "";
  public eventLogsData: ProcessedUserEventData[] = [];
  public eventNamesData: { [key: string]: string } = {};
  public actorsData: Actor[] = [];
  public eventObjectsData: EventObject[] = [];
  public sortedEventNamesData: { [key: string]: string }[] = [];
  public filteredEventNamesData: { [key: string]: string }[] = [];
  public eventSearchForm!: FormGroup;
  public eventLogResultsLimited = false;
  public showFullEventData = false;
  public fullEventData = '';
  public isEventNameInputFocused = false;
  public selectedEventNameValue = "";
  public currentDate = "";
  public showLoader = false;
  public searchAPIData:LogsData[]=[];
  public selectedApiLogsData!:LogsData;
  public showSelectedApiLogsDetailsModal:boolean= false;
  @ViewChild(TimeSelectSearchComponent) childComponent!: TimeSelectSearchComponent;
  public getUNIXFromDateTime!:number;
  public getUNIXToDateTime!:number; 
  public showNoDataMessage:boolean = false;
  public showInvalidDateTime = false;

  constructor(
    private userSvc: UsersService,
    private fb: FormBuilder,
    public dateUtilSvc: DateUtilsService,
    public institutionsEventsSvc: InstitutionsEventsLogsService,
    public cookieSvc: CookieService,
    public router: Router,
    public navigateSvc: AppNavigationService,
  ) {
      this.initializeApiLogsForm();
  }

  ngOnInit(): void {
    this.currentDate = this.dateUtilSvc.formatDate(new Date());
    this.setApiLogsFormValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instituteId'].currentValue) {
      this.initializeData();
    }
  }

  public initializeApiLogsForm():void{
    this.eventSearchForm = this.fb.group({
      fromDate: new FormControl('', Validators.required),
      toDate: new FormControl('', Validators.required),
      eventName: new FormControl('',),
      showOnlyErrors: new FormControl(false),
      url_prefixes: new FormControl(""),
      user_ids: new FormControl(""),
      selectedTime: new FormControl(""),
      fromTime:new FormControl("")
    }, { validators: this.dateRangeValidator } as AbstractControlOptions);
  }
  
  public DateRangeShowError(event: boolean): void {
    this.showInvalidDateTime = event;
  }

  public setApiLogsFormValue():void{
    this.eventSearchForm.patchValue({
      fromDate: this.dateUtilSvc.formatDate(this.dateUtilSvc.getDaysAgo(7)),
      toDate: this.dateUtilSvc.formatDate(new Date())
    });
  }

  public dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const from = group.get('fromDate')?.value;
    const to = group.get('toDate')?.value;
    return from && to && from > to ? { 'dateRangeInvalid': true } : null;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.eventSearchForm.controls;
  }

  public updateDateRange(fromDate: Date, toDate: Date | null): void {
    this.eventSearchForm.patchValue({
      fromDate: fromDate,
      toDate: toDate
    });
  }

  private initializeData(): void {
    this.eventLogsData = [];
    this.searchAPIData = [];
  }

  public searchUserEvents(isLoadMore: boolean): void {
    this.showLoader = true;
    this.triggerChildFunction();

    let lastEventId = '';
    if (this.searchAPIData.length) {
      lastEventId = this.searchAPIData[this.searchAPIData.length - 1].id;
    }
    const fromDate = this.dateUtilSvc.toUnixTime(new Date(this.f['fromDate'].value));
    const toDate = this.dateUtilSvc.toUnixTime(new Date(this.f['toDate'].value));
    let apiCall;
    let apiCallPayloadObject: ApiLogData = {
      typeofEventLogsData : this.eventSearchForm.value.showOnlyErrors,
      userId: this.instituteId,
      fromDate: this.getUNIXFromDateTime,
      toDate:this.getUNIXToDateTime,
      limit: 100,
      url_prefixes: this.eventSearchForm.value.url_prefixes,
      user_ids: this.eventSearchForm.value.user_ids,
    }
    if (!isLoadMore) {
      if (this.eventSearchForm.invalid || this.eventSearchForm.errors?.['dateRangeInvalid']) {
        // If the date range is invalid, clear the 'To' date field
        if (this.eventSearchForm.errors?.['dateRangeInvalid']) {
          this.updateDateRange(this.dateUtilSvc.getDaysAgo(7), new Date());
        }
        return;
      }
      apiCall = this.institutionsEventsSvc.searchInstituteApiLogsEvents(
        apiCallPayloadObject
        )
    } else {
      apiCallPayloadObject.lastEventId = lastEventId;
      apiCall = this.institutionsEventsSvc.searchInstituteApiLogsEvents(
        apiCallPayloadObject
        );
    }

    apiCall.subscribe(data => {
      this.eventLogResultsLimited = data.results_limited;
      if (isLoadMore) {
        this.searchAPIData.push(...data.logs);
        data.logs.length == 0 ?  this.showNoDataMessage = true : this.showNoDataMessage = false;
      } else {
        this.searchAPIData = data.logs;
        data.logs.length == 0 ?  this.showNoDataMessage = true : this.showNoDataMessage = false;
      }
      this.showLoader = false;
    })
  }

  public openEventDataModal(eventData: string): void {
    this.fullEventData = eventData;
    this.showFullEventData = true;
  }

  public closeFullEventDataModal(): void {
    this.showFullEventData = false;
    this.fullEventData = '';
  }

  public selectedEventName(eventName: { [key: string]: string }): void {
    this.selectedEventNameValue = eventName['key']
    this.eventSearchForm.patchValue({
      eventName: eventName['value']
    })
    this.isEventNameInputFocused = false;
  }

  public handleEventNameInputBlurEvent(): void {
    setTimeout(() => {
      this.isEventNameInputFocused = false;
      // If no institute is selected, keep the search text in the form control
      if (!this.selectedEventNameValue) {
        const searchText = this.eventSearchForm.get('eventName')?.value;
        if (searchText) {
          this.eventSearchForm.get('eventName')?.setValue(searchText);
        }
      }
    }, 200); // Delay of 200ms (you can adjust this based on your needs)
  }
  
  public showSearchApiLogsDetailsModal(data:LogsData): void {
    this.selectedApiLogsData = data;
    this.showSelectedApiLogsDetailsModal = true;
  }

  public toggleChangeStatusShowOnlyErrors():void {
    if (this.eventSearchForm.get('showOnlyErrors')) {
      this.eventSearchForm.get('showOnlyErrors')?.setValue(!this.eventSearchForm.get('showOnlyErrors')?.value);
    }
  }

  public receiveFromDateTime(event: number):void{
    Number.isNaN(event) ? this.triggerChildFunction() : this.getUNIXFromDateTime = event;
  }

  public receiveToDateTime(event: number):void{
    Number.isNaN(event) ? this.triggerChildFunction() : this.getUNIXToDateTime = event;

  }

  public triggerChildFunction(): void {
    this.childComponent.childFunction();
  }

  public backToInstitutionDetails(){
    this.navigateSvc.navigate([`/institution/${this.instituteId}`]);
  }
}
