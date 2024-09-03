import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder,FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InstitutionsService } from '../../../services/institutions.service';
import { InstitutionSearchResponse,InstitutionDetails,status,ErrorHandlingService, HighlightSearchTxtPipe} from '@amsconnect/shared';
import { UsersService } from '../../../services/users.service';
import { Subject, debounceTime } from 'rxjs';
import { UserSearchByIdResponse } from '../../../modals/users.model';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'web-messenger-institution-search',
  templateUrl: './institution-search.component.html',
  standalone: true,
  imports:[CommonModule, TranslateModule, HighlightSearchTxtPipe, FormsModule, ReactiveFormsModule]
})
export class InstitutionSearchComponent implements OnInit {
  @Input('institutionId') institutionId !: string;
  @Input('isInstituteMatchbyId') isInstituteMatchbyId = false;
  @Input('userIDSearchInstitution') userIDInstitution !: string;
  @Input() showInstitutionLabel = true;
  @Output('searchedInstituteData') searchedInstitute = new EventEmitter<string>();
  @Output() checkIfInstSearchIsEmpty = new EventEmitter<boolean>();
  @Input('isInstituteSearch') isInstituteSearch = false;
  @Input ({required: false}) isRestCreateAPIUser = false;
  @Output() checkForResetApiUserForm = new EventEmitter<boolean>();
  @Output() userDataResponse = new EventEmitter<UserSearchByIdResponse>();

  public allInstitutions: InstitutionDetails[] = [];
  public instituteSearchForm!: FormGroup;
  public selectedInstitute: InstitutionDetails[] = [];
  public isInstituteInputFocused = false;
  public showSelectedInstituteDiv = false;
  private instituteSearchTerms = new Subject<string>(); 
  constructor(private institutionSvc: InstitutionsService, 
    private userSvc: UsersService, 
    private fb: FormBuilder,
    private errorHandlingService:ErrorHandlingService) {
    this.instituteSearchForm = this.fb.group({ inst: [""] });
  }

  ngOnInit(): void {
    if(this.userIDInstitution){
      this.getUserData();
    }
    this.instituteSearchTerms.pipe(debounceTime(500)).subscribe(term => {
      this.getInstitutitons(term)
    });
  }

  ngOnChanges(): void {
    if(this.institutionId){
      this.instituteSearchForm.get('inst')?.setValue(this.institutionId);
      this.getInstitutitons(this.institutionId);
    }
    if(this.isRestCreateAPIUser ){
      this.instituteSearchForm.get('inst')?.setValue('');
      this.checkForResetApiUserForm.emit(false);
      }
    }
    
  public getUserData(): void {
    this.userSvc.getUserDataById(this.userIDInstitution).subscribe((data: UserSearchByIdResponse) => {
      if (data.status == status.StatusCode.OK) { 
         this.userDataResponse.emit(data);
        this.instituteSearchForm.get('inst')?.setValue(data.user.profile.iname + ' (' + data.user.profile.iid + ')');
      }
    })
  }

  public institutionSearch(term: string): void {
    this.instituteSearchTerms.next(term);
  }

  public getInstitutitons(instituteSearchText?: string): void {
    const searchTxt = instituteSearchText ? instituteSearchText : "";
    if(!searchTxt){
      this.checkIfInstSearchIsEmpty.emit(true);
    }else{
      this.checkIfInstSearchIsEmpty.emit(false);
    }
    this.institutionSvc
      .searchInstitutitons(searchTxt, false)
      .subscribe((data: InstitutionSearchResponse) => {
        this.allInstitutions = data.institutions;
        this.showSelectedInstituteDiv = true;
      },(err)=>{
        console.warn(err);
        this.errorHandlingService.getDefaultErrorResponse();
      });
  }

  public getbyInstitutitonId(institutionId?: string): void {
    if(institutionId)
    {
      const institute = this.allInstitutions.find(institute => institute.id === institutionId);
      this.selectInstitute(institute);
    }
  }

  public selectInstitute(institute: InstitutionDetails | undefined): void {
    if (!institute) {
      return;
    }
    this.selectedInstitute = [institute]; // Assuming single selection
    this.instituteSearchForm.get('inst')?.setValue(institute.name + ' (' + institute.id + ')');
    this.searchedInstitute.emit(institute.id);
    this.isInstituteInputFocused = false;
  }

  public handleInstitutionInputBlurEvent(): void {
    setTimeout(() => {
      this.isInstituteInputFocused = false;
      // If no institute is selected, keep the search text in the form control
      if (!this.selectedInstitute.length) {
        const searchText = this.instituteSearchForm.get('inst')?.value;
        if (searchText) {
          this.instituteSearchForm.get('inst')?.setValue(searchText);
        }
      }
    }, 200); // Delay of 200ms (you can adjust this based on your needs)
  }

  public handleOnInstitutionInputEnterKeyEvent(): void {
    if (this.allInstitutions && this.allInstitutions.length > 0) {
      // Select the first institute from the list
      const firstInstitute = this.allInstitutions[0];
      this.selectInstitute(firstInstitute);
    } else {
      // Keep the current search text and perform any additional actions needed
      const searchText = this.instituteSearchForm.get('inst')?.value;
    }
  }

  public get searchTerm(): string {
    return this.instituteSearchForm.get('inst')?.value ?? '';
  }

  public clearInput(): void {
    this.instituteSearchForm.get('inst')?.setValue('');
    this.searchedInstitute.emit(undefined); //emit undefined to remove selected institution on search
  }

  public clickInstitution(event:Event):void{
    event.stopPropagation();
  }

  public touchSelectInstituteNew(event: TouchEvent | MouseEvent, institute: InstitutionDetails | undefined): void {
    event.preventDefault();
    if (!institute) {
      return;
    }
    this.selectedInstitute = [institute]; // Assuming single selection
    this.instituteSearchForm.get('inst')?.setValue(institute.name + ' (' + institute.id + ')');
    this.searchedInstitute.emit(institute.id);
    this.isInstituteInputFocused = false;
  }

}