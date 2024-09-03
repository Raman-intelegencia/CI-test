import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { Actor, EventDetails, EventObject, ProcessedUserEventData, UserEventData, UserEventLogResponse } from '../../../modals/users.model';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateUtilsService } from '@amsconnect/shared';
import { InstitutionsEventsLogsService } from 'apps/admin/src/services/institutionsEventLog.service';
import { UserInfoService } from 'apps/admin/src/services/user-info.service';

@Component({
  selector: 'web-messenger-event-logs',
  templateUrl: './event-logs.component.html',
  styleUrls: ['./event-logs.component.scss']
})
export class EventLogsComponent implements OnChanges, OnInit {
  @Input() userId = "";
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

  constructor(
    private userSvc: UsersService,
    private fb: FormBuilder,
    public dateUtilSvc: DateUtilsService,
    private institutionsEventsLogsService: InstitutionsEventsLogsService,
    public userInfoSvc: UserInfoService
    ){}

  ngOnChanges(changes: SimpleChanges): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
      if(changes['userId'].currentValue){
        this.initializeData();
        this.getUserEventLogs(this.userId);
        this.userInfoSvc.setUserInfoPageRedirection(true);
      }
  }

  ngOnInit(): void {
    this.userInfoSvc.setUserInfoPageRedirection(true);
    this.currentDate = this.dateUtilSvc.formatDate(new Date());
    this.eventSearchForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      eventName: ['']
    }, { validators: this.dateRangeValidator } as AbstractControlOptions);


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
    // Initialize or reset data arrays
    this.eventLogsData = [];
    this.eventNamesData = {};
    this.actorsData = [];
    this.eventObjectsData = [];
  }

  public getUserEventLogs(userId: string): void {
    this.userSvc.getUserEvents(userId, 100).subscribe((data: UserEventLogResponse) => {
      this.eventNamesData = data.event_names;
      this.sortedEventNamesData = this.institutionsEventsLogsService.sortEventNames(this.eventNamesData);
      this.filteredEventNamesData = [...this.sortedEventNamesData];
      this.actorsData = data.actors;
      this.eventObjectsData = data.objects;
      this.constructEventListData(data);
      this.eventLogResultsLimited = data.results_limited;
    })
  }

  public searchUserEvents(isLoadMore: boolean): void {
    let lastEventId = '';
    if (this.eventLogsData.length) {
      lastEventId = this.eventLogsData[this.eventLogsData.length - 1]._id;

    }
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let eventFromDate = `${this.f['fromDate'].value}T00:00:00`;
    let eventToDate =  `${this.f['toDate'].value}T00:00:00`;
    const fromDate =this.dateUtilSvc.auditUserConvertFromDateUnix(eventFromDate, timezone);
    const toDate =this.dateUtilSvc.auditUserConvertToDateUnix(eventToDate, timezone);
    let apiCall;
    if (!isLoadMore) {
      if (this.eventSearchForm.invalid || this.eventSearchForm.errors?.['dateRangeInvalid']) {
        // If the date range is invalid, clear the 'To' date field
        if (this.eventSearchForm.errors?.['dateRangeInvalid']) {
          this.updateDateRange(this.dateUtilSvc.getDaysAgo(7), new Date());
        }
        return;
      }
      apiCall = this.userSvc.searchUserEvents(this.userId, fromDate, toDate, 100, this.selectedEventNameValue)  
    } else {
      apiCall = this.userSvc.searchUserEvents(this.userId, fromDate, toDate, 100, this.selectedEventNameValue, lastEventId);
    }

    apiCall.subscribe(data => {
      this.eventLogResultsLimited = data.results_limited;
      if (isLoadMore) {
        this.mergeEventNamesData(data.event_names);
        this.mergeActorsData(data.actors);
        this.mergeEventObjectsData(data.objects);
        this.constructEventListData(data, true);
      } else {
        this.eventNamesData = data.event_names;
        this.sortedEventNamesData = this.institutionsEventsLogsService.sortEventNames(this.eventNamesData);
        this.filteredEventNamesData = [...this.sortedEventNamesData];
        this.actorsData = data.actors;
        this.eventObjectsData = data.objects;
        this.constructEventListData(data);
      }
    })
  }

  private mergeEventNamesData(newData: { [key: string]: string }) {
    // Merge event names data
    this.eventNamesData = { ...this.eventNamesData, ...newData };
    this.sortedEventNamesData = this.institutionsEventsLogsService.sortEventNames(this.eventNamesData);
    this.filteredEventNamesData = [...this.sortedEventNamesData];
  }

  private mergeActorsData(newActors: Actor[]) {
    // Merge actors data
    this.actorsData = [...this.actorsData, ...newActors];
  }

  private mergeEventObjectsData(newEventObjects: EventObject[]) {
    // Merge event objects data
    this.eventObjectsData = [...this.eventObjectsData, ...newEventObjects];
  }


  private constructEventListData(data: UserEventLogResponse, append = false) {
    const newEvents = data.events.map(event => {
      const eventData = this.checkIftheEventDataWasByUser(event, event.aid, event.oid);
      return {
        ...event,
        eventDataDisplay: eventData.eventData?.substring(0, 25),
        isLongEventData: eventData.eventData?.length > 25,
        fullEventData: eventData.eventData, // To store the complete event data
        target: eventData.target
      };
    });

    // Append new events to existing data if append is true, else replace
    this.eventLogsData = append ? [...this.eventLogsData, ...newEvents] : newEvents;
  }

  public getNameById(id: string): string {
    const actor = this.actorsData.find(actor => actor.id === id);
    return actor ? actor.name : "";
  }

  public checkIftheEventDataWasByUser(event: UserEventData, aid: string, oid: string): { target?: string, eventData: string } {
    if (aid === oid) {
      return { eventData: JSON.stringify(event.ed) };
    } else if (aid !== oid) {
      let eventData: any;
      const userName = this.eventObjectsData.find(user => user.id === event.oid)
      const target = userName ? userName.name : "";
      if (!event.ed?.g) {
        eventData = JSON.stringify(event.ed)
      } else if (event.ed?.g) {
        eventData = this.convertToFormattedGrant(event.ed)
      }
      return { target, eventData };
    }
    return { eventData: '' }; // Fallback if conditions don't match
  }

  public convertToFormattedGrant(data: EventDetails): string {
    if (data.g != undefined && data.g.length > 0) {
      const actions = data.g[0].a.join(', ');
      const institution = data.g[0].r[0]?.e?.e;
      return `Grant 0: Actions: ${actions}; Institution: ${institution}`;
    } else {
      return "";
    }
  }

  public openEventDataModal(eventData: string): void {
    this.fullEventData = eventData;
    this.showFullEventData = true;
  }

  public closeFullEventDataModal(): void {
    this.showFullEventData = false;
    this.fullEventData = '';
  }

  public selectedEventName(event: TouchEvent | MouseEvent, eventName: { [key: string]: string }): void {
    event.preventDefault();
    this.selectedEventNameValue = eventName['key']
    this.eventSearchForm.patchValue({
      eventName: eventName['value']
    })
    this.isEventNameInputFocused = false;

  }

  public eventNameSearch(eventName: string): void {
    if (eventName) {
      this.filteredEventNamesData = this.sortedEventNamesData.filter(item =>
        item['value'].toLowerCase().includes(eventName.toLowerCase())
      );
    } else {
      // If the search term is empty, reset to the full list
      this.filteredEventNamesData = [...this.sortedEventNamesData];
      this.selectedEventNameValue = "";
    }
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

  public clearSelection(): void { 
    this.selectedEventNameValue = "";
    this.eventSearchForm.get('eventName')?.setValue('');
  }
}