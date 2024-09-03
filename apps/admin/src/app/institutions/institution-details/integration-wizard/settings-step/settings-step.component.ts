import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VendorCredentialsResponse } from 'apps/admin/src/modals/institutions.model';
import {
    CredentialsState,
    Integration,
    VendorCredentialsRequest,
    IntegrationVendorType
} from 'apps/admin/src/models/integration.model';
import { InstitutionsService } from 'apps/admin/src/services/institutions.service';
import { IntegrationWizardChildComponent, IntegrationWizardType } from '../integration-wizard.component';
import { IntegrationWizardSettingsViewModel } from '../view-models/settings-view-model';
import { firstValueFrom } from 'rxjs';
import { AppNavigationService } from '../../../../../services/app-navigation.service';

export enum SettingsOUOptions {
    Selected, All, None
}
@Component({
    selector: 'web-messenger-integration-wizard-settings-step',
    templateUrl: './settings-step.component.html',
})
export class SettingsStepComponent implements OnInit, OnDestroy, IntegrationWizardChildComponent {
    @Input({required: true}) settingsViewModel!: IntegrationWizardSettingsViewModel;
    @Input({required: true}) wizardType!: IntegrationWizardType
    @Input({required: true}) onCreateIntegration!: (integration: Integration) => void;
    @Input() updateCompanyName!: (name?: string) => void;

    public showConfirmPrompt = false;
    public showDeleteIntegrationConfirmationPrompt = false;
    public showShouldDeleteModal = false;

    public wizardTypeEnum: typeof IntegrationWizardType = IntegrationWizardType;
    public ouOptions: typeof SettingsOUOptions = SettingsOUOptions;
    protected readonly CredentialsState = CredentialsState;
    protected readonly IntegrationVendorType = IntegrationVendorType;

    constructor(private InstitutionService: InstitutionsService, private appNavigationService: AppNavigationService) { }

    async ngOnInit(): Promise<void> {
        await this.settingsViewModel.load();
    }

    ngOnDestroy() {
        this.settingsViewModel.savedFormState = this.settingsViewModel.integrationForm.value
    }

    canNavigateNext(): boolean {
        return this.settingsViewModel.canSave();
    }

    canNavigatePrevious(): boolean {
        return false;
    }

    canSave(): boolean {
        return this.settingsViewModel.canSave();
    }

    public get hasCreated() {
        return !!this.settingsViewModel.mainVM.integration?.id
    }

    public set isProcessingCredentials(value: boolean) {
        if (value) {
            this.settingsViewModel.integrationForm.get('username')?.disable();
            this.settingsViewModel.integrationForm.get('password')?.disable();
        } else {
            this.settingsViewModel.integrationForm.get('username')?.enable();
            this.settingsViewModel.integrationForm.get('password')?.enable();
        }
    }

    public tryEditCredentials() {
        if (this.settingsViewModel.vendorType === IntegrationVendorType.Amion) {
            this.showShouldDeleteModal = true;
            return;
        }

        this.showConfirmPrompt = true;
    }

    public async getUnmatchedEntities(): Promise<void> {
        const institutionId = this.settingsViewModel.mainVM.institutionId;
        const integrationId = this.settingsViewModel.mainVM.integrationId;
        if (typeof(institutionId) !== 'string' || typeof(integrationId) !== 'number') {
            return;
        }

        this.InstitutionService.getIntegrationUnmatchedZipFile(institutionId, integrationId);
    }

    public async onSubmit(): Promise<boolean> {
        const result = await this.settingsViewModel.save();
        return true;
    }

    public async onLinkToAccount(): Promise<void> {
        const institutionId = this.settingsViewModel.mainVM.institutionId;
        if (this.settingsViewModel.vendorType === null || !institutionId) {
            return;
        }

        const credentials: VendorCredentialsRequest = {
            username: this.settingsViewModel.integrationForm.get("username")?.value,
            password: this.settingsViewModel.integrationForm.get("password")?.value,
            host: this.settingsViewModel.vendorType === IntegrationVendorType.AmTelco ? this.settingsViewModel.integrationForm.get("host")?.value : undefined,
            vendorType: this.settingsViewModel.vendorType
        }
        
        if (credentials.vendorType === IntegrationVendorType.Amion) {
            credentials.username = "";
        }
        
        this.isProcessingCredentials = true;
        
        const data = await firstValueFrom(this.InstitutionService.validateCredentials(
            institutionId, credentials
        ));

        this.isProcessingCredentials = false;

        if ('status' in data && data.status === "error" || !('companyName' in data)) {
            this.settingsViewModel.hasValidCredentials = CredentialsState.BadCredentials;

            if (data.message === "CannotChangeVendorOrganization") {
                this.showShouldDeleteModal = true;
            }
            return;
        }

        if (this.wizardType === IntegrationWizardType.FIRST_TIME) {
            this.settingsViewModel.hasValidCredentials = CredentialsState.Success;
            this.settingsViewModel.validCredentialsResponse.companyName = data.companyName;
            this.updateCompanyName(data.companyName);

            return;
        }

        const integrationId = this.settingsViewModel.mainVM.integrationId;

        if (integrationId === undefined) {
            return;
        }
        
        // since we are updating an existing integration, go ahead and update the credentials
        const updateResponse = await firstValueFrom(this.InstitutionService.updateIntegrationCredentials(institutionId, credentials, integrationId));

        if (updateResponse.status !== "ok") {
            this.settingsViewModel.hasValidCredentials = CredentialsState.BadOrganization;

            if (updateResponse.message === "CannotChangeVendorOrganization") {
                this.showShouldDeleteModal = true;
            }

            return;
        }

        this.settingsViewModel.hasValidCredentials = CredentialsState.Success;
        this.settingsViewModel.validCredentialsResponse.companyName = data.companyName;
        this.updateCompanyName(data.companyName);
    }

    public onDeleteIntegration = async (): Promise<void> => {
        if (!this.settingsViewModel.mainVM.institutionId || !this.settingsViewModel.mainVM.integrationId) {
            console.error("Missing institution or integration");
            return;
        }

        const { status } = await firstValueFrom(this.InstitutionService.deleteIntegration(this.settingsViewModel.mainVM.institutionId, this.settingsViewModel.mainVM.integrationId));
        if (status === "ok") {
            await this.appNavigationService.navigate(["institution", this.settingsViewModel.mainVM.institutionId])
        }
    }
}
