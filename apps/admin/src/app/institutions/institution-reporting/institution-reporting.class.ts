import { Injectable } from "@angular/core"; 
import { ChildOUsBaseComponent } from "./child-OUs.class";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { CookieService, ErrorHandlingService, InstitutionDetails, SelectedServiceTeam, ShowCurrentServiceTeam } from "@amsconnect/shared";
import { UsersService } from "apps/admin/src/services/users.service";
import { InstitutionsService } from "apps/admin/src/services/institutions.service";
import { Subscription } from "rxjs";
import { InstitutionHelperService } from '../../../services//institution-helper.service';
import { InstitueReportsResponse, InstitueRolesData } from "apps/admin/src/modals/institutions.model";

export class InstituteRportingBaseComponent extends ChildOUsBaseComponent{
    public createInstituteReportForm!: FormGroup;
    public domainKey = '';
    public subscription: Subscription = new Subscription;
    public successError = '';
    public showErrorPopup = false; 
    public institutePHI= ["conversations", "content", "patients"];
    public currentDate = "";
    public isCollapseOpen = false;
    public isSelectedInstitute=false;
    public jobId=""; 
    public showSuccessPopup =false;
    public hidePreviewUser = false;
    public isChildVisibleServiceTeam?:boolean; 
    public serviceTeam: SelectedServiceTeam[] = []; 
    public allUserCheckboxStates:{[teamId: string]: boolean;}  = {};
    public closeInput = false;
    public selectedIndex: number | null = null; 
    public allSpecialTeamChecked: boolean[] = [];
    public isShowServiceTeam = false;
    public allInstitutionsData: InstitutionDetails[] = [];
    public newJobID:string | null = "";
    public currentURL!: string;
    public serviceTapopen!:Boolean;
    public showCurrentServiceTeam: ShowCurrentServiceTeam[] = [];
    constructor(
        fb: FormBuilder,
        errorHandlingService:ErrorHandlingService,
        userSvc: UsersService,
        institutionSvc: InstitutionsService,
        public cookieService: CookieService,
        public InstitutionHelperService: InstitutionHelperService){
        super(fb,errorHandlingService,userSvc,institutionSvc);
    }

    public openServiceTeam(): void {
        if(this.hidePreviewUser)
        {
          this.isChildVisibleServiceTeam = true;
          this.serviceTapopen = true;
        }
      }

    public showServiceTeam(): void {
        this.isShowServiceTeam = true;
        this.isChildVisibleServiceTeam = false;
        this.serviceTapopen = false;
      }
    public closeServiceTeam(): void {
        this.isShowServiceTeam = true;
        this.isChildVisibleServiceTeam = false;
      }

    public closeErrorPopup() :void{
        this.successError = "";
        this.showSuccessPopup = false;
      }
      
      public reset(): void {
        this.createInstituteReportForm.reset();
        this.allUserCheckboxStates = {};
        this.serviceTeam = [];
        this.selectedInstitute=[]
      }
      public resetPopupvalue(value:boolean):void{
        this.showSuccessPopup = value 
      } 

      public setInstituteNameinInstitutionsField():void{
        this.newJobID = new URLSearchParams(this.currentURL.split('?')[1]).get('institutionName');
         let gui: InstitutionDetails | undefined;
        if (this.newJobID !== null) {
         
          gui = this.allInstitutionsData.find((item) => item.id === this.newJobID);
          if(gui !== undefined){
            this.selectedInstitution(gui)
            const iidsControl = this.createInstituteReportForm.get('IIDs') as FormArray;
            iidsControl.push(this.fb.control(gui.id));
          }
        }
        this.setDate();
       
       
      }

      public selectedInstitution(name: InstitutionDetails): void {
          this.selectedInstitute.push(name);
          if (this.selectedInstitute.length) {
            this.isSelectedInstitute = true;
            const iidsControl = this.createInstituteReportForm.get('IIDs') as FormArray;
            iidsControl.push(this.fb.control(name.id));
            this.hidePreviewUser = true;
            this.getService(this.selectedInstitute);
          } else { this.isSelectedInstitute = false }
        this.instituteSearchForm.get('institution')?.setValue("");
      }
    
      public getService(selectedInstitute: InstitutionDetails[]): void {
        let aCookieValue = this.cookieService.getCookie("a");
        aCookieValue = aCookieValue ? aCookieValue : "";
        let selectedInstituteID = this.selectedInstitute[selectedInstitute.length - 1]?.id;
        let selectedInstituteName = this.selectedInstitute[selectedInstitute.length - 1]?.name;
        this.InstitutionHelperService.institueRoleGet(selectedInstituteID).subscribe((data: InstitueRolesData) => {
          if (data.status === "ok") {
            let teams = data.roles.map(team => team);
            this.showCurrentServiceTeam = [...this.showCurrentServiceTeam, {
              name: selectedInstituteName,
              iid: selectedInstituteID,
              teams: teams,
            }];
          }
        });
      }
      public setDate():void{
        const currentDate = new Date();
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(currentDate.getDate() - 7);
        this.createInstituteReportForm.patchValue({ dateFrom:this.formatDate(oneWeekAgo),dateTo:this.formatDate(currentDate)})
      }
    
      public formatDate(date:Date):string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      public getCheckboxInboxValue(event: Event):void {
        const checkboxEvent = (event.target as HTMLInputElement).checked;
        this.createInstituteReportForm.controls['excludeLockedUsers'].setValue(checkboxEvent);
      }
}
