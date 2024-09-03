import { Component, DestroyRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { InstitutionsService } from '../../services/institutions.service';
import { InstitutionDetails, InstitutionSearchResponse } from '@amsconnect/shared';
import { UsersService } from '../../services/users.service';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Admin, User, UserSearchResponse } from '../../modals/users.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserHelperService } from '../../services/user-helper.service';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { UserInfoService } from '../../services/user-info.service';
import { AppNavigationService } from '../../services/app-navigation.service';

@Component({
  selector: "web-messenger-user-search",
  templateUrl: "./user-search.component.html",
  styleUrls: ["./user-search.component.scss"],
})
export class UserSearchComponent implements OnInit {
  active_status = "gridview";

  public allInstitutions: InstitutionDetails[] = [];
  public selectedInstitution: InstitutionDetails | null = null;
  public allUsersListData: User[] = [];
  public userSearchForm!: FormGroup;
  public selectedInstitute:InstitutionDetails[] = [];
  public isInstituteInputFocused = false;
  public showSelectedInstituteDiv = false;
  public isInstituteDropdownOpen = false;
  private instituteSearchTerms = new Subject<string>();
  public highlightedIndex = -1;
  public isUserSearch =false;
  public subscription = new Subscription();
  public searchName="";
  public searchApiUsers=false;
  public searchNotSignedIn=false;
  public searchInstituteName="";
  public searchInfoRedirection:boolean=false;
  public isSelectionFromQueryParams = false;
  public showLoader = false; 

  constructor(
    private institutionSvc: InstitutionsService,
    private userSvc: UsersService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userHelperSvc: UserHelperService,
    public userInfoSvc: UserInfoService,
    public destroySub: DestroyRef,
    public navigateSvc: AppNavigationService,
  ) {
    this.userSearchForm = this.fb.group({
      search: [""],
      apiUsers: false,
      notSignedIn: false,
      inst: [""]
    });

    this.subscription.add(
      this.userInfoSvc.dataUserInfoPage$.subscribe((infoPageRedirection: boolean) => {
        if(infoPageRedirection === true) {
          this.searchInfoRedirection = infoPageRedirection;
        } 
      })      
    );

    this.destroySub.onDestroy(() => {
      this.subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.allUsersListData = [];
    if (this.searchInfoRedirection === true) {
        this.getBehaviourSubjectData();
    }
    this.activatedRoute.params.subscribe(params => {
        const userName = params['userName'] || '';
        this.userSearchForm.get('search')?.setValue(userName);
        
        this.activatedRoute.queryParams.subscribe(queryParams => {
            const apiUsers = queryParams['apiUsers'] === 'true';
            const notSignedIn = queryParams['notSignedIn'] === 'true';
            const inst = queryParams['inst'] || '';
            
            this.userSearchForm.get('apiUsers')?.setValue(apiUsers ?? false);
            this.userSearchForm.get('notSignedIn')?.setValue(notSignedIn ?? false);
            this.userSearchForm.get('inst')?.setValue(inst);
            // Check if any relevant query parameters are present
            if (userName || apiUsers || notSignedIn || inst) {
              
                this.getUsersData(); // Always call getUsersData if any relevant query parameters exist
            }
            // Specifically handle institution selection based on query params
            if (inst) {
                this.isSelectionFromQueryParams = true;
                this.getInstitutitons(inst); // Call with inst to handle auto-selection
            } else {
                this.getInstitutitons(); // Call without parameters for regular functionality
            }
        });
    });
    this.instituteSearchTerms.pipe(
        debounceTime(300)
    ).subscribe(term => {
        this.getInstitutitons(term);
    });
  }


  public getBehaviourSubjectData(): void {
    this.subscription.add(
      this.userInfoSvc.dataUserInfoNameSearch$.subscribe((nameSearch: string) => {
        if(nameSearch !== "") {this.searchName = nameSearch}; 
      })      
    );

    this.subscription.add(
      this.userInfoSvc.dataUserInfoApiUsersSearch$.subscribe((apiUsers: boolean) => {
        if(apiUsers) {this.searchApiUsers = apiUsers}; 
      })      
    );

    this.subscription.add(
      this.userInfoSvc.dataUserInfoNotSignedSearch$.subscribe((notSigned: boolean) => {
        if(notSigned) {this.searchNotSignedIn = notSigned};
      })      
    );

    this.subscription.add(
      this.userInfoSvc.dataUserInfoInstitutionSearch$.subscribe((instSearch: string) => {
        if(instSearch !== "") {this.searchInstituteName = instSearch}; 
      })      
    );
    this.getDataAfterReturn();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.userSearchForm.controls;
  }

  public changeTab(tabname: string): void {
    this.active_status = tabname;
  }

  public institutionSearch(term:string):void{
    this.instituteSearchTerms.next(term);
  }

  public getInstitutitons(instituteSearchText?: string): void {  
    const searchTxt = instituteSearchText ? instituteSearchText : "";
    this.institutionSvc.searchInstitutitons(searchTxt, false)
    .subscribe((data: InstitutionSearchResponse) => {
      this.allInstitutions = data.institutions; 
      if (this.isSelectionFromQueryParams) {
        const instValue = this.userSearchForm.get('inst')?.value;
        if(instValue){
          const institute = this.allInstitutions.find(institute => institute.id === instValue);
          if (institute) {
            this.selectInstitute(institute);
          }
        }
        // Reset flag after handling
        this.isSelectionFromQueryParams = false;
      }
      
      this.showSelectedInstituteDiv = true;
    });
}


  public onUserSearch(): void {
    const userName = this.f["search"].value;
    const apiUsers = this.f["apiUsers"].value;
    const notSignedIn = this.f["notSignedIn"].value;
    const inst = this.checkIfInstituteIsSelected();
  
    const path = ["/search"];
    // Prepare query parameters, setting unchecked boxes to null
    const queryParams: any = {
      apiUsers: apiUsers ? apiUsers : null,
      notSignedIn: notSignedIn ? notSignedIn : null,
      inst: inst ? inst : null
    };
    // If there is a userName, add it to the path
    if (userName) {
      path.push(userName);
    }
    // Navigate with updated query parameters
    this.navigateSvc.navigate(path, {
      queryParams: queryParams,
      queryParamsHandling: "merge" // Merge with existing query params
    });
  }

  public getUsersData(): void {
    const instValue = this.checkIfInstituteIsSelected();
    this.isUserSearch = false;
    this.showLoader = true;
    this.userInfoSvc.setUserInfoInstitutionSearchData(instValue);
    this.userSvc
      .searchUsers(
        this.f["search"].value,
        this.f["apiUsers"].value,
        this.f["notSignedIn"].value,
        instValue
      )
      .subscribe((data: UserSearchResponse) => {
        this.showLoader = false;
        this.allUsersListData = data.results;
        this.isUserSearch = true
      },
      (error) => {    
        if(error.error)
          this.showLoader = false;
      });
  }

  public checkIfInstituteIsSelected():string{
    let instValue = "";
    if(this.selectedInstitute.length){
      instValue = this.selectedInstitute[0].id
    }else{
      instValue = this.f['inst'].value
    }
    return instValue;
  }

  public navigateToDetails(user:User):void{
    if(this.userSearchForm.get('search')?.value !== "") {
      this.userInfoSvc.setUserInfoNameSearchData(this.f["search"].value);
    }
    if(this.userSearchForm.get('apiUsers')?.value !== "") {
      this.userInfoSvc.setUserInfoApiUsersSearchData(this.f["apiUsers"].value);
    }
    if(this.userSearchForm.get('notSignedIn')?.value !== "") {
      this.userInfoSvc.setUserInfoNotSignedSearchData(this.f["notSignedIn"].value);
    }
    this.navigateSvc.navigate([`/user/${user?._id?.$oid}`]);
  }

  public isAdmin(admin: Admin[] | undefined): boolean {
    return this.userHelperSvc.isAdmin(admin);
  }

  public isSuperAdmin(admin: Admin[] | undefined): boolean {
    return this.userHelperSvc.isSuperAdmin(admin);
  }

  public selectInstitute(institute: InstitutionDetails | undefined): void {
    if(!institute){
      return;
    }
    
    this.selectedInstitute = [institute]; // Assuming single selection
    this.userSearchForm.get('inst')?.setValue(institute.name + ' (' + institute.id + ')');
    this.isInstituteInputFocused = false;
  }

  public handleInstitutionInputBlurEvent(): void {
    setTimeout(() => {
      this.isInstituteInputFocused = false;
      // If no institute is selected, keep the search text in the form control
    if (!this.selectedInstitute.length) {
      const searchText = this.userSearchForm.get('inst')?.value;
      if (searchText) {
        this.userSearchForm.get('inst')?.setValue(searchText);
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
      const searchText = this.userSearchForm.get('inst')?.value;
    }
    this.getUsersData();
  }

  public get searchTerm(): string {
    return this.userSearchForm.get('inst')?.value ?? '';
  }

  public clearInput(): void {
    this.userSearchForm.get('inst')?.setValue('');
    this.selectedInstitute = [];
  }

  public getDataAfterReturn(): void {
    this.userInfoSvc.setUserInfoInstitutionSearchData(this.searchInstituteName);
    this.userSvc
      .searchUsers(
        this.searchName,
        this.searchApiUsers,
        this.searchNotSignedIn,
        this.searchInstituteName
      ).subscribe((data: UserSearchResponse) => {
        this.allUsersListData = data.results;
        this.isUserSearch = true;
        this.userInfoSvc.setUserInfoPageRedirection(false);
      });
  }
}