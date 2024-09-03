import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder,FormControl,FormGroup, 
  FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionDetails,HighlightSearchTxtPipe, DateUtilsService, ConvertDateAndTimePipe} from '@amsconnect/shared';
import { Subject, debounceTime } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'web-messenger-time-select-search',
  templateUrl: './time-select-search.component.html',
  standalone: true,
  imports:[CommonModule, TranslateModule, HighlightSearchTxtPipe, FormsModule, ReactiveFormsModule, ConvertDateAndTimePipe]
})
export class TimeSelectSearchComponent implements OnInit {
  @Output('searchedInstituteData') searchedInstitute = new EventEmitter<string>();
  @Input ({required: false}) isRestCreateAPIUser = false;
  @Output() checkForResetApiUserForm = new EventEmitter<boolean>();
  @Output() checkForendDate = new EventEmitter<boolean>();
  @Input('setFromTime') FromTime !: string;
  @Input('setToTime') ToTime !: string;
  @Output('getFromUTCDateTime') getFromUTC = new EventEmitter<number>();
  @Output('getToUTCDateTime') getToUTC = new EventEmitter<number>();
  public timeDateUTXForm!: FormGroup;
  public isFromDateTimeInputFocused:boolean = false;
  public isToDateTimeInputFocused:boolean = false;
  public showSelectedInstituteDiv = false;
  private instituteSearchTerms = new Subject<string>();
  public currentDate = "";
  public times: string[] = this.generateTimeArray();
  public filteredTimes: string[] = [];
  public selectedFromDateTime!: string;
  public selectedToDateTime!: string;
  public timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])?(\s?[apAP][mM])?$/;
  public submitted: boolean = false;
  public showendDateError = false;

  constructor(
  private fb: FormBuilder,
  private dateUtilSvc: DateUtilsService,
  private convertDateAndTimePipe: ConvertDateAndTimePipe,
  ){
    this.timeDateUTXForm = this.fb.group({
      fromDate: new FormControl('', Validators.required),
      fromTime: new FormControl("",[Validators.required,Validators.pattern(this.timeRegex)]),
      toDate: new FormControl('', Validators.required),
      toTime: new FormControl("",[Validators.required,Validators.pattern(this.timeRegex)]),
    }, { validators: this.dateRangeValidator } as AbstractControlOptions);
    this.setDateTimeDefaultFormValue();    
  }

  public setDateTimeDefaultFormValue():void{
    this.timeDateUTXForm.patchValue({
      fromDate: this.dateUtilSvc.convertDateToISOFormat(this.dateUtilSvc.getDaysAgo(7)),
      fromTime:'12:00:00 am',
      toDate: this.dateUtilSvc.convertDateToISOFormat(new Date()),
      toTime:'11:59:59 pm',
    });
  }

  ngOnInit(): void {
    this.currentDate = this.dateUtilSvc.formatDate(new Date());

    this.instituteSearchTerms.pipe(debounceTime(500)).subscribe(term => {
      this.getInstitutitons(term)
    });
    this.childFunction();
  }

  ngOnChanges(): void {
    if(this.isRestCreateAPIUser ){
      this.timeDateUTXForm.get('inst')?.setValue('');
      this.checkForResetApiUserForm.emit(false);
      }
    }

    //check toDate is not less than fromdate 
  public toDateIsLessFromDate(): void {
    let fromDate= this.timeDateUTXForm.get('fromDate')?.value;
    let toDate= this.timeDateUTXForm.get('toDate')?.value;
    let fromTime =this.timeDateUTXForm.get('fromTime')?.value!==null?  this.convertDateAndTimePipe.convert12HourTo24Hour(this.timeDateUTXForm.get('fromTime')?.value):  null;
    let toTime =this.timeDateUTXForm.get('toTime')?.value!==null? this.convertDateAndTimePipe.convert12HourTo24Hour(this.timeDateUTXForm.get('toTime')?.value): null;
    if(fromDate!==null && fromTime!==null && toDate!==null && toTime!==null) {
      const date1 = new Date(`${fromDate}  ${fromTime}`);
      const date2 = new Date(`${toDate} ${toTime}`);
      const isDate1GreaterThanDate2 = date1 > date2;
      this.checkForendDate.emit(isDate1GreaterThanDate2);
    }  
  }

    public dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
      const from = group.get('fromDate')?.value;
      const to = group.get('toDate')?.value;
      return from && to && from > to ? { 'dateRangeInvalid': true } : null;
    }

  public institutionSearch(term: string): void {
    this.instituteSearchTerms.next(term);
  }

  public getInstitutitons(instituteSearchText?: string): void {
    const searchTxt = instituteSearchText ? instituteSearchText : "";
    this.times.filter(time =>
      time.toLowerCase().includes(searchTxt.toLowerCase())
    );
  }

  public get searchFromDateTimeTerm(): string {
    return this.timeDateUTXForm.get('fromTime')?.value ?? '';
  }

  public get searchToDateTimeTermTerm(): string {
    return this.timeDateUTXForm.get('toTime')?.value ?? '';
  }

  public clearFromInput(comingFromTODateTime:string): void {
    if(comingFromTODateTime === 'fromDateTime'){
      this.timeDateUTXForm.get('fromTime')?.setValue('');
      this.searchedInstitute.emit(undefined);
    }else if(comingFromTODateTime === 'toDateTime'){
      this.timeDateUTXForm.get('toTime')?.setValue('');
      this.searchedInstitute.emit(undefined);
    }
  }

  public clickFromDateTime(event:Event):void{
    event.stopPropagation();
  }

  //  this is for fromDateTime
  public selectFromTime(event: TouchEvent | MouseEvent, fromTime: string): void {
    event.preventDefault();
    if (!fromTime) {
      return;
    }
    this.selectedFromDateTime = fromTime;
    this.timeDateUTXForm.get('fromTime')?.setValue(fromTime);
    const combinedDateTimeString = this.timeDateUTXForm.value.fromDate + " " + fromTime;
    const combinedDateTime = new Date(combinedDateTimeString);
    const unixFromstamp = Math.floor(combinedDateTime.getTime() / 1000);
    this.getFromUTC.emit(unixFromstamp);
    this.isFromDateTimeInputFocused = false;
    this.toDateIsLessFromDate();
  }

  //  this is for toDateTime
  public selectToTime(event: TouchEvent | MouseEvent, toTime: string): void {

    event.preventDefault();
    if (!toTime) {
      return;
    }
    this.selectedToDateTime = toTime; 
    this.timeDateUTXForm.get('toTime')?.setValue(toTime);
    
    const combinedDateTimeString = this.timeDateUTXForm.value.toDate + " " + toTime;
    const combinedDateTime = new Date(combinedDateTimeString);
    const unixToStamp = Math.floor(combinedDateTime.getTime() / 1000);
    this.getToUTC.emit(unixToStamp);
    this.isToDateTimeInputFocused = false;
    this.toDateIsLessFromDate();
  }

  public generateTimeArray(): string[] {
    const times = [];
    for (let h = 1; h <= 12; h++) {
      times.push(`${h}:00:00 am`);
      times.push(`${h}:30:00 am`);
    }

    for (let h = 1; h <= 12; h++) {
      times.push(`${h}:00:00 pm`);
      times.push(`${h}:30:00 pm`);
    }

    return times;
  }

  public childFunction(): void {
    let currentFromDateTime = this.returnUNIXTime(this.timeDateUTXForm.value.fromDate + " " + this.timeDateUTXForm.value.fromTime);
    let currentToDateTime = this.returnUNIXTime(this.timeDateUTXForm.value.toDate + " " + this.timeDateUTXForm.value.toTime);
    this.emitDataToParent(currentFromDateTime,currentToDateTime);
  }

  public emitDataToParent(fromDateData:number,toDateData:number):void{
    this.getFromUTC.emit(fromDateData);
    this.getToUTC.emit(toDateData);
  }

  public returnUNIXTime(data:string): number{
    const combinedDateTime = new Date(data);
    return Math.floor(combinedDateTime.getTime() / 1000);
  }

  public get f():{[key:string]:AbstractControl} { return this.timeDateUTXForm.controls; }

}