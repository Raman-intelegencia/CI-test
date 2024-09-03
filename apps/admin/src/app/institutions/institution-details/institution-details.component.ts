import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Institution,
  InstitutionResponse,
} from 'apps/admin/src/modals/institutions.model';
import { DashboardIntegration } from 'apps/admin/src/models/integration.model';
import { map } from 'rxjs';
import { AppNavigationService } from '../../../services/app-navigation.service';
import { InstitutionsService } from '../../../services/institutions.service';

@Component({
  selector: 'web-messenger-institution-details',
  templateUrl: './institution-details.component.html',
  styleUrls: ['./institution-details.component.scss'],
})

export class InstitutionDetailsComponent implements OnInit,OnChanges {
  @Input() institutionID='';
  public institution!: Institution;
  public integrations: DashboardIntegration[] = [];
  public backtoInstitutionMainPage:string = ""; 

  constructor(
    private route: ActivatedRoute,
    private InstitutionService: InstitutionsService,
    public navigateSvc: AppNavigationService,
  ) {
  }
  ngOnInit(): void {
    this.backtoInstitutionMainPage = `/institution/${this.institutionID}`;
  }

  ngOnChanges(): void{
    this.fetchInstitutionDetails();
    this.fetchInstitutionIntegrations();
  }

  public fetchInstitutionDetails(): void {
    this.InstitutionService.getInstitutionDetails(this.institutionID).subscribe(
      (data: InstitutionResponse) => { 
        this.institution = data.institution;
      }
    );
  }

  public fetchInstitutionIntegrations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.InstitutionService.getIntegrationsByInstitution(this.institutionID).pipe(
        map((data: DashboardIntegration[]) => {
          this.integrations = data;
          return data;
        })
      ).subscribe(
        (data) => {
          resolve(data);
        }
      );
    });
  }

  public navigateBackToInstSearch():void{
    this.navigateSvc.navigate(['/institution/search']);
  }
}
