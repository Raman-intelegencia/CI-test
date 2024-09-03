import { ErrorHandlingService, InstitutionDetails, InstitutionSearchResponse, SelectedServiceTeam, ShowCurrentServiceTeam } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { InstitueReportsResponse } from "apps/admin/src/modals/institutions.model";
import { InstitutionsService } from "apps/admin/src/services/institutions.service";
import { UsersService } from "apps/admin/src/services/users.service";
import { Subject } from "rxjs";

 
@Injectable()
export class ChildOUsBaseComponent {
    public instituteSearchForm!: FormGroup;
    public instituteSearchTerms = new Subject<string>();
    public allInstitutions: InstitutionDetails[] = [];
    public showSelectedInstituteDiv = false;
    public selectedInstitute: InstitutionDetails[] = [];
    public isInstituteInputFocused = false;
    public showDropdown = false;
    constructor(public fb: FormBuilder,
        public errorHandlingService:ErrorHandlingService,
        public userSvc: UsersService,public institutionSvc: InstitutionsService){}

    public getInstituteSearchForm():void{
        this.instituteSearchForm = this.fb.group({ institution: [""] });
    }
 

      public institutionSearch(term: string): void {
        this.getInstitutitons(term);
      }
    
      public getInstitutitons(instituteSearchText?: string): void {
        const searchTxt = instituteSearchText ? instituteSearchText : "";
        this.institutionSvc
          .searchInstitutitons(searchTxt, false)
          .subscribe((data: InstitutionSearchResponse) => {
            this.allInstitutions = data.institutions;  
            const instvalue = this.instituteSearchForm.get('institution')?.value;
            this.showSelectedInstituteDiv = true;
          },(err)=>{
            this.errorHandlingService.getDefaultErrorResponse();
          });
      }
    
      public selectInstitute(institute: InstitutionDetails | undefined): void {
        if (!institute) {
          return;
        }
        this.selectedInstitute = [institute]; // Assuming single selection
        this.instituteSearchForm.get('institution')?.setValue(institute.name + ' (' + institute.id + ')');
        this.isInstituteInputFocused = false;
      }
    
      public handleInstitutionInputBlurEvent(): void {
        setTimeout(() => {
          this.isInstituteInputFocused = false;
          // If no institute is selected, keep the search text in the form control
          if (!this.selectedInstitute.length) {
            const searchText = this.instituteSearchForm.get('institution')?.value;
            if (searchText) {
              this.instituteSearchForm.get('institution')?.setValue(searchText);
            }
          }
        }, 200); // Delay of 200ms (you can adjust this based on your needs)
      }
    
      public get searchTerm(): string {
        return this.instituteSearchForm.get('institution')?.value ?? '';
      }
    
      public clearInput(): void {
         this.selectedInstitute =[];
      }

      public toggleDropdown(event: Event): void {
        event?.stopPropagation();        
        this.showDropdown = !this.showDropdown;
       
      }

      public clickInstitution(event:Event):void{
        event.stopPropagation();
      }
}
