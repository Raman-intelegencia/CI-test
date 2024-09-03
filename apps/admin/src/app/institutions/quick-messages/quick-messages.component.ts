import { Component, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionHelperService } from '../../../services/institution-helper.service';
import { UsersService } from '../../../services/users.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService, ErrorHandlingService, InstitutionDetails, InstitutionSearchResponse, Users, settingsArrayStates, } from "@amsconnect/shared";
import { UsersResponse } from '../../../modals/users.model';
import { QuickMessageApiResponse, BroadcastMessagingValues, InstitueRolesData, PreviwUserRequestData, Processor, QuickMessageData, RootObject, RootObjectInstitutions, CreateInstitutionResponse } from '../../../modals/institutions.model';
import { Subscription, debounceTime } from 'rxjs';
import { environment } from '@amsconnect/shared';
import { TranslateService } from '@ngx-translate/core';
import { QuickMessagesBaseComponent } from './quick-message.class';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'web-messenger-quick-messages',
  templateUrl: './quick-messages.component.html',
  styleUrls: ['./quick-messages.component.scss']
})
export class QuickMessagesComponent extends QuickMessagesBaseComponent implements OnInit, OnDestroy {
  public createQuickMeesageForm!: FormGroup;
  public domainKey = '';
  public quick_active_status = 'list-view';
  public allSpecialTeamChecked = false;
  public settingsArrayStates: settingsArrayStates = { filteredSpecialties: [], filteredTitles: [], showCurrentServiceTeam: [] };
  public allUserCheckboxStates: boolean[] = [];
  public serviceTeam: string[] = [];
  public selectedSpecialties: string[] = [];
  public selectedTitle: string[] = [];
  public listPreviewUser: Users[] = [];
  public specialtiesCheckboxStates: boolean[] = [];
  public subscription: Subscription = new Subscription;
  public quickResponseData: BroadcastMessagingValues | null = null;
  public allInstitutionsData: InstitutionDetails[] = [];
  public disableService = true;
  public selectedInstitution = "";
  @ViewChild('chooseUsers') chooseUsers!: ElementRef;
  @ViewChild('adEditTags') adEditTags!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  constructor(
    private institutionService: InstitutionsService, private InstitutionHelperService: InstitutionHelperService,
    private cookieService: CookieService, institutionSvc: InstitutionsService,fb: FormBuilder, userSvc: UsersService, errorHandlingService: ErrorHandlingService,
    private UserServices: UsersService, private translateSvc: TranslateService,cd: ChangeDetectorRef,public route: ActivatedRoute) {
    super(fb, errorHandlingService, userSvc, institutionSvc,cd);
    this.domainKey = environment.domain_key;
    this.getInstituteSearchForm();
  }
  ngOnInit(): void {
    this.createQuickMeesageForm = this.fb.group({
      message: [[]],rename: [[]],Position: ["false", Validators.required],searchQuery: [""],
      IIDs: this.fb.array([]),ServiceTeam: [[]],Specialty: [[]],Title: [[]],File: [""],
      showLockedInstitutions: [false],
    });
    this.apiTrigger();
    this.instituteSearchTerms.pipe(debounceTime(500)).subscribe(term => { this.getInstitutitons(term) });
    this.onValueChange();
  }
  public apiTrigger(): void {
    this.subscription.add(this.InstitutionHelperService.adminBatch().subscribe((data: RootObject) => {
      let broadcast = data.processors;
      let broadcast_details = broadcast.map((processor: Processor) => processor.metadata);
      this.quickResponseData = broadcast_details[0].values;
    }));
    this.subscription.add( this.InstitutionHelperService.getInstitutions().subscribe() );
    this.searchInstitutions()
  }

  public selectInstitution(name: InstitutionDetails): void {
    this.isInstituteInputFocused = false;
    if (!this.selectedInstitute.some(institution => institution.id === name.id)) {
      this.selectedInstitute.push(name);
      if (this.selectedInstitute.length) {
        if (this.selectedInstitute.length > 1) this.disableService = false;
        this.isSelectedInstitute = true;
        const IIDsControl = this.createQuickMeesageForm.get('IIDs') as FormArray;
        IIDsControl.push(this.fb.control(name.id));
        this.selectedInstituteId = IIDsControl.value as string[]
        this.hidePreviewUser = true;
        this.getServices(name.id);
      }
      else { this.isSelectedInstitute = false; }
    }
    this.instituteSearchForm.get('institution')?.setValue("");
  }
  public getServices(selectedInstitute: string): void {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    this.selectedInstitution = selectedInstitute;
    this.InstitutionHelperService.institueRoleGet(this.selectedInstitution).subscribe((data: InstitueRolesData) => {
      if (data.status == "ok") {
        let a = data.roles;
        this.settingsArrayStates.showCurrentServiceTeam = a.map((role: { description: string; }) => role.description);
      }
      else if (data.status == "error") {
        let messager: string | undefined = data?.message;
        this.showErrorMsg(data);
      }});
    this.getRoles(this.selectedInstitution);
  }

  public getRoles(First: string, removedInstitute?: string): void {
    if (removedInstitute) {
      this.InstitutionHelperService.institueGet(removedInstitute).subscribe((data: CreateInstitutionResponse) => {
        if (!data.institution.specialties.length) {
          this.subscription.add(
            this.InstitutionHelperService.getInstitutions().subscribe((data: RootObjectInstitutions) => {
              this.settingsArrayStates.filteredSpecialties = this.settingsArrayStates.filteredSpecialties.filter(item => !data.specialties.includes(item));
            })
        )}
        if (!data.institution.titles.length) {
          this.subscription.add(
            this.InstitutionHelperService.getInstitutions().subscribe((data: RootObjectInstitutions) => {
              this.settingsArrayStates.filteredTitles = this.settingsArrayStates.filteredTitles.filter(item => !data.titles.includes(item));
            })
        )}
        this.settingsArrayStates.filteredSpecialties = this.settingsArrayStates.filteredSpecialties.filter(item => !data.institution.specialties.includes(item));
        this.settingsArrayStates.filteredTitles = this.settingsArrayStates.filteredTitles.filter(item => !data.institution.titles.includes(item));
      });
    }
    else {
      this.InstitutionHelperService.institueGet(First).subscribe((data: CreateInstitutionResponse) => {
        if (data.status === "ok") {
          this.settingsArrayStates.filteredSpecialties.push(...new Set(data?.institution.specialties.sort()));
          this.settingsArrayStates.filteredTitles.push(...new Set(data?.institution.titles.sort()));
          if (!this.settingsArrayStates.filteredSpecialties.length || !this.settingsArrayStates.filteredTitles.length) {
            this.subscription.add(
              this.InstitutionHelperService.getInstitutions().subscribe((data: RootObjectInstitutions) => {
                this.settingsArrayStates.filteredSpecialties = this.settingsArrayStates.filteredSpecialties.length ? this.settingsArrayStates.filteredSpecialties : data?.specialties.sort();
                this.settingsArrayStates.filteredTitles = this.settingsArrayStates.filteredTitles.length ? this.settingsArrayStates.filteredTitles : data?.titles.sort();
              })
            );
          }
          if (!data?.institution.specialties.length) {
            this.subscription.add(this.InstitutionHelperService.getInstitutions().subscribe((data: RootObjectInstitutions) => {
              this.settingsArrayStates.filteredSpecialties.push(...new Set(data?.specialties.sort()))
            }));
          }
          if (!data?.institution.titles.length) {
            this.subscription.add(this.InstitutionHelperService.getInstitutions().subscribe((data: RootObjectInstitutions) => {
              this.settingsArrayStates.filteredTitles.push(...new Set(data?.titles.sort()))
            }));
          }
        }
      });
    }
  }

  public unselectInstitution(name: string, id: string,event:Event): void {
    event.stopPropagation();
    this.getRoles(this.selectedInstitution, id)
    if (this.selectedInstitute.length === 1) this.hidePreviewUser = false
    if (this.selectedInstitute.length <= 2) this.disableService = true;
    const iidsControl = this.createQuickMeesageForm.get('IIDs') as FormArray;
    const iidsDetails = this.selectedInstitute.filter(institute => institute.name == name)
    const controlIndex = iidsControl.controls.findIndex(control => control.value === iidsDetails[0].id);
    if (controlIndex !== -1) {
      iidsControl.removeAt(controlIndex);
      this.selectedInstituteId = iidsControl.value;
      this.selectedInstitute = this.selectedInstitute.filter(institute => institute.name !== name);
    }
    if(this.selectedInstitute.length === 0) this.isSelectedInstitute = false; 
  }
  public searchInstitutions(): void {
    let institutionSearchValue = this.createQuickMeesageForm.get("searchQuery")?.value;
    let showLockedInstitutionsValue = this.createQuickMeesageForm.get("showLockedInstitutions")?.value;
    institutionSearchValue = institutionSearchValue && institutionSearchValue.trim() !== "" ? institutionSearchValue : "*";
    this.subscription.add(this.institutionService.searchInstitutitons(institutionSearchValue, showLockedInstitutionsValue).subscribe((responseData: InstitutionSearchResponse) => {
      this.allInstitutionsData = responseData.institutions;
    }));
  }
  public reportingTags(tabname: string): void {
    this.quick_active_status = tabname;
  }
  public checkAllServiceTeam(): void {
    if (this.settingsArrayStates?.showCurrentServiceTeam) {
      this.allUserCheckboxStates = Array(this.settingsArrayStates.showCurrentServiceTeam.length).fill(this.allSpecialTeamChecked);
      if (this.allSpecialTeamChecked) this.serviceTeam = this.settingsArrayStates.showCurrentServiceTeam;
      else this.serviceTeam = [];
    }
  }
  public onCheckboxChangeService(index: number, service: string): void {
    if (this.allUserCheckboxStates[index]) this.serviceTeam.push(service);
    else this.serviceTeam = this.serviceTeam.filter(s => s !== service);
  }
  public serviceOpenModal(): void { this.chooseUsers.nativeElement.style.display = 'block';}

  public serviceCloseModal(): void { this.chooseUsers.nativeElement.style.display = 'none'; }

  public handleSpecialtiesChanged(): void {
    this.isChildVisibleSpecialties = false;
    this.selectedSpecialties = this.createQuickMeesageForm?.get("Specialty")?.value;
  }
  public handleTitleChanged(): void {
    this.isChildVisibleTitle = false;
    this.selectedTitle = this.createQuickMeesageForm?.get("Title")?.value;
  }
  public reportingTagsValue(data: string[]): void {
    this.tags = data;
    this.createQuickMeesageForm?.get("message")?.setValue([...this.tags]);
  }
  public RemoveMessageValue(data: string[]): void {
    this.removeQuickMessage = data;
    this.createQuickMeesageForm?.get("rename")?.setValue([...this.removeQuickMessage]);
  }
  public isreportingTags(data: boolean): void { this.isReportingTag = data;}

  public isRemoveMessages(data: boolean): void { this.isRemoveMessage = data; }

  public openRemoveMessages(): void { this.isRemoveMessage = true;}

  public openReportingTags(): void { this.isReportingTag = true; }

  public submitService(): void {
    this.createQuickMeesageForm?.get("ServiceTeam")?.setValue([...this.serviceTeam]);
    this.serviceCloseModal();
    this.isChildVisibleServiceTeam = false;
  }
  public previouUser(): void {
    if (this.createQuickMeesageForm?.get('IIDs')?.value.length != 0) {
      const iCookieValue = this.cookieService.getCookie(`s${environment.domain_key ? `-${environment.domain_key}` : ""}`);
      if (iCookieValue) {
        const jsonObject: { i: string; e: string; s: boolean } = JSON.parse(iCookieValue);
        if (jsonObject) {
          let previouUser: PreviwUserRequestData = { processor: "macros_modify", users: { ou: this.selectedInstituteId, specialty: this.selectedSpecialties, title: this.selectedTitle, service: this.serviceTeam } }
          this.InstitutionHelperService.getPreviewUser(previouUser).subscribe((data: UsersResponse) => {
            if (data.status == "ok") {
              this.listPreviewUser = data.users as unknown as Users[];
            }
          })
        }
      }
    }
  }
  public createBroadcastMessage(): void {
    if (this.createQuickMeesageForm.valid) {
      const iCookieValue = this.cookieService?.getCookie(`s${environment.domain_key ? `-${environment.domain_key}` : ""}`);
      if (iCookieValue) {
        const jsonObject: { i: string; e: string; s: boolean } = JSON.parse(iCookieValue);
        const iidsArray: string[] = this.createQuickMeesageForm.get('IIDs')?.value || [];
        let quickCastMessageValues: QuickMessageData = {
          processor: "macros_modify",
          users: { "ou": iidsArray.filter((item)=>item!=null), 
          "specialty": this.selectedSpecialties.filter((item:any)=>item!=null), 
          "title": this.selectedTitle.filter((item:any)=>item!=null), 
          "service": this.createQuickMeesageForm?.get("ServiceTeam")?.value ?? [] },
          values: {
            add: { messages: this.createQuickMeesageForm?.get("message")?.value, "prepend": this.createQuickMeesageForm?.get("Position")?.value }, remove: {
              messages: this.createQuickMeesageForm?.get("rename")?.value,
              prepend: false
            }
          },
          commit: true,
        }

        const formData: FormData = this.constructFormData(quickCastMessageValues);
        this.submitFormData(formData);
        this.isSelectedInstitute = false;
      }
    }
  }
  public reset(): void {
    this.createQuickMeesageForm.reset();
    this.selectedSpecialties = [];
    this.allUserCheckboxStates = [];
    this.specialtiesCheckboxStates = [];
    this.serviceTeam = [];
    this.selectedSpecialties = [];
    this.selectedTitle = [];
    this.selectedInstitute = []
    this.tags = [];
    this.removeQuickMessage = [];
    this.resetTags = true;
    this.isSelectedInstitute = false;
    this.enableOrDisableStartProcess = true;
  }

  public resetValuesAfterReport(): void {
    this.serviceTeam = [];
    this.createQuickMeesageForm.get('ServiceTeam')?.reset();
    const arrayControl = this.createQuickMeesageForm.get('IIDs') as FormArray;
    arrayControl.clear();
    this.selectedInstitute.length = 0;
    this.showDropdown = false;
  }

  public resetAfterSuccessSendMessage(): void {
    this.createQuickMeesageForm.reset();
    this.selectedSpecialties = [];
    this.allUserCheckboxStates = [];
    this.specialtiesCheckboxStates = [];
    this.serviceTeam = [];
    this.selectedSpecialties = [];
    this.selectedTitle = [];
    this.selectedInstitute = [];
    this.tags = [];
    this.removeQuickMessage = [];
    this.selectedFileName = "";
    this.resetTags = true;
    this.createQuickMeesageForm.patchValue({Position: "true"});
    this.removeFile();
    this.enableOrDisableStartProcess = true;
    this.hidePreviewUser = false;
    this.isCSVUpload=false;  
  }
  public closePopUp(value: boolean): void { this.isSpecialty = value }

  public closeTitlesPopUp(value: boolean): void { this.isTitles = value }

  private addCookieToFormData(formData: FormData,xCureator:boolean): void {
    const aCookieValue = this.cookieService.getCookie("a") || "";
    if (aCookieValue) {
      if(xCureator){
        this.route.queryParams.subscribe(params => {
          if(params['current_user_id']){
            formData.append('X-cureatr-user', params['current_user_id']);
          }else{
            formData.append('X-cureatr-user', aCookieValue.split("|")[1]);
          }        
        });
      }
    }
  }

  private constructFormData(jsonData: QuickMessageData): FormData {
    const formData = new FormData();
    formData.set('json', JSON.stringify(jsonData));
    if(this.isCSVUpload && this.checkFileSystemINCSV){
      formData.append('file_name', this.selectedFileName);
      formData.append('users', this.checkFileSystemINCSV as Blob);
      this.addCookieToFormData(formData,true);
    }else{
      this.addCookieToFormData(formData,false);
    }
    return formData;
  }

  public submitFormData(formData: FormData): void {
    this.InstitutionHelperService.postQuickMessageWithAttachedCSV(formData).subscribe((data: QuickMessageApiResponse) => {
       if (data.status == "ok") {
        this.showSuccessModalPopUP = true;
        this.showSuccessPopup = data.status === "ok" ? "Successfully Submitted job!" : "";
        this.resetAfterSuccessSendMessage();
      }
    })
  }

  public onValueChange():void{
    this.createQuickMeesageForm.get("IIDs")?.valueChanges.subscribe((value) => {
      if(value && value.length >= 1){
        this.enableOrDisableStartProcess = false;
      }else{
        if (this.selectedFileName != "") {
          this.enableOrDisableStartProcess = false;
        } else {
          this.enableOrDisableStartProcess = true;
        }
      }
    });
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }
  
  public removeFile(): void {
    if (this.fileInput) {
      (this.fileInput.nativeElement as any).value = null;
      this.selectedFileName = "";
      this.enableOrDisableStartProcess = true;
      this.isCSVUpload=false;
    } 
    
    if (this.createQuickMeesageForm.get('IIDs')?.value.length > 0) {
      this.enableOrDisableStartProcess = false;
    }
  }

}