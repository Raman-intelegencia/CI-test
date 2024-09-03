import { Institution } from '@amsconnect/shared';
import { Integration } from '../../../../../models/integration.model';
import { IntegrationWizardType } from '../integration-wizard.component';
import { IntegrationWizardUserViewModel } from './user-view-model';
import { IntegrationWizardServiceViewModel } from './service-view-model';

export interface IntegrationWizardViewModel {
  load(): Promise<void>;

  canSave(): boolean;
}

export class MainIntegrationWizardViewModel {
    public institution?: Institution;
    public integration?: Integration;
    public wizardType!: IntegrationWizardType;

    public userVM?: IntegrationWizardUserViewModel;
    public serviceVM?: IntegrationWizardServiceViewModel;

    get unmatchedEntityCount(): number | undefined {
        return [
            this.userVM?.unmatchedUsersAms.length,
            this.userVM?.unmatchedUsersVendor.length,
            this.serviceVM?.unmatchedServicesAms.length,
            this.serviceVM?.unmatchedServicesVendor.length
        ].reduce((prev, curr) => (prev ?? 0) + (curr ?? 0), 0);
    }

    public get institutionId(): string | undefined {
        return this.institution?.id;
    }

    public get integrationId(): number | undefined {
        return this.integration?.id;
    }

    public get vendorType(): string | undefined {
        return this.integration?.vendorType;
    }
}