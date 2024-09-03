import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionHelperService } from '../../../services//institution-helper.service';
import { UsersService } from '../../../services/users.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CookieService, ErrorHandlingService, InstitutionDetails, InstitutionSearchResponse, SelectedServiceTeam, ShowCurrentServiceTeam, Users, settingsArrayStates, } from "@amsconnect/shared";
import { InstitueReportsRequest, InstitueReportsResponse, InstitueRolesData, Report, ReportsResponse } from 'apps/admin/src/modals/institutions.model';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { threadtypes, messageType, IntituteReport } from './institution-reporting'
import { environment } from 'libs/shared/src/lib/config/environment';
import { DateUtilsService } from '@amsconnect/shared';
import { InstituteRportingBaseComponent } from './institution-reporting.class';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'web-messenger-institution-reporting',
  templateUrl: './institution-reporting.component.html',
  styleUrls: ['./institution-reporting.component.scss']
})
export class InstitutionReportingComponent extends InstituteRportingBaseComponent  implements OnInit, OnDestroy {
  public messageType = messageType;
  public instituteDetails: Report[] = [];
  public threadtype = threadtypes;
  public instituteNameQueryParams = "";
  public showMessage = false;
  public showPHISuccessPopup:boolean = false;
  public modalPHITitleMessage:string = "";
  public modalPHIShowMessage:string = "";
  public showNOPHIOK:boolean = false;
  constructor(
    private institutionService: InstitutionsService,InstitutionHelperService: InstitutionHelperService,
    cookieService: CookieService,institutionSvc: InstitutionsService,
    fb: FormBuilder,private UserServices: UsersService,
    userSvc: UsersService,errorHandlingService: ErrorHandlingService,
    private dateUtilSvc: DateUtilsService,public router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
  ) {
    super(fb, errorHandlingService, userSvc, institutionSvc,cookieService,InstitutionHelperService);
    this.domainKey = environment.domain_key;
    this.currentURL = this.router.url;
    this.getInstituteSearchForm();
  }

  ngOnInit(): void {
    this.currentDate = this.dateUtilSvc.formatDate(new Date());
    this.createInstituteReportForm = this.fb.group({
      reports: ["", Validators.required],
      searchQuery: [""],
      IIDs: this.fb.array([]),
      instituteTags: [[]],
      dateTo: ["", Validators.required],
      dateFrom: ["", Validators.required],
      threadType: [""],
      message_id: [""],
      instituteReport: [""],
      reportfrequency: [""],
      childOU: new FormControl(false),
      PHIHidden: new FormControl(false),
      ServiceTeam: [[]],
      showCurrentServiceTeam: [[false]],
      excludeLockedUsers: new FormControl(false)
    }, {
      validator: this.dateValidator
    });
    this.listofInstituteReportsAPITrigger();
    this.instituteNameQueryParams = this.activatedRoute.snapshot.queryParams['institutionName'];
    this.checkDateValidity();
  }

  public listofInstituteReportsAPITrigger(): void {
    this.subscription.add(this.InstitutionHelperService.instituteReport().subscribe((data: ReportsResponse) => {
      if (data.status == "ok") { this.instituteDetails = data.reports; }
    }))
    this.searchInstitutions();
  }

  public searchInstitutions(): void {
    let institutionSearchValue = this.createInstituteReportForm.get("searchQuery")?.value;
    const showLockedInstitutionsValue = this.createInstituteReportForm.get("showLockedInstitutions")?.value;
    institutionSearchValue = institutionSearchValue && institutionSearchValue.trim() !== "" ? institutionSearchValue : "*";
    this.subscription.add(this.institutionService.searchInstitutitons(institutionSearchValue, showLockedInstitutionsValue)
      .subscribe((responseData: InstitutionSearchResponse) => {
        this.allInstitutionsData = responseData.institutions;
        this.setInstituteNameinInstitutionsField();
      })
    );
  }

  public selectInstitution(name: InstitutionDetails): void {
    this.isInstituteInputFocused = false;
    if (!this.selectedInstitute.some(institution => institution.id == name.id)) {
      this.selectedInstitute.push(name);
      if (this.selectedInstitute.length) {
        this.isSelectedInstitute = true;
        const iidsControl = this.createInstituteReportForm.get('IIDs') as FormArray;
        iidsControl.push(this.fb.control(name.id));
        this.hidePreviewUser = true;
        this.getServices(this.selectedInstitute);
      } else { this.isSelectedInstitute = false }
    }
    this.instituteSearchForm.get('institution')?.setValue("");
  }

  public unselectInstitution(name: string,event:Event): void {
    event?.stopPropagation();
    this.showCurrentServiceTeam = this.showCurrentServiceTeam.filter(item => item.name !== name);
    const iidsControl = this.createInstituteReportForm.get('IIDs') as FormArray;
    const iidsDetails = this.selectedInstitute.filter(institute => institute.name == name)
    const controlIndex = iidsControl.controls.findIndex(control => control.value === iidsDetails[0].id);
    if (controlIndex !== -1) {
      iidsControl.removeAt(controlIndex);
      this.selectedInstitute = this.selectedInstitute.filter(institute => institute.name !== name);
    }
    if(this.selectedInstitute.length === 0) this.isSelectedInstitute = false; 
  }
  public getServices(selectedInstitute: InstitutionDetails[]): void {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const selectedInstituteID = this.selectedInstitute[selectedInstitute.length - 1]?.id;
    const selectedInstituteName = this.selectedInstitute[selectedInstitute.length - 1]?.name;
    this.InstitutionHelperService.institueRoleGet(selectedInstituteID).subscribe((data: InstitueRolesData) => {
      if (data.status === "ok") {
        const teams = data.roles.map(team => team);
        this.showCurrentServiceTeam = [...this.showCurrentServiceTeam, {
          name: selectedInstituteName,
          iid: selectedInstituteID,
          teams: teams,
        }];
      }
    });
  }

  public isServiceOrMappedServiceReport(): boolean {
    const reportTypeValue = this.createInstituteReportForm.get('reports')?.value;
    return (reportTypeValue === IntituteReport.service || reportTypeValue === IntituteReport.mapped_service || reportTypeValue === IntituteReport.institution_services_report );
  }

  public isPeerToPeer(): boolean {
    const reportTypeValue = this.createInstituteReportForm.get('threadType')?.value;
    return reportTypeValue === IntituteReport.peer_to_peer;
  }

  public isMsg_content(): boolean {
    const reportTypeValue = this.createInstituteReportForm.get('reports')?.value;
    return reportTypeValue === IntituteReport.msg_content;
  }

  public checkAllServiceTeam(index: number): void {
    if (this.showCurrentServiceTeam) {
      const allSelctedTeam = this.showCurrentServiceTeam[index].teams.reduce((result: { [x: string]: boolean; }, item: { _id: string }) => {
        result[item._id] = this.allSpecialTeamChecked[index];
        return result;
      }, {});
      const addPreviousAndSelectedTeam = { ...this.allUserCheckboxStates, ...allSelctedTeam };
      this.allUserCheckboxStates = addPreviousAndSelectedTeam;
      if (this.allSpecialTeamChecked[index]) {
        const serviceTeamIds = this.serviceTeam.map(team => team._id) //is user first select teams of the same institute and then select all service team
        const allSelectedTeam = this.showCurrentServiceTeam[index].teams.filter((team: SelectedServiceTeam) => !serviceTeamIds.includes(team._id));
        this.serviceTeam = [...this.serviceTeam, ...allSelectedTeam];
      } else {
        const unTickAllSelectedTeam = this.showCurrentServiceTeam[index].teams.map((team: SelectedServiceTeam) => team)
        this.serviceTeam = this.serviceTeam.filter(team => !unTickAllSelectedTeam.includes(team));
      }
    } else {
      console.error('showCurrentServiceTeam is undefined.');
    }
  }

  public onCheckboxChangeService(index: number, id: string, service: SelectedServiceTeam): void {
    const checked = this.allUserCheckboxStates[id];
    if (checked) {
      this.serviceTeam.push(service);
    } else {
      this.serviceTeam = this.serviceTeam.filter(s => s !== service);
    }
    const instituteID = service.iid;
    const serviceTeam = this.serviceTeam.filter((team) => team.iid === instituteID)
    if (serviceTeam.length == this.showCurrentServiceTeam[index].teams.length) {
      this.allSpecialTeamChecked[index] = true;
    } else {
      this.allSpecialTeamChecked[index] = false;
    }
  }

  public updatePHIHidden(event: Event): void {
    const checkboxEvent = (event.target as HTMLInputElement).checked;
    this.createInstituteReportForm.controls['PHIHidden'].setValue(checkboxEvent);
  }

  public updateChildUI(event: Event): void {
    const checkboxEvent = (event.target as HTMLInputElement).checked;
    this.createInstituteReportForm.controls['childOU'].setValue(checkboxEvent);
  }

  public onListItemChange(): void {
    const searchTerm = this.createInstituteReportForm.get('searchQuery')?.value?.toLowerCase();
    this.allInstitutionsData = this.allInstitutionsData.filter(
      (institution) => institution.name.toLowerCase().includes(searchTerm)
    );
  }

  public dateValidator(group: FormGroup): { [s: string]: boolean } | null {
    const fromDate = group.controls['dateFrom'].value;
    const toDate = group.controls['dateTo'].value;
    if (fromDate && toDate && fromDate > toDate) { return { 'invalidRange': true }; }
    const today = new Date();
    if (fromDate && fromDate > today) { return { 'fromDateInFuture': true }; }
    if (toDate && toDate > today) { return { 'toDateInFuture': true }; }
    return null;
  }

  public checkDateValidity():void {
    this.createInstituteReportForm.valueChanges.subscribe(() => {
      if (new Date(this.createInstituteReportForm.get('dateTo')?.value) < new Date(this.createInstituteReportForm.get('dateFrom')?.value)) {
        this.showMessage = true;
      } else {
        this.showMessage = false;
      }
    })
  }

  public createInstituteReport(): void {
      if (this.createInstituteReportForm.valid) {
      let filteredIidsArray;
      const dateToConvert = new Date(this.createInstituteReportForm.get('dateTo')?.value);
      const formattedDate = this.dateUtilSvc.convertReportingFromDates(this.createInstituteReportForm.get('dateTo')?.value);
      const dateFromConvert = new Date(this.createInstituteReportForm.get('dateFrom')?.value);
      const formattedFromDate = this.dateUtilSvc.convertReportingFromDates(this.createInstituteReportForm.get('dateFrom')?.value);
      const iidsArray: string[] = this.createInstituteReportForm.get('IIDs')?.value || [];
      filteredIidsArray = iidsArray.filter(iid => iid !== null);
      //set serviceTeam values in services
      let selectedInstituteArray = this.selectedInstitute.map((inst) => inst.id);
      let setInstituteServiceTeam: { [key: string]: string[] } = {};
      for (let institute of selectedInstituteArray) {
        let resultArray = [];
        for (let selectedTeam of this.serviceTeam) {
          if (institute === selectedTeam.iid) {
            resultArray.push(selectedTeam.description);
          }
        }
        if (resultArray.length) {
          setInstituteServiceTeam[institute] = resultArray;
        }
      }
      this.createInstituteReportForm.get('ServiceTeam')?.setValue(setInstituteServiceTeam);
      let obj: InstitueReportsRequest = {
        date_to: formattedDate,
        date_from: formattedFromDate,
        report_id: this.createInstituteReportForm.get('reports')?.value,
        iids: filteredIidsArray,
      }
      if (this.createInstituteReportForm.get('excludeLockedUsers')?.value) {
        obj.exclude_locked_user = 'on';
      }
      if (this.createInstituteReportForm.get('childOU')?.value) {
        obj.show_results_by_child_ou = 'on';
      }
      if (this.createInstituteReportForm.get('PHIHidden')?.value && obj.report_id == "patients") {
        obj.obscure_phi = 'on';
      }

      const reportFrequencyValue = this.createInstituteReportForm.get('reportfrequency')?.value;
      if (reportFrequencyValue) {
        switch (reportFrequencyValue) {
          case "days":
            obj.results_daily = 'on';
            break;
          case "week":
            obj.results_weekly = 'on';
            break;
          case "month":
            obj.results_monthly = 'on';
            break;
          default:
            break;
        }
      }
      const threadTypeControlValue = this.createInstituteReportForm.get('threadType')?.value;
      const message_idControlValue = this.createInstituteReportForm.get('message_id')?.value;
      const serviceTeamControlValue = this.createInstituteReportForm.get('ServiceTeam')?.value;
      const instituteTagsControlValue = this.createInstituteReportForm.get('instituteTags')?.value;
      if (threadTypeControlValue !== null) {
          obj.thread_id = threadTypeControlValue;
          if (message_idControlValue !== null) {
              obj.message_id = message_idControlValue;
          }
      } 
      if (serviceTeamControlValue !== null) {
          obj.services = serviceTeamControlValue;
      } 
      if (instituteTagsControlValue.length > 0) {
          obj.tags = instituteTagsControlValue.split(',').map((tag: string) => tag.trim());;
      }
      if(this.showNOPHIOK){
        obj.no_phi_ok = true;
      }
      let institutionsListSelected= filteredIidsArray.join(",")

      this.InstitutionHelperService.submitInstituteReport(obj).subscribe((data: InstitueReportsResponse) => {
        if (data.status === "ok") {
          if(data.missing_phi && data.missing_phi.length){
              this.showPHIMessageModal(`${this.translate.instant('missing_Phi')} ${institutionsListSelected} ${this.translate.instant('execute_Report')}`);
          }else{
            this.jobId = data.job.id
            this.showSuccessPopup = true;
            this.showNOPHIOK = false;
            this.resetValuesAfterReport();
          } 
        }
      })      
    }
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }
  public resetValuesAfterReport(){
    this.serviceTeam = [];
    this.allUserCheckboxStates = {};
    this.createInstituteReportForm.get('ServiceTeam')?.reset(); 
    this.showCurrentServiceTeam=[]
    this.createInstituteReportForm.patchValue({reports:"",
        searchQuery: "",instituteTags: [],threadType: "",message_id: "",instituteReport: "",reportfrequency: "",
        childOU: false,PHIHidden: false,showCurrentServiceTeam: [false],
    });
    if(this.instituteNameQueryParams === undefined ||  this.instituteNameQueryParams == ""){
      const arrayControl = this.createInstituteReportForm.get('IIDs') as FormArray;
      arrayControl.clear(); 
      this.selectedInstitute.length=0;
      this.showDropdown = false;
    }
    this.setDate();
  }

  public executeReport():void{
    this.showNOPHIOK = true;
    this.showPHISuccessPopup= false;
    this.createInstituteReport();
  }

  public cancelPHIpopup():void{
    this.showPHISuccessPopup = false;
  }

  public showPHIMessageModal(message:string):void{
    this.modalPHITitleMessage=this.translate.instant('pHIpermissionsmissing');
    this.modalPHIShowMessage= message;
    this.showPHISuccessPopup= true;
  }
}