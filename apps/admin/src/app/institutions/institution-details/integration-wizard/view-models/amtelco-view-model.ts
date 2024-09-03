import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {
  AmTelcoColumnData,
  AmTelcoConnectionDetails,
  AmTelcoDirectoryDTO,
  AmTelcoDirectoryFieldDTO,
  Integration,
  IntegrationVendorType,
  ModifyIntegrationDTO,
} from '../../../../../models/integration.model';
import {InstitutionsService} from '../../../../../services/institutions.service';
import {IntegrationWizardType} from '../integration-wizard.component';
import {MainIntegrationWizardViewModel} from './main-view-model';
import {IntegrationWizardSettingsViewModel} from './settings-view-model';

export class AmtelcoViewModel {
  public constructor(
    private fb: FormBuilder,
    private institutionsService: InstitutionsService,
    private mainVM: MainIntegrationWizardViewModel,
    private settingsVM: IntegrationWizardSettingsViewModel,
    private integrationForm: FormGroup<any>
  ) {}

  public requestedFieldsList?: string[] = [];

  public directoryList?: AmTelcoDirectoryDTO[];
  public columnsList?: AmTelcoDirectoryFieldDTO[];
  public columnSelectionMap: Map<string, AmTelcoDirectoryFieldDTO | undefined> = new Map<
    string,
    AmTelcoDirectoryFieldDTO
  >();

  public hasLoadedColumns = false;
  public hasLoadedAmTelcoData = false;
  public hasSavedColumnMappingAmTelco = false;

  private _nameCheckboxChangedFuse = false;
  public get nameCheckboxHasChanged(): boolean {
    return this._nameCheckboxChangedFuse;
  }

  private _nameCheckbox = false;
  public get nameCheckbox(): boolean {
    return this._nameCheckbox;
  }

  public set nameCheckbox(value) {
    if (this._nameCheckbox === value) {
      return;
    }

    this._nameCheckboxChangedFuse = true;
    this._nameCheckbox = value;

    if (this.columnSelectionMap.get('lastName')) {
      this.columnSelectionMap.set('lastName', undefined);
      this.columnControls.get('lastName')?.setValue('');
    }
  }

  public get columnControls(): FormGroup {
    return this.integrationForm.get('columnControl') as FormGroup;
  }

  public get vendorType(): unknown {
    return this.integrationForm?.get('vendorType')?.value;
  }

  public get amTelcoColumnData(): AmTelcoColumnData[] | undefined {
    const columnData: AmTelcoColumnData[] = [];
    const firstNameColumn = this.columnSelectionMap.get('firstName');
    if (firstNameColumn) {
      columnData.push({ type: 'UserName', id: firstNameColumn.id });
    }
    const lastNameColumn = this.columnSelectionMap.get('lastName');
    if (lastNameColumn && this.nameCheckbox) {
      // We need to check both because the user may have set a last name column before setting it to 1 name column
      columnData.push({ type: 'UserName', id: lastNameColumn.id });
    }

    this.columnSelectionMap.forEach((item, key) => {
      if (item && key && key !== 'firstName' && key !== 'lastName') {
        columnData.push({ type: key, id: item.id });
      }
    });

    return columnData.length > 0 ? columnData : undefined;
  }

  public loadAmTelcoData = async (): Promise<void> => {
    if (!this.mainVM.integration) {
      return;
    }

    await this.setColumnsAndDirectories();

    this.integrationForm.get('host')?.setValue(this.mainVM.integration.connectionDetails?.host);
    this.integrationForm.get('directoryId')?.setValue(this.mainVM.integration.connectionDetails?.directoryId);
    this.integrationForm.get('host')?.disable();
    
    const directoryId = this.settingsVM.integrationForm.get('directoryId')?.value;
    if (directoryId !== null) {
      this.integrationForm.get('directoryId')?.disable();
    }

    const columns = [...(this.mainVM.integration.connectionDetails?.columnInfo ?? [])];
    const nameFields = columns.filter((col) => col.type === 'UserName');

    columns
      .filter((col) => col.type !== 'UserName')
      .forEach((col) => this.columnControls.get(col.type)?.setValue(col.id));

    if (nameFields.length === 1) {
      const firstNameColumn = nameFields.find(x => x.type === 'UserName');
      this.columnControls.get('firstName')?.setValue(firstNameColumn?.id);
    } else if (nameFields.length === 2) {
      const firstNameColumn = nameFields.find(x => x.type === 'UserName');
      const lastNameColumn = nameFields.find(x => x.type === 'UserName' && x.id != firstNameColumn?.id);

      this.columnControls.get('firstName')?.setValue(firstNameColumn?.id);
      this.columnControls.get('lastName')?.setValue(lastNameColumn?.id);

      this._nameCheckbox = true;
    }
  };

  public saveAmTelcoData = async (
    integrationDto: ModifyIntegrationDTO,
    integrationId?: number,
    institutionId?: string
  ): Promise<Integration> => {
    const amTelcoConnectionDetails: AmTelcoConnectionDetails = {
      host: this.integrationForm.get('host')?.value,
      directoryId: parseInt(this.integrationForm.get('directoryId')?.value),
      columnInfo: this.amTelcoColumnData,
    };

    integrationDto.connectionDetails = amTelcoConnectionDetails;

    if (!integrationId) {
      if (integrationDto.connectionDetails) {
        integrationDto.connectionDetails.directoryId = undefined;
      }
      const data = await firstValueFrom(this.institutionsService.createIntegration(institutionId!, integrationDto));
      await this.onFirstAmTelcoSave(data);
      return data;
    } else if (this.mainVM.wizardType === IntegrationWizardType.FIRST_TIME) {
      // First time, but we have an id, means the user is done mapping columns
      integrationDto.credentials = undefined;
      const data = await firstValueFrom(
        this.institutionsService.updateIntegration(institutionId!, integrationDto, integrationId)
      );
      if (data.id) {
        this.hasSavedColumnMappingAmTelco = true;
        this.integrationForm.get('directoryId')?.disable();
      }
      return data;
    } else {
      // The user is reconfiguring
      const credentialsPresent =
        'password' in (integrationDto.credentials ?? {}) && 'username' in (integrationDto.credentials ?? {});
      if (!this.settingsVM.isUpdatingCredentials || !credentialsPresent) {
        integrationDto.credentials = undefined;
      }
      const data = await firstValueFrom(
        this.institutionsService.updateIntegration(institutionId!, integrationDto, integrationId)
      );
      this.settingsVM.isUpdatingCredentials = false;
      return data;
    }
  };

  private onFirstAmTelcoSave = async (integration: Integration): Promise<void> => {
    this.mainVM.integration = integration;
    await this.setColumnsAndDirectories();
  };

  // used in settings-view-model
  public validateRequiredAmTelco: ValidatorFn = (control: AbstractControl) => {
    const vendorType = this.vendorType;
    if (vendorType === IntegrationVendorType.AmTelco) {
      return Validators.required(control);
    }
    return null;
  };

  private setColumnsAndDirectories = async (): Promise<void> => {
    if (this.hasLoadedAmTelcoData) {
      return;
    }

    this.integrationForm.addControl('directoryId', new FormControl('', this.validateRequiredAmTelcoSecondStep));

    // Listen to changes to the directory selection to reload columns
    this.integrationForm.get('directoryId')?.valueChanges.subscribe(
          async () => {
            await this.onDirectoryChange();
          }
    );
  
    const allFields = (await firstValueFrom(this.institutionsService.getAmTelcoRequestedFields())).fields;

    const fieldsExceptUserName = allFields.filter((x) => x !== 'UserName');

    this.columnControls.addControl('firstName', new FormControl('', this.validateRequiredAmTelcoSecondStep));
    this.columnControls.addControl(
      'lastName',
      new FormControl('', this.validateRequiredAmTelcoSecondStepTwoNames)
    );
    fieldsExceptUserName?.forEach((field) => {
      this.columnControls.addControl(field, new FormControl('none', this.validateRequiredAmTelcoSecondStep));
    });
    
    this.requestedFieldsList = fieldsExceptUserName;

    // Listen to changes to the columns selections, so we know which ones aren't available for selection
    const controlsToListen = ['firstName', 'lastName', ...this.requestedFieldsList];
    
    controlsToListen.forEach(controlName => {
      const control = this.columnControls.get(controlName);
      control?.valueChanges.subscribe((selection: string) =>
        this.onColumnSelectorChange(controlName, parseInt(selection))
      );
    })

    if (this.mainVM.integration?.connectionDetails?.directoryId) {
      await this.loadColumnsList(this.mainVM.integration?.connectionDetails?.directoryId);
    }

    this.hasLoadedAmTelcoData = true;
    this.directoryList = (
      await firstValueFrom(
        this.institutionsService.getAmtelcoDirectories(this.mainVM.institutionId!, this.mainVM.integrationId!)
      )
    ).directories;
  };

  private onColumnSelectorChange = (columnName: string, selection: number): void => {
    const currentSelection = this.columnsList?.filter((x) => x.id === selection)?.at(0);
    if (currentSelection !== undefined) {
      this.columnSelectionMap.set(columnName, currentSelection);
    }
  };

  public loadColumnsList = async (directoryId: number): Promise<void> => {
    this.columnsList = (
      await firstValueFrom(
        this.institutionsService.getAmtelcoDirectoryFields(
          this.mainVM.institutionId!,
          this.mainVM.integrationId!,
          directoryId
        )
      )
    ).fields;
  };

  private validateRequiredAmTelcoSecondStep: ValidatorFn = (control: AbstractControl) => {
    if (this.mainVM.integration?.id) {
      return this.validateRequiredAmTelco(control);
    }
    return null;
  };

  private validateRequiredAmTelcoSecondStepTwoNames: ValidatorFn = (control: AbstractControl) => {
    if (this.nameCheckbox) {
      return this.validateRequiredAmTelcoSecondStep(control);
    }
    return null;
  };

  public get hasMappedColumnsAmTelco(): boolean {
    if (this.settingsVM.vendorType !== IntegrationVendorType.AmTelco) {
      return true;
    }
    return this.hasSavedColumnMappingAmTelco;
  }

  public onDirectoryChange = async (): Promise<void> => {
    this.hasLoadedColumns = false;
    const directoryId = this.settingsVM.integrationForm.get('directoryId')?.value;
    if (directoryId !== null) {
      // Get the new columns list
      await this.loadColumnsList(directoryId);

      // Reset the column selections
      if (this.columnControls.touched) {
        this.columnSelectionMap = new Map();
        this.columnControls.reset();
      }
    }
    this.hasLoadedColumns = true;
  };

  public columnSelectedElsewhere(columnForName: string, selection: number): boolean {
    for (const [key, column] of this.columnSelectionMap) {
      if (column?.id === selection && key !== columnForName) {
        return true;
      }
    }
    return false;
  }
}
