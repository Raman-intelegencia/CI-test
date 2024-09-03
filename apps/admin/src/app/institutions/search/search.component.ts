import { InstitutionDetails, InstitutionSearchResponse } from '@amsconnect/shared';
import { InstitutionsService } from '../../../services/institutions.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Institute } from '../../../modals/institutions.model';
import { AppNavigationService } from '../../../services/app-navigation.service';

@Component({
  selector: "institutions-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  public allInstitutionsData: InstitutionDetails[] = [];
  public institutionSearchForm!: FormGroup;
  public showLoader =false; 
  constructor(
    private institutionService: InstitutionsService,
    private fb: FormBuilder,
    public navigateSvc: AppNavigationService,
  ) {
    this.institutionSearchForm = this.fb.group({
      institutionSearch: [""],
      showLockedInstitutions: [false],
    });
  }

  ngOnInit(): void {
    this.searchInstitutions();
  }

  // Search institutions api call
  public searchInstitutions(): void {
    let institutionSearchValue =
      this.institutionSearchForm.get("institutionSearch")?.value;
    const showLockedInstitutionsValue = this.institutionSearchForm.get(
      "showLockedInstitutions"
    )?.value;

    institutionSearchValue =
      institutionSearchValue && institutionSearchValue.trim() !== ""
        ? institutionSearchValue
        : "*";
        this.showLoader = true; 
        
    this.institutionService
      .searchInstitutitons(institutionSearchValue, showLockedInstitutionsValue)
      .subscribe((responseData: InstitutionSearchResponse) => {
        this.allInstitutionsData = responseData.institutions;
        this.showLoader = false;
      });
  }
// Show all will reset the institutionform and call search api
  public showAllInstitutions():void{
    this.institutionSearchForm.reset();
    this.searchInstitutions();
  }

  public onItemClick(institutionID: Institute):void {
    const fetchedInstitutionID=institutionID.id;
    this.navigateSvc.navigate(['institution',fetchedInstitutionID]);
 }
}
