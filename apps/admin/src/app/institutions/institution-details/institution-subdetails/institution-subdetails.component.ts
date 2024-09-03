import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { InstitutionsConfigService } from 'apps/admin/src/services/institutionsConfig.service';
import { ActivatedRoute, Router } from "@angular/router";
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { InstitutionHelperService } from "apps/admin/src/services/institution-helper.service";
import { Institution, RolesData,WowoFeature,CheckboxOption,WowoFeaturesData} from "apps/admin/src/modals/institutions.model";
import { CustomTitles,UpdateInstitutionResponse,status,timeoutConfigCheck,InstitutionResponse,EditInstitutionResponse, AuthService, access_group_actions_map, UsersAuthResponse } from '@amsconnect/shared';
import { Subscription } from 'rxjs';
import { AppNavigationService } from '../../../../services/app-navigation.service';

@Component({
  selector: 'web-messenger-institution-subdetails',
  templateUrl: './institution-subdetails.component.html',
  styleUrls: ['./institution-subdetails.component.scss'],
})
export class InstitutionSubdetailsComponent implements OnInit {
  @Input() institution!: Institution;
  public CheckboxOptionsArray: CheckboxOption[] = [];
  public active_status = 'configureUser';
  public showCheckboxModal = false;
  public dynamicModalTitle = '';
  public payload = '';
  public modalTitle = '';
  public valueInParentComponent = '';
  public booleanFlags = {
    isSemEditing: false,
    isWebEditing: false,
    isMobileEditing: false,
    isMessageEditing: false,
  };
  public webtimeoutValue = 'not set';
  public messageRetention = 'not set';
  public mobiletimeoutValue = 'not set';
  public semLimit = 'not set';
  public editedWebtimeoutValue = '';
  public editedMobiletimeoutValue = '';
  public editedSemlimit = '';
  public editedmessageRetention = '';
  public ssoStatus = 'Not Set';
  public customSpecialtie = 'not specialities';
  public customTitle = 'No title';
  public wowoFeaturesData!: WowoFeaturesData;
  public updatedValues: any = {};
  public institutionId!: string;
  public isCustomTitleModal = false;
  public enableServiceModalTitle = true;
  public ServiceTeamModalTitle = '';
  public serviceTeamResptags!: string[];
  public timeoutConfigCheck = timeoutConfigCheck;
  public overrideModal = false;
  public wowoFeatureDatas!: { [key: string]: WowoFeature };
  public wowos: string[] = [];
  private showSuccessResp=false;
  public successServiceTeamSpecialties!: string[];
  public successServiceTeamTags!: string[];
  public successServiceTeamTitles!: string[];
  public authSubscription = new Subscription;
  public getALLCurrentUserPermissionList!:access_group_actions_map;
  constructor(
    private route: ActivatedRoute,
    private InstitutionService: InstitutionsService,
    private InstitutionSrv: InstitutionsConfigService,
    private InstitutionHelper: InstitutionHelperService,
    private router: Router,
    public authService: AuthService,
    public destroySub: DestroyRef,
    public navigateSvc: AppNavigationService,
  ) {
    this.route.params.subscribe((params) => {
      this.institutionId = params['institutionID']; // Fetching the institution ID from route params
    });
    this.destroySub.onDestroy(() => {
      this.authSubscription.unsubscribe();
    });
  }
  
  ngOnInit(): void {
    this.authSubscription = this.authService.authResponseData$.subscribe((response:UsersAuthResponse) => {
      this.getALLCurrentUserPermissionList = response.user?.access_group_actions_map;
    })    
  }
 
  ngOnChanges() {
    this.webtimeoutValue = this.institution?.web_timeout_minutes.toString();
    this.mobiletimeoutValue = this.institution?.mobile_timeout_minutes.toString();
    this.messageRetention = this.institution?.retention_days.toString();
    this.semLimit=this.institution?.sem_hours.toString()
  }
  
  public getValueAsString(value: number): string {
    return value === 0 ? 'Not Set' : value?.toString();
  }

  public startEditing(type: string): void {
    switch (type) {
      case 'webTimeout':
        this.booleanFlags.isWebEditing = true;
        this.editedWebtimeoutValue = this.webtimeoutValue;
        break;

      case 'mobiletimeoutValue':
        this.booleanFlags.isMobileEditing = true;
        this.editedMobiletimeoutValue = this.mobiletimeoutValue;
        break;

      case 'messageRetention':
        this.booleanFlags.isMessageEditing = true;
        this.editedmessageRetention = this.messageRetention;
        break;

      case 'semlimit':
        this.booleanFlags.isSemEditing = true;
        this.editedSemlimit = this.semLimit;
        break;
    }
  }
  public saveChangesSettime(type: string): void {
    this.updatedValues = {};
    let updatedValue = '';
    switch (type) {
      case 'web_timeout_minutes':
        if (this.editedWebtimeoutValue ===null) {
          this.editedWebtimeoutValue = this.webtimeoutValue;
        } else {
          this.webtimeoutValue = this.editedWebtimeoutValue.toString();
          updatedValue = this.webtimeoutValue;
        }
        this.booleanFlags.isWebEditing = false;
        break;

      case 'mobile_timeout_minutes':
        if (this.editedMobiletimeoutValue === '') {
          this.editedMobiletimeoutValue = this.mobiletimeoutValue;
        } else {
          this.mobiletimeoutValue = this.editedMobiletimeoutValue.toString();
          updatedValue = this.mobiletimeoutValue;
        }
        this.booleanFlags.isMobileEditing = false;
        break;

      case 'retention_days':
        if (this.editedmessageRetention === '') {
          this.editedmessageRetention = this.messageRetention;
        } else {
          this.messageRetention = this.editedmessageRetention.toString();
          updatedValue = this.messageRetention;
        }
        this.booleanFlags.isMessageEditing = false;
        break;

      case 'sem_hours':
        if (this.editedSemlimit === '') {
          this.editedSemlimit = this.semLimit;
        } else {
          const editedValue = parseInt(this.editedSemlimit);
          updatedValue = (editedValue > 72 || editedValue < 24) ? this.editedSemlimit.toString() : (this.semLimit = this.editedSemlimit, this.semLimit.toString()); 
        }
        this.booleanFlags.isSemEditing = false;
        break;
    }
    if (updatedValue !== '') {
      this.updatedValues[type] = updatedValue;
      this.InstitutionService.updateInstitutionDetails(
        this.institutionId,
        this.updatedValues
      ).subscribe();
    } else {
      this.updatedValues = {};
    }
  }

  public changeTab(tabname: string): void {
    this.active_status = tabname;
  }

  public open_Modal(data: string):void {
    const modalInfo = this.InstitutionHelper.openModal(data, this.institution);
    if (modalInfo) {
      this.dynamicModalTitle = modalInfo.dynamicModalTitle;
      this.showCheckboxModal = modalInfo.showModal;
      this.CheckboxOptionsArray = modalInfo.CheckboxOptionsArray;
      this.payload = modalInfo.postData;
      this.overrideModal =
        this.dynamicModalTitle !== 'Edit Institution Features';
    }
  }

  public closeCheckboxModal(value: boolean):void {
    this.showCheckboxModal = value;
  }

  public isreportingTags(data: boolean): void {
    this.isCustomTitleModal = data;
  }

  public openCustomTitleModal(data: string): void {
    this.isCustomTitleModal = true;
    switch (data) {
      case 'specialties':
        this.ServiceTeamModalTitle = 'Edit specialties';
        this.serviceTeamResptags = this.showSuccessResp ?this.successServiceTeamSpecialties : this.institution.specialties ;
        break;
      case 'titles':
        this.ServiceTeamModalTitle = 'Edit titles';
        this.serviceTeamResptags = this.showSuccessResp ?this.successServiceTeamTitles : this.institution.titles;

        break;

      case 'tags':
        this.ServiceTeamModalTitle = 'Edit Reporting tags';
        this.serviceTeamResptags = this.showSuccessResp ?this.successServiceTeamTags : this.institution.tags;
        break;
    }
  }

  public updatedOverride(value: string):void {
    const check = JSON.parse(value);
    if ('lock Institute' in check) {
      this.toggleInstituteLock(value);
    } else {
      const data = {
        instituteId: this.institutionId,
        json: { value },
      };
      this.InstitutionSrv.updateFeature(data).subscribe((responseData: EditInstitutionResponse)=>{
        this.handleUpdateFeatureSubscription(responseData);
      });
    }
  }

  public handleUpdateFeatureSubscription(updatedFeature: EditInstitutionResponse): void {
    this.institution = updatedFeature.institution;
  }


  public onSaveTitles(values: CustomTitles): void {
    this.showSuccessResp=true;
    this.isCustomTitleModal = false;
    this.InstitutionService.updatesInstitutionsCustomTitles(
      this.institution.id,
      values
    ).subscribe((data:EditInstitutionResponse) => {
      this.successServiceTeamSpecialties=data.institution.specialties; 
      this.successServiceTeamTags=data.institution.tags; 
      this.successServiceTeamTitles=data.institution.titles;
      this.institution.titles= this.showSuccessResp ?this.successServiceTeamTitles : this.institution.titles;
      this.institution.tags= this.showSuccessResp ?this.successServiceTeamTags : this.institution.tags;
      this.institution.specialties= this.showSuccessResp ?this.successServiceTeamSpecialties : this.institution.specialties;
    });
  }

  public navigateToPage(type: string): void {
    if (type === 'sso')
      this.navigateSvc.navigate([
        `institution/${this.institutionId}/sso_configuration`,
      ]);
  }

  public toggleInstituteLock(value: string): void {
    const check = JSON.parse(value);
    const isLocked = check['lock Institute'];
    const action = isLocked ? 'lock' : 'unlock';
    const data = {
      instituteId: this.institutionId,
      json: action,
    };
    this.InstitutionSrv.lockInstitution(data).subscribe();
  }

  public openSSOPage(): void{
    this.navigateSvc.navigate([
      `institution/${this.institutionId}/sso_configuration`,
    ]);
  }

  public navigateToPath(path:string):void{
    this.navigateSvc.navigate([`/institution/${path}`]);
  }
}
