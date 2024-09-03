import { Component, SimpleChanges, ElementRef, ViewChild, ChangeDetectorRef,} from '@angular/core';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionHelperService } from '../../../services/institution-helper.service';
import { UsersService } from '../../../services/users.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService, ErrorHandlingService, InstitutionDetails, InstitutionSearchResponse, ServiceTeam, SpecialtiesCheckboxState, Users, environment, settingsArrayStates, } from "@amsconnect/shared"; 
import { User, UserSearchResponse, UsersResponse } from '../../../modals/users.model';
import { QuickMessageApiResponse, BroadcastMessagingValues, InstitueRolesData, PreviwUserRequestData, Processor, ProcessorData, RootObject, RootObjectInstitutions, ValuesData, CreateInstitutionResponse, InstitueRole, InstitueRoles } from 'apps/admin/src/modals/institutions.model';
import { Subscription, debounceTime } from 'rxjs';
import { TranslateService } from '@ngx-translate/core'; 
import { BroadcastMessageBaseComponent } from './boradcast-message.class';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'web-messenger-broadcast-messaging',
  templateUrl: './broadcast-messaging.component.html',
  styleUrls: ['./broadcast-messaging.component.scss']
})

export class BroadcastMessagingComponent extends BroadcastMessageBaseComponent{ 
  public createBroadcastMessageForm!: FormGroup;
  public broadcastActiveStatus = 'list-view';
  public domainKey = '';
  public subscription: Subscription[] = [];
  public broadcastResponseData: BroadcastMessagingValues | null = null;
  public allInstitutionsData: InstitutionDetails[] = [];
  public selectedIndex: number | null = null; 
  public allUsersListData: User[] = [];
  public settingsArrayStates: settingsArrayStates = { filteredSpecialties: [], filteredTitles: [] };
  public showCurrentServiceTeam !: ServiceTeam[];
  public allSpecialTeamChecked = false;
  public allUserCheckboxStates: boolean[] = [];
  public specialtiesCheckboxStates: boolean[] = [];
  public serviceTeam: string[] = [];
  public selectedSpecialties: string[] = [];
  public selectedTitle: string[] = [];
  public listPreviewUser: Users[] = [];
  public isModalActive = false;
  public hideSendUser = false;
  public isSelectedInstitute=false;
  public userName:string ="";
  public selectedInstituteId !: string[];
  public fileSelected: File | null = null;
  public removeCrossIcon=false;
  public disableService=true;
  @ViewChild('chooseTitle') chooseTitle!: ElementRef;
  @ViewChild('chooseUsers') chooseUsers!: ElementRef;
  public sendershowDropdown = false; 
  public enableOrDisableStartProcess:boolean = true;
  public selectedFileName!:string;
  public selectedFileUpload!:string;
  public checkFileSystemINCSV!: File;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public isCSVUpload:boolean = false;
  public isDiscard = "";
  constructor(
    private institutionService: InstitutionsService,
    private InstitutionHelperService: InstitutionHelperService,
    private cookieService: CookieService,
    fb: FormBuilder,
    private UserServices: UsersService,private translateSvc: TranslateService,
    errorHandlingService:ErrorHandlingService,
    userSvc: UsersService,institutionSvc: InstitutionsService,private cd: ChangeDetectorRef,public route: ActivatedRoute) {
      super(fb,errorHandlingService,userSvc,institutionSvc);
    this.domainKey = environment.domain_key;
    this.getInstituteSearchForm();
  }
  ngOnInit(): void {
    this.createBroadcastMessageForm = this.fb.group({ subject: ["", Validators.required],
     message: ["", Validators.required], urgent: [false],
      searchQueryUser: [""],
    Sender: [""],
    searchQuery: [""],
    IIDs: this.fb.array([]), 
    ServiceTeam: [[]], 
    Specialty: [[]], 
    Title: [[]], 
    File: [""], 
    showLockedInstitutions: [false] });
    this.apiTrigger();
    this.subscription.push(this.instituteSearchTerms.pipe(debounceTime(500)).subscribe(term => {
      this.getInstitutitons(term);
    }));
    this.onValueChange();
  }
  public apiTrigger(): void {
    this.subscription.push(this.InstitutionHelperService.adminBatch().subscribe((data: RootObject) => {
      let broadcast = data.processors;
      let broadcast_details = broadcast.map((processor: Processor) => processor.metadata);
      this.broadcastResponseData = broadcast_details[0].values;
      // this.Searchlistofuser();
    }));
    this.subscription.push(
      this.InstitutionHelperService.getInstitutions().subscribe()
    );
    // this.searchInstitutions()
  }
  public searchInstitutions(): void {
    let institutionSearchValue =
      this.createBroadcastMessageForm.get("searchQuery")?.value;
    let showLockedInstitutionsValue = this.createBroadcastMessageForm.get(
      "showLockedInstitutions"
    )?.value;
    institutionSearchValue =
      institutionSearchValue && institutionSearchValue.trim() !== ""
        ? institutionSearchValue
        : "*";
    this.subscription.push(this.institutionService
      .searchInstitutitons(institutionSearchValue, showLockedInstitutionsValue)
      .subscribe((responseData: InstitutionSearchResponse) => {
        this.allInstitutionsData = responseData.institutions;
      })
    );
  }
  public reportingTags(tabname: string): void {
    this.broadcastActiveStatus = tabname;
  }
  public searchUserStop(event:Event):void{
    event.stopPropagation();
    this.hideSendUser = false;
    this.removeCrossIcon=false;
  }
  public searchUser(): void {
    let sendervalue = this.createBroadcastMessageForm.get("searchQueryUser")?.value;
    if(sendervalue == null || sendervalue == "")
    {
      sendervalue ="*";
    }
    this.UserServices.searchUser(sendervalue)
      .subscribe((data: UserSearchResponse) => {
        this.allUsersListData = data.results;
      });
  }
  public Searchlistofuser(): void {
    let sendervalue = "*";
    this.UserServices.searchUser(sendervalue)
      .subscribe((data: UserSearchResponse) => {
        this.allUsersListData = data.results;
      });
  }
  public unSelectUser(username: string): void {
    this.createBroadcastMessageForm?.get("Sender")?.setValue("");
    this.userName = ""
    this.hideSendUser = false;
    this.removeCrossIcon=false;
  }
  public selectsender(selecteduser: User): void {
    if (this.allUsersListData.some(user => user._id.$oid === selecteduser._id.$oid)) {
      this.createBroadcastMessageForm?.get("Sender")?.setValue(selecteduser);
      this.userName = selecteduser.first_name + ' '+ selecteduser.last_name; //selected user firstname & last name to display in UI
      this.removeCrossIcon=true;
      this.hideSendUser = true;
    }
  }
  public selectInstitution(name: InstitutionDetails): void {
    this.isInstituteInputFocused = false;
    if (!this.selectedInstitute.some(institution => institution.id === name.id)) {
      this.selectedInstitute.push(name);
      if (this.selectedInstitute.length) {
        if(this.selectedInstitute.length>1)this.disableService=false;
        this.isSelectedInstitute=true;
        const IIDsControl = this.createBroadcastMessageForm.get('IIDs') as FormArray;
        IIDsControl.push(this.fb.control(name.id));
        this.selectedInstituteId = IIDsControl.value as string[];
        this.hidePreviewUser = true;
        this.getServices(name.id);
      }
      else this.isSelectedInstitute=false;
    }
    this.showDropdown = true;
    this.instituteSearchForm.get('institution')?.setValue("");
  }
  public getServices(selectedInstitute: string): void {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    let First = selectedInstitute;
    this.InstitutionHelperService.institueRoleGet(First).subscribe((data: InstitueRolesData) => {
      if (data.status == "ok") {
       let a = data.roles; 
      this.showCurrentServiceTeam = a.map((role: InstitueRole) => { 
        const tag = role.tag || '';
        return { description: role.description, tag: tag };
    });
      } else if (data.status == "error") {
        let messager: string | undefined = data?.message;
        this.showErrorMsg(data);
      }
    });

    this.InstitutionHelperService.institueGet(First).subscribe((data: CreateInstitutionResponse) => {
      if (data.status == "ok") {
         this.settingsArrayStates.filteredSpecialties.push(...new Set(data?.institution.specialties.sort()))
         this.settingsArrayStates.filteredTitles.push(...new Set(data?.institution.titles.sort()));
        if (!this.settingsArrayStates.filteredSpecialties.length || !this.settingsArrayStates.filteredTitles.length) {
          this.subscription.push(
            this.InstitutionHelperService.getInstitutions().subscribe((data: RootObjectInstitutions) => {
              this.settingsArrayStates.filteredSpecialties = this.settingsArrayStates.filteredSpecialties.length ? this.settingsArrayStates.filteredSpecialties : data?.specialties.sort();
              this.settingsArrayStates.filteredTitles = this.settingsArrayStates.filteredTitles.length ? this.settingsArrayStates.filteredTitles : data?.titles.sort();
            })
          );
        }  
      }
    });
  }
  public serviceOpenModal(): void {
    this.chooseUsers.nativeElement.style.display = 'block';
  }
  public serviceCloseModal(): void {
    this.chooseUsers.nativeElement.style.display = 'none';
  }
  public unselectInstitution(name: string, event:Event): void {
    event.stopPropagation();
    if(this.selectedInstitute.length<=2)this.disableService=true;
    if(this.selectedInstitute.length===1)this.hidePreviewUser=false;
    const iidsControl = this.createBroadcastMessageForm.get('IIDs') as FormArray;
    const iidsDetails = this.selectedInstitute.filter(institute => institute.name == name)
    const controlIndex = iidsControl.controls.findIndex(control => control.value === iidsDetails[0].id);
    if (controlIndex !== -1) {
      iidsControl.removeAt(controlIndex);  
      this.selectedInstituteId = iidsControl.value;
      this.selectedInstitute = this.selectedInstitute.filter(institute => institute.name !== name);
    }
    if(this.selectedInstitute.length === 0) this.isSelectedInstitute = false; 
  }
  public checkAllServiceTeam(): void {
    if (this.showCurrentServiceTeam) {
      this.allUserCheckboxStates = Array(this.showCurrentServiceTeam.length).fill(
        this.allSpecialTeamChecked
      );
      if (this.allSpecialTeamChecked) {
        this.showCurrentServiceTeam.filter(x=>{
          this.serviceTeam.push(x.description);
        }) 
      } else {
        this.serviceTeam = [];
      }
    }
  }
  public onCheckboxChangeService(index: number, service: string): void {
    if (this.allUserCheckboxStates[index])  this.serviceTeam.push(service);
    else this.serviceTeam = this.serviceTeam.filter(s => s !== service);
  }
  public submitService(): void {
    this.createBroadcastMessageForm?.get("ServiceTeam")?.setValue([...this.serviceTeam]); 
    this.serviceCloseModal();
    this.isChildVisibleServiceTeam=false;
  }
 public closeServiceTeamPopUp():void {  
    const formServices: string[] = this.createBroadcastMessageForm?.get("ServiceTeam")?.value ?? [];
    const missingSpecialties = this.serviceTeam.filter(spec => !formServices.includes(spec));
    // show Discard popup
    if (missingSpecialties.length > 0 || JSON.stringify(formServices) != JSON.stringify(this.serviceTeam) ) {
    this.isDiscard = "You have unsaved changes to this property, do you wish to discard them?"; 
    }else{
      this.isChildVisibleServiceTeam = false;
    }
  }
  public discardPopup():void{
    const formSpecialties: string[] = this.createBroadcastMessageForm?.get("ServiceTeam")?.value ?? [];
    const updatedServiceTeam: string[] = []; 
    const updatedCheckboxStates: boolean[] = this.showCurrentServiceTeam.map(spec => {
    const included = formSpecialties.includes(spec.description); 
    if (included) {
      updatedServiceTeam.push(spec.description);
    }
    return included;
    });
    this.allUserCheckboxStates = updatedCheckboxStates;
    this.allSpecialTeamChecked = updatedCheckboxStates.every(item => item === true);
    this.serviceTeam = updatedServiceTeam;
    this.isDiscard = "";
    this.isChildVisibleServiceTeam=false;
  }
  public cancelPopup():void{
    this.isDiscard = "";
    this.isChildVisibleServiceTeam=true;
  }
  public previouUser(): void {
    if (this.createBroadcastMessageForm?.get('IIDs')?.value.length != 0) {
      const iCookieValue = this.cookieService.getCookie(`s${environment.domain_key ? `-${environment.domain_key}` : ""}`);
      if (iCookieValue) {
        const jsonObject: { i: string; e: string; s: boolean } = JSON.parse(iCookieValue);
        if (jsonObject) {
          let previouUser: PreviwUserRequestData = {
            processor: "broadcast_messaging",
            users: { ou: this.selectedInstituteId, specialty: this.selectedSpecialties, title: this.selectedTitle, service: this.serviceTeam }
          }
          this.InstitutionHelperService.getPreviewUser(previouUser).subscribe((data: UsersResponse) => {
            if (data.status == "ok") this.listPreviewUser = data.users as unknown as Users[];
          })
        }
      }
    }
  }
  public sendertoggleDropdown(event: Event): void {
    event.stopPropagation();        
    this.sendershowDropdown = !this.sendershowDropdown;
  }
  public handleSpecialtiesChanged(): void {
    this.isChildVisibleSpecialties = false;
    this.selectedSpecialties = this.createBroadcastMessageForm?.get("Specialty")?.value;
  }
  public handleTitleChanged(): void {
    this.isChildVisibleTitle = false;
    this.selectedTitle = this.createBroadcastMessageForm?.get("Title")?.value;
  }
  public createBroadcastMessage(): void {
    if (this.createBroadcastMessageForm.valid) {
      const iCookieValue = this.cookieService?.getCookie(`s${environment.domain_key ? `-${environment.domain_key}` : ""}`);
      if (iCookieValue) {
        const jsonObject: { i: string; e: string; s: boolean } = JSON.parse(iCookieValue);
        const iidsArray: string[] = this.createBroadcastMessageForm.get('IIDs')?.value || [];
        let BroadcastMessageValues: ProcessorData = {
          processor: "broadcast_messaging",
          users: { "ou": iidsArray.filter((item)=>item!=null) ,
          "specialty": this.selectedSpecialties.filter((item:any)=>item!=null),
          "title": this.selectedTitle.filter((item:any)=>item!=null),
          "service": this.serviceTeam.filter((item:any)=>item!=null)},
          values: { "subject": this.createBroadcastMessageForm?.get('subject')?.value, "sender": this.createBroadcastMessageForm?.get('Sender')?.value?._id?.$oid || "", "message": this.createBroadcastMessageForm?.get('message')?.value, "urgent": this.createBroadcastMessageForm?.get('urgent')?.value  },
          commit: true,
        }
        const formData: FormData = this.constructFormData(BroadcastMessageValues);
        this.submitFormData(formData);
        this.isSelectedInstitute = false;
      }
    }
  }

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

  private constructFormData(jsonData: ProcessorData): FormData {
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
    this.InstitutionHelperService.postBroadcastMessageWithAttachedCSV(formData).subscribe((data: QuickMessageApiResponse) => {
      if (data.status == "ok") {
        this.showSuccessPopup = data.status === "ok" ? `${this.translateSvc.instant('broadcastSuccessMessage')}` : "";
        this.reset();
        //Successfully submitted job
      }
    })
  }

  public onFileSelected(event: Event):void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file: File = inputElement.files[0];
      this.fileSelected = file;
    }
  }
  public removeFile():void{
    if (this.fileInput) {
      (this.fileInput.nativeElement as any).value = null;
      this.selectedFileName = "";
      this.enableOrDisableStartProcess = true;
      this.isCSVUpload=false;
    }
    if (this.createBroadcastMessageForm.get('IIDs')?.value.length > 0) {
      this.enableOrDisableStartProcess = false;
    }
  }
  public reset(): void {
    this.createBroadcastMessageForm.reset();
    this.selectedSpecialties = [];
    this.allUserCheckboxStates = [];
    this.specialtiesCheckboxStates = [];
    this.serviceTeam = [];
    this.selectedSpecialties = [];
    this.selectedTitle = [];
    this.selectedInstitute = [];
    this.userName = "";
    this.selectedFileName = "";
    this.fileSelected = null;
    this.removeCrossIcon=false;
    this.removeFile();
    this.enableOrDisableStartProcess = true;
    this.hidePreviewUser = false;
    this.isCSVUpload=false;
  }
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
  public uploadFile(event: Event): void {
    event.preventDefault();
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    this.selectedFileName = "";
    if (files && files.length > 0) {
      const file = files[0];
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { 
        this.selectedFileUpload = reader.result as string;  
        this.uploadProfileImage(file);
      };
      this.cd.markForCheck();
    }
  }

  public uploadProfileImage(storeFile: File): void {
    this.selectedFileName = storeFile.name;
    this.checkFileSystemINCSV = storeFile;
    this.isCSVUpload=true;
    this.enableOrDisableStartProcess = false;
  }

  public onValueChange():void{
    this.createBroadcastMessageForm.get("IIDs")?.valueChanges.subscribe((value) => {
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
}