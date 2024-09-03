import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { VendorCredentialsResponse } from '../../../../../modals/institutions.model';
import {
  CredentialsState,
  Integration,
  IntegrationTimeUnits,
  IntegrationVendorType,
  ModifyIntegrationDTO,
  VendorCredentials
} from '../../../../../models/integration.model';
import { InstitutionsService } from '../../../../../services/institutions.service';
import { IntegrationWizardType } from '../integration-wizard.component';
import { SettingsOUOptions } from '../settings-step/settings-step.component';
import { AmtelcoViewModel } from './amtelco-view-model';
import { IntegrationWizardViewModel, MainIntegrationWizardViewModel } from './main-view-model';

export class IntegrationWizardSettingsViewModel implements IntegrationWizardViewModel {
  public amtelcoViewModel: AmtelcoViewModel;

  public constructor(
    public fb: FormBuilder,
    private institutionsService: InstitutionsService,
    public mainVM: MainIntegrationWizardViewModel,
    public onCreateIntegration: (integration: Integration) => void
  ) {
    this.integrationForm = fb.group({
      credentialState: [CredentialsState.Undefined, this.validateCredentialState],
      username: ['', this.validateUsernameRequired],
      password: ['', this.validatePasswordRequired],
      vendorType: ['', Validators.required],
      childOuType: ['', Validators.required],
      scheduleControl: fb.group({
        pollingPeriod: 1,
        pollingUnit: ['', Validators.required],
        scanPeriod: 1,
        scanUnit: ['', Validators.required]
      }, {
        validators: [IntegrationWizardSettingsViewModel.validatePollingData]
      }),
      columnControl: fb.group({})
    });
    
    this.amtelcoViewModel = new AmtelcoViewModel(
      fb, institutionsService, mainVM, this, this.integrationForm
    );

    this.integrationForm.addControl('host', new FormControl('', this.amtelcoViewModel.validateRequiredAmTelco));

    this.validCredentialsResponse = {};

    // resets credentials on vendorType change
    this.integrationForm.get("vendorType")?.valueChanges.subscribe(value => {
      this.integrationForm.get("username")?.reset(null, { onlySelf: true, emitEvent: false });
      this.integrationForm.get("password")?.reset(null, { onlySelf: true, emitEvent: false });
      this.hasValidCredentials = CredentialsState.Undefined;
    })
  }

  public load = async (): Promise<void> => {
    if (this.alreadyLoaded) {
      return;
    }

    const integrationEnums = await firstValueFrom(this.institutionsService.getIntegrationTypes());
    this.timeUnits = integrationEnums.timeUnits;
    if (this.timeUnits?.scanUnits.length === 1) {
      this.integrationForm.get('scheduleControl.scanUnit')?.setValue(this.timeUnits?.scanUnits[0]);
    }
    this.allTypes = integrationEnums.vendorTypes;

    if (this.savedFormState) {
      this.integrationForm = new FormGroup(this.savedFormState);
    }

    this.integrationForm.get('childOuType')?.valueChanges.subscribe(value => {
      const childOrganizations = this.integrationForm.get('childOrganizations') as FormGroup;
      if (value !== SettingsOUOptions.Selected) {
        childOrganizations?.disable();
      } else {
        childOrganizations?.enable();
      }

      if (value === SettingsOUOptions.All || value === SettingsOUOptions.None) {
        Object.values(childOrganizations?.controls)?.map((x) => {
          x.setValue(value === SettingsOUOptions.All);
        });
      }
    });

    const group = this.fb.group({});

    this.mainVM.institution?.child_institutions.forEach(child_institution => {
      if (!child_institution?.id) {
        return;
      }
      group.addControl(child_institution?.id, this.fb.control(false));
      this.institutionMap[child_institution?.id] = child_institution?.name;
    });
    this.integrationForm.addControl('childOrganizations', group);
    this.integrationForm.get('childOrganizations')?.disable();

    if (this.mainVM.integration) {
      this.integrationForm.get('scheduleControl.pollingUnit')?.setValue(this.mainVM.integration.pollingUnit);
      this.integrationForm.get('scheduleControl.pollingPeriod')?.setValue(this.mainVM.integration.pollingPeriod);
      this.integrationForm.get('scheduleControl.scanUnit')?.setValue(this.mainVM.integration.scanUnit);
      this.integrationForm.get('scheduleControl.scanPeriod')?.setValue(this.mainVM.integration.scanPeriod);

      this.integrationForm.get('vendorType')?.setValue(this.mainVM.integration?.vendorType);

      if (this.mainVM.integration.vendorType === IntegrationVendorType.AmTelco) {
        await this.amtelcoViewModel.loadAmTelcoData();
      }

      const childOusIntegration = this.mainVM.institution?.child_institutions;
      const childOusSelected = this.mainVM.integration.childOrganizations;

      if (childOusSelected === undefined || childOusSelected.length === 0) {
        this.integrationForm.get('childOuType')?.setValue(SettingsOUOptions.None);
      } else if (childOusSelected.length === childOusIntegration?.length) {
        this.integrationForm.get('childOuType')?.setValue(SettingsOUOptions.All);
      } else {
        this.integrationForm.get('childOuType')?.setValue(SettingsOUOptions.Selected);
      }
      this.mainVM.integration.childOrganizations?.forEach(ou => {
        group.get(ou)?.setValue(true);
      });
    }

    this.alreadyLoaded = true;
  };

  public institutionMap: { [key: string]: string } = {};

  private alreadyLoaded = false;
  public isUpdatingCredentials = false;

  public allTypes: string[] = [];
  public timeUnits?: IntegrationTimeUnits;
  public validCredentialsResponse: VendorCredentialsResponse;

  public savedFormState?: unknown;
  public integrationForm: FormGroup;

  public get hasChanged(): boolean {
    return this.integrationForm.dirty || this.amtelcoViewModel.nameCheckboxHasChanged;
  }

  public set hasValidCredentials(credentialState: CredentialsState) {
    this.integrationForm?.get('credentialState')?.setValue(credentialState);
  }

  public get hasValidCredentials(): CredentialsState {
    return this.integrationForm?.get('credentialState')?.value ?? CredentialsState.Undefined;
  }

  public canSave(): boolean {
    return !this.integrationForm.invalid;
  }

  public setUpdatingIntegrations(): void {
    this.isUpdatingCredentials = true;
    this.integrationForm.get('credentialState')?.updateValueAndValidity();
    this.integrationForm.get('username')?.updateValueAndValidity();
    this.integrationForm.get('password')?.updateValueAndValidity();
  }

  public get showCredentialError(): boolean {
    if (this.integrationForm.pristine && !this.integrationForm.dirty) {
      return false;
    }

    if (this.integrationForm.get('password')?.invalid) {
      return this.integrationForm.get('password')!.dirty;
    }
    if (this.integrationForm.get('username')?.invalid) {
      return this.integrationForm.get('username')!.dirty;
    }
    return false;
  }

  public async save(): Promise<Integration> {
    if (!this.hasChanged || !this.alreadyLoaded) {
      return Promise.resolve(this.mainVM.integration!);
    }

    try {

      const integrationId = this.mainVM.integration?.id;
      const institutionId = this.mainVM.institution?.id;
  
      const credentials: VendorCredentials = {
        username: this.integrationForm.get('username')?.value,
        password: this.integrationForm.get('password')?.value
      };
  
      const integrationDto: ModifyIntegrationDTO = {
        credentials,
        institutionId: institutionId,
        pollingPeriod: this.scheduleControls.get('pollingPeriod')?.value,
        pollingUnit: this.scheduleControls.get('pollingUnit')?.value,
        scanPeriod: this.scheduleControls.get('scanPeriod')?.value,
        scanUnit: this.scheduleControls.get('scanUnit')?.value,
        vendorType: this.integrationForm.get('vendorType')?.value,
        childOrganizations: this.childOrganizationList,
      };
  
      switch (this.vendorType) {
        case IntegrationVendorType.AmTelco:
          {
            const response = await this.amtelcoViewModel.saveAmTelcoData(integrationDto, integrationId, institutionId);
            if (this.mainVM.wizardType === IntegrationWizardType.FIRST_TIME && integrationId) {
              this.onCreateIntegration(response);
            }
            return response;
          }
        default:
          // if we're creating an integration and we haven't saved it yet..
          if (this.mainVM.wizardType === IntegrationWizardType.FIRST_TIME && !integrationId) {
            const data = await firstValueFrom(this.institutionsService.createIntegration(institutionId!, integrationDto));
            this.onCreateIntegration(data);
            return data;
          } else if (integrationId) {
            // we need to update the existing integration
            const credentialsPresent = !!credentials.password && !!credentials.username;
            if (!this.isUpdatingCredentials || !credentialsPresent) {
              integrationDto.credentials = undefined;
            }
            const data = await firstValueFrom(this.institutionsService.updateIntegration(institutionId!, integrationDto, integrationId));
            this.isUpdatingCredentials = false;
            return data;
          } else {
            throw new Error('Invalid state - integration not created');
          }
      }
    } catch (_) {
      throw new Error("saving integration failed");
    } finally {
      this.integrationForm.markAsPristine();
      this.integrationForm.markAsUntouched();

    }
  }

  public get scheduleControls(): FormGroup {
    return this.integrationForm.get('scheduleControl') as FormGroup;
  }

  public get childOrganizationList(): Array<string> {
    const orgs = this.integrationForm.get('childOrganizations')?.value;
    return Object.keys(orgs).filter(x => orgs[x] === true);
  }

  public get vendorType(): string | null {
    return this.integrationForm?.get('vendorType')?.value;
  }

  // Validators
  public static validatePollingData: ValidatorFn = (control: AbstractControl) => {
    const pollingPeriod = control.get('pollingPeriod'),
      pollingUnit = control.get('pollingUnit'),
      scanPeriod = control.get('scanPeriod');

    const errors: { pollingError?: string, scanError?: string } = {};
    const pollingInt = Number(pollingPeriod?.value),
      scanInt = Number(scanPeriod?.value);

    if (pollingInt.toString() !== String(pollingPeriod?.value)) {
      errors.pollingError = 'Period must be an integer';
    }
    if (scanInt.toString() !== String(scanPeriod?.value)) {
      errors.scanError = 'Period must be an integer';
    }

    if (isNaN(pollingInt) || pollingInt < 1) {
      errors.pollingError = 'Period must be a positive number';
    }
    if (isNaN(scanInt) || scanInt < 1) {
      errors.scanError = 'Period must be a positive number';
    }
    if (pollingUnit?.value === 'Minute' && pollingInt >= 60) {
      errors.pollingError = 'Please use \'hours\' for >= 60 minute intervals.';
    } else if (pollingUnit?.value === 'Hour' && pollingInt >= 24) {
      errors.pollingError = 'Please use \'days\' for >= 24 hour intervals.';
    } else if (pollingUnit?.value === 'Day' && pollingInt >= 29) {
      errors.pollingError = 'Maximum polling value is 28 days.';
    }

    return (errors.pollingError || errors.scanError) ? errors : null;
  };

  public validateUsernameRequired: ValidatorFn = (control: AbstractControl) => {
    if (!this.isUpdatingCredentials && this.mainVM.wizardType === IntegrationWizardType.RECONFIGURE) {
      return null;
    }
    const vendorType = this.vendorType;
    switch (vendorType) {
      case IntegrationVendorType.Amion:
        return null;
      default:
        return Validators.required(control);
    }
  };

  public validatePasswordRequired: ValidatorFn = (control: AbstractControl) => {
    if (!this.isUpdatingCredentials && this.mainVM.wizardType === IntegrationWizardType.RECONFIGURE) {
      return null;
    } else {
      return Validators.required(control);
    }
  };

  public validateCredentialState: ValidatorFn = (control: AbstractControl) => {
    if (!this.isUpdatingCredentials && this.mainVM.wizardType === IntegrationWizardType.RECONFIGURE) {
      return null;
    } else {
      const stateIsValid = control.value === CredentialsState.Success;
      if (this.isUpdatingCredentials || this.mainVM.wizardType === IntegrationWizardType.FIRST_TIME) {
        return stateIsValid ? null : { credentialsNotValid: true };
      }
      return null;
    }
  };
}