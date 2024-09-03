import { BreadcrumbItem } from '@amsconnect/shared';
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InstitutionResponse } from 'apps/admin/src/modals/institutions.model';
import { Integration, IntegrationVendorType, IntegrationWizardSteps, getNextStep, getPreviousStep } from 'apps/admin/src/models/integration.model';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { Subject, firstValueFrom } from 'rxjs';
import { IntegrationWizardServiceSelectionViewModel } from './match-services-step/match-services-step.component';
import { IntegrationWizardUserSelectionViewModel } from './match-users-step/match-users-step.component';
import { MainIntegrationWizardViewModel } from './view-models/main-view-model';
import { IntegrationWizardServiceViewModel } from './view-models/service-view-model';
import { IntegrationWizardSettingsViewModel } from './view-models/settings-view-model';
import { IntegrationWizardUserViewModel } from './view-models/user-view-model';

export interface IntegrationWizardChildComponent {
  canNavigateNext(): boolean;
  canNavigatePrevious(): boolean;
  canSave(): boolean;
}

export enum IntegrationWizardType {
  FIRST_TIME = "firstTime",
  RECONFIGURE = "reconfigure"
}
@Component({
  selector: 'web-messenger-integration-wizard',
  templateUrl: './integration-wizard.component.html',
  styleUrls: ['./integration-wizard.component.scss']
})
export class IntegrationWizardComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private location: Location, private InstitutionService: InstitutionsService, private fb: FormBuilder) {
    this.route.params.subscribe(params => {
      this.institutionId = params['institutionID'];
    });

    const urlPaths = this.route.snapshot.url;
    this.mainVM.wizardType = IntegrationWizardType.FIRST_TIME;

    if (urlPaths.find(p => p.path === "update-integration")) {
      this.mainVM.wizardType = IntegrationWizardType.RECONFIGURE;
      this.currentStep = IntegrationWizardSteps.MATCH_USERS;
      this.integrationId = urlPaths.slice(-1)?.[0].path;
    }
  }

  async ngOnInit(): Promise<void> {
    const institutionData = await firstValueFrom(this.InstitutionService.getInstitutionDetails(this.institutionId));
    this.mainVM.institution = institutionData.institution;

    if (this.integrationId && parseInt(this.integrationId)) {
      this.InstitutionService.getIntegration(this.institutionId, parseInt(this.integrationId)).subscribe(
        (data) => {
          this.mainVM.integration = data.integration;

          // Redirect to the parent institution route if the user has navigated here manually and is in the child institution
          if (this.mainVM.wizardType == this.wizardTypeEnum.RECONFIGURE && this.institutionId != this.mainVM.integration.institutionId) {
            this.router.navigate(["institution", this.mainVM.integration.institutionId, "update-integration", this.integrationId], { replaceUrl: true });
          }

          // kicks off loading for these two, but doesn't wait completion
          this.usersVM.load();
          this.servicesVM.load();
        }
      );
    }
  }

  @ViewChild('activeChild') set _activeChild(child: IntegrationWizardChildComponent) {
      // setTimeout needed to fix NG0100 change detection error
      setTimeout(() => {
        this.childComponent = child;
      }, 0);
  };

  public onCreateIntegration = (integration: Integration): void => {
    this.mainVM.integration = integration;
    const url = this.router.createUrlTree(['../update-integration', integration.id], { relativeTo: this.route }).toString()
    this.location.go(url);

    if (integration.vendorType === IntegrationVendorType.AmTelco && !this.settingsVM.amtelcoViewModel.directoryList) {
      this.currentStep = IntegrationWizardSteps.SETTINGS;
    } else {
      this.currentStep = IntegrationWizardSteps.MATCH_USERS;
    }
  };

  public integrationId?: string;
  public institutionId: string = "";
  public companyName?: string;

  public mainVM = new MainIntegrationWizardViewModel();
  public usersVM = new IntegrationWizardUserViewModel(this.InstitutionService, this.mainVM);
  public servicesVM = new IntegrationWizardServiceViewModel(this.InstitutionService, this.mainVM);
  public settingsVM = new IntegrationWizardSettingsViewModel(this.fb, this.InstitutionService, this.mainVM, this.onCreateIntegration);
  public userSelectionVM = new IntegrationWizardUserSelectionViewModel(this.institutionId);
  public serviceSelectionVM = new IntegrationWizardServiceSelectionViewModel(this.institutionId);

  public childComponent?: IntegrationWizardChildComponent;

  public wizardTypeEnum: typeof IntegrationWizardType = IntegrationWizardType;
  public currentStepEnum: typeof IntegrationWizardSteps = IntegrationWizardSteps;
  public currentStep: string = IntegrationWizardSteps.SETTINGS;

  public showNavguardModal: boolean = false;
  public canOverrideDeactivate: boolean = false;
  public shouldNavigate: Subject<boolean> = new Subject<boolean>();

  public get unmatchedUsersCount(): number {
    return this.usersVM.unmatchedUsersAms.length + this.usersVM.unmatchedUsersVendor.length;
  };

  public get unmatchedServiceTeamsCount(): number {
    return this.servicesVM.unmatchedServicesAms.length + this.servicesVM.unmatchedServicesVendor.length;
  };
  
  public get matchedUsersCount(): number {
    return this.usersVM.matchedUsers.length * 2;
  };
  
  public get matchedServiceTeamsCount(): number {
    return this.servicesVM.matchedServices.length * 2;
  }

  async confirmDeactivate(): Promise<boolean> { return await this.getNavigationResponse(); }

  getNavigationResponse(): Promise<boolean> {
    return new Promise((resolve, _) => {
      this.showNavguardModal = true;
      const subscription = this.shouldNavigate
        .subscribe(result => {
          resolve(result);
          this.showNavguardModal = false;
          subscription.unsubscribe();
        });
    });
  }

  canDeactivate(): boolean {
    // This will be set true if discard/save options are selected
    // within the integration wizard. The user has already made their intention clear in that case.
    if (this.canOverrideDeactivate) {
      return true;
    }

    switch (this.currentStep) {
      case IntegrationWizardSteps.SETTINGS:
        return !this.settingsVM.hasChanged && !this.settingsVM.isUpdatingCredentials;
      case IntegrationWizardSteps.MATCH_USERS:
        return !this.usersVM.getHasChanged();
      case IntegrationWizardSteps.MATCH_TEAMS:
        return !this.servicesVM.getHasChanged();
      case IntegrationWizardSteps.DONE:
        return true;
      default:
        break;
    }

    return false;
  }

  public getUnmatchedAmsCount(currentStep: string): number {
    switch (currentStep) {
      case IntegrationWizardSteps.MATCH_TEAMS:
        return this.servicesVM.unmatchedServicesAms.length;
      case IntegrationWizardSteps.MATCH_USERS:
        return this.usersVM.unmatchedUsersAms.length;
      default:
        throw new Error('Invalid step passed to getUnmatchedAmsCount.');
    }
  }

  public getUnmatchedVendorCount(currentStep: string): number {
    switch (currentStep) {
      case IntegrationWizardSteps.MATCH_TEAMS:
        return this.servicesVM.unmatchedServicesVendor.length;
      case IntegrationWizardSteps.MATCH_USERS:
        return this.usersVM.unmatchedUsersVendor.length;
      default:
        throw new Error('Invalid step passed to getUnmatchedVendorCount.');
    }
  };

  private canActivateStep = () => {
    const hasIntegration = !!this.mainVM.integration?.id;
    if (!hasIntegration) { return false; }

    if (!this.childComponent) { return false; }

    return this.currentStep === IntegrationWizardSteps.SETTINGS ? this.childComponent.canSave() : true;
  }

  public tryUpdateTab = async (step: BreadcrumbItem): Promise<void> => {
    if (this.currentStep === IntegrationWizardSteps.SETTINGS && !this.childComponent?.canSave()) {
      this.settingsVM.integrationForm.get('password')?.markAsDirty();
      return Promise.resolve();
    }

    const result = step.canActivate?.();
    if (result !== false) {
      step.save(this.currentStep).catch(err => console.error(err));
      this.currentStep = step.name;
    }
  }

  public allSteps: BreadcrumbItem[] = [{
    name: IntegrationWizardSteps.SETTINGS,
    displayText: "integrationWizard.buttons.settings",
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep)
  },
  {
    name: IntegrationWizardSteps.MATCH_USERS,
    displayText: "integrationWizard.buttons.matchUsers",
    canActivate: this.canActivateStep,
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep)
  },
  {
    name: IntegrationWizardSteps.MATCH_TEAMS,
    displayText: "integrationWizard.buttons.matchTeams",
    canActivate: this.canActivateStep,
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep)
  },
  {
    name: IntegrationWizardSteps.DONE,
    displayText: "integrationWizard.buttons.done",
    canActivate: this.canActivateStep,
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep)
  }];

  public updateSteps: BreadcrumbItem[] = [
  {
    name: IntegrationWizardSteps.MATCH_USERS,
    displayText: "integrationWizard.buttons.updateMatchUsers",
    canActivate: this.canActivateStep,
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep),
  },
  {
    name: IntegrationWizardSteps.MATCH_TEAMS,
    displayText: "integrationWizard.buttons.updateMatchTeams",
    canActivate: this.canActivateStep,
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep)
  },
  {
    name: IntegrationWizardSteps.SETTINGS,
    displayText: "integrationWizard.buttons.updateSettings",
    canActivate: () => true,
    save: async (saveFromStep: string) => await this.saveAndWait(saveFromStep)
  }];

  public updateCompanyName = (name?: string) => {
    this.companyName = name;
  }

  public shouldDisablePrevious = (): boolean => {
    return getPreviousStep(this.currentStep) === null || !this.childComponent?.canNavigatePrevious();
  }

  public shouldDisableNext = (): boolean => {
    return getNextStep(this.currentStep) === null || !this.childComponent?.canNavigateNext();
  }

  public shouldDisableSave = (): boolean => {
    return !this.childComponent?.canSave();
  }

  public closeWizard = () => {
    this.canOverrideDeactivate = true;
    if (isNaN(Number(this.route.snapshot.url.at(-1)?.path))) {
      this.router.navigate(["../"], { relativeTo: this.route });
    } else {
      this.router.navigate(["../.."], { relativeTo: this.route });
    }
  }

  public saveAndClose = async () => {
    const result = await this.saveAndWait(this.currentStep);

    if (result !== false) {
      this.closeWizard();
    }
  }

  private saveAndWait = async (savedStep: string) => {
    switch (savedStep) {
      case IntegrationWizardSteps.SETTINGS:
        return await this.settingsVM.save();
      case IntegrationWizardSteps.MATCH_USERS:
        return await this.usersVM.save();
      case IntegrationWizardSteps.MATCH_TEAMS:
        return await this.servicesVM.save();
      case IntegrationWizardSteps.DONE:
        return await Promise.resolve();
    }
  }

  public navigateToNext = async (step: string) => {
    const _ = await this.saveAndWait(this.currentStep);
    this.currentStep = getNextStep(step) ?? this.currentStep;
  }

  public navigateToPrevious = async (step: string) => {
    const _ = await this.saveAndWait(this.currentStep);
    this.currentStep = getPreviousStep(step) ?? this.currentStep;
  }
}
