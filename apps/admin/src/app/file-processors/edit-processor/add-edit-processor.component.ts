import { CookieService, status } from '@amsconnect/shared';
import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdtProcessorSubjectData, Editprocessor, ViewFileProcessProcessorResponse } from 'apps/admin/src/modals/filesProcess.model';
import { UserSearchByIdResponse } from 'apps/admin/src/modals/users.model';
import { AppNavigationService } from '../../../services/app-navigation.service';
import { FilesProcessService } from 'apps/admin/src/services/file-process.service';
import { FilesService } from 'apps/admin/src/services/files.service';
import { UsersService } from 'apps/admin/src/services/users.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'web-messenger-add-edit-processor',
  templateUrl: './add-edit-processor.component.html'
})

export class AddEditProcessorComponent implements OnInit, OnChanges,DoCheck,OnDestroy {
  @Input() id:string  = "";
  public addProcessorForm: FormGroup;
  public tags: string[] = [];
  public userId!:string;
  public submitted: boolean = false;
  public isReportingTag: boolean = false;
  public viewAddProvisiongProcessorTag!:ViewFileProcessProcessorResponse;
  public uRLADTProcessData!:string;
  public returnToURLPageTriggerd!:string;
  public disabledFormChanged: boolean = false;
  public emailValidatorRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  public isEmailValidOrNotCheck: boolean = false;
  public instituteId!:string;
  private subscription: Subscription = new Subscription();

  constructor(
    public formBuilder: FormBuilder,
    public cookieService: CookieService,
    public filesProcessService:FilesProcessService,
    public userSvc: UsersService,
    public filesService:FilesService,
    private route: ActivatedRoute,
    public router: Router,
    public navigateSvc: AppNavigationService,
    ){
      this.addProcessorForm = this.formBuilder.group({
        typeofProcessor: new FormControl({ value: "provisioning", disabled: true }),
        uRLProcessor: new FormControl({value: "",disabled: true}),
        institution: new FormControl(""),
        notifyAllFAAdmins: new FormControl({value: false,disabled: false}),
        pollInterval: new FormControl(""),
      });
  }

  ngOnChanges(): void {
    this.getRouteParamsData();
    this.getBehaviourSubjectData();
  }

  ngOnInit(): void {
    this.getUserID();
  }

  ngDoCheck(): void  { 
    if (this.viewAddProvisiongProcessorTag && (this.tags !== this.viewAddProvisiongProcessorTag?.dropbox?.notification_emails || this.viewAddProvisiongProcessorTag?.dropbox?.email_admins !== this.addProcessorForm.controls['notifyAllFAAdmins'].value || this.viewAddProvisiongProcessorTag?.dropbox?.interval !== this.addProcessorForm.controls['pollInterval'].value)) {
      this.disabledFormChanged = true;
    }
  }

  public getRouteParamsData(): void {
    if (this.id !== undefined) {
      this.fetchViewDataForCreatedProcessor(this.id);
    }
  }

  public getBehaviourSubjectData():void{
    this.subscription.add(
      this.filesProcessService.dataAddProcessor$.subscribe((data:AdtProcessorSubjectData) => {
        if(data.urlRoute !== "" && data.cancelRoute !== ""){
          this.addProcessorForm.patchValue({
            uRLProcessor: `filearea://${data.urlRoute}`,
          });
          this.uRLADTProcessData = data.urlRoute;
          this.returnToURLPageTriggerd = data.cancelRoute;
          this.disabledFormChanged = true;
        }else if (data.urlRoute === "" && data.cancelRoute ==="" && this.id === undefined){
          this.navigateSvc.navigate([`/filearea`]);
        }
      })
    );
  }

  
  public getUserID(): void {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    this.userId = aCookieValue?.split("|")[1];
    this.getUserData(this.userId);
  }

  public getUserData(userId: string): void {
    this.userSvc.getUserDataById(userId).subscribe((data: UserSearchByIdResponse) => {
      if (data.status == status.StatusCode.OK) {
        this.addProcessorForm?.get('institution')?.setValue(data.user.profile.iid);
      }
    })
  }

  public receiveInstituteNameID(event: string): void { 
    if(event == undefined)
    {
      this.disabledFormChanged = false;
    }
    else{
      if(this.instituteId == event)
      {
        this.addProcessorForm?.get('institution')?.setValue(event); 
        this.disabledFormChanged = false;
      }else{
        this.addProcessorForm?.get('institution')?.setValue(event); 
        this.disabledFormChanged = true;
      }
    }

  }

  public isValidEmail(email:string):boolean {
    const emailValidatorRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailValidatorRegex.test(email);
  }

  public addProcessorSubmit():void{
      this.submitted = true;
        const dataObject: Editprocessor = {
          type: '',
          url: '',
          interval: 0,
          allowed_errors: 0,
          iid: '',
          email_admins: false,
          notification_emails: [],
          a: ''
        };


        const aCookieValue = this.cookieService.getCookie("a");
        if (aCookieValue) {
            dataObject["a"] = aCookieValue;
        }


        if (this.id !== undefined) {
            dataObject["id"] = this.id;
        }
        // Add other form controls to the object
        dataObject["type"] = this.addProcessorForm.controls['typeofProcessor'].value;
        dataObject["url"] = this.addProcessorForm.controls['uRLProcessor'].value;
        dataObject["iid"] = this.addProcessorForm.controls['institution'].value;

        if (this.tags.length > 0) {
            dataObject["notification_emails"] = this.tags;
        }
        dataObject["email_admins"] = this.addProcessorForm.controls['notifyAllFAAdmins'].value;

        dataObject["interval"] = this.addProcessorForm.controls['pollInterval'].value || "5";

      this.filesProcessService.addProcessorArea(dataObject).subscribe((data: ViewFileProcessProcessorResponse) => {
        if (data.status == status.StatusCode.OK) {
        this.navigateSvc.navigate([`/dropbox/view/${data.dropbox.id}`]);
        this.disabledFormChanged = false;
        }
      })
    
  }

  public reportingTagsValue(data: string[]): void { 
    this.tags = data; 
  }

  public isreportingTags(data: boolean): void { 
    this.isReportingTag = data; 
  }

  public openReportingTags(): void { 
    this.isReportingTag = true; 
  }

  public fetchViewDataForCreatedProcessor(pathID:string):void{
    this.filesProcessService.viewCreatedProcessor(this.id).subscribe((data: ViewFileProcessProcessorResponse) => {
      if (data.status == status.StatusCode.OK) {
        this.viewAddProvisiongProcessorTag = data;
        this.setFormValues(this.viewAddProvisiongProcessorTag)
      }
    })
  }

  public setFormValues(data:ViewFileProcessProcessorResponse):void {
    if(data.dropbox.iid)
    {
      this.instituteId = data.dropbox.iid;
    }
    this.addProcessorForm.patchValue({
        typeofProcessor: data.dropbox.type,
        uRLProcessor: data.dropbox.url,
        institution: data.dropbox.iid,
        notifyAllFAAdmins: data.dropbox.email_admins,
        pollInterval: data.dropbox.interval,
    });
    this.tags = data.dropbox.notification_emails;
  }

  public navigateToViewPage():void {
    if(this.id !== undefined){
      this.navigateSvc.navigate([`/dropbox/view/${this.id}`]);
    }else{
    this.navigateSvc.navigate([`/filearea/${this.returnToURLPageTriggerd}`]);
    }
  }

  public keyPress(event: any): void {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) { event.preventDefault(); }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}