import { firstValueFrom } from 'rxjs';
import {
  IgnoredAmsServiceDTO,
  IgnoredVendorScheduleDTO,
  ServiceMatch,
  SetServiceMatchDTO,
  UpdateServiceMatchesDTO
} from '../../../../../models/integration.model';
import { InstitutionsService } from '../../../../../services/institutions.service';
import { MatchedCardDataTransformable } from '../matched-card-list/matched-card-list.component';
import { IntegrationWizardViewModel, MainIntegrationWizardViewModel } from './main-view-model';
import { AMSConnectService, VendorService } from './card-data-handlers';
import { IntegrationWizardType } from '../integration-wizard.component';

export class IntegrationWizardServiceViewModel implements IntegrationWizardViewModel {

  public unmatchedServicesAms: AMSConnectService[] = [];
  public unmatchedServicesVendor: VendorService[] = [];
  public ignoredAmsServices: AMSConnectService[] = [];
  public ignoredVendorServices: VendorService[] = [];
  private _matchedServices: ServiceMatch[] = []; // Using the setter is REQUIRED when changing to keep matchedServicesForCardData in sync!
  public matchedServicesForCardData: MatchedCardDataTransformable[] = [];

  public lastAutomatchSuggestions?: SetServiceMatchDTO[];

  public set matchedServices(data: ServiceMatch[]) {
    this._matchedServices = data;

    // !! IMPORTANT !!
    // The convention of "ams item first, vendor item second" is vital since they both
    // implement CardDataTransformable. The following function, getMatchFromSelectedMatch,
    // MUST use the same order for this to work.
    this.matchedServicesForCardData = this.matchedServices.map(x => new MatchedCardDataTransformable(x.ams_service, x.vendor_service, x.matchMeta));
  }

  public get matchedServices(): ServiceMatch[] {
    return this._matchedServices;
  }

  public hasBeenFetched = false;
  public isFetching = false;
  public isLoadingAutomatches = false;

  constructor(private institutionsService: InstitutionsService, public mainVM: MainIntegrationWizardViewModel) {
    if (mainVM.serviceVM) {
      throw Error("Service VM already set.");
    }
    mainVM.serviceVM = this;
  }

  public async load(): Promise<void> {
    if (this.hasBeenFetched || this.isFetching) {
      return Promise.resolve();
    }

    this.isFetching = true;

    const data = await firstValueFrom(
      this.institutionsService.getServicesAndMatches(
        this.mainVM.institution!.id, this.mainVM.integration!.id));

    this.hasBeenFetched = true;
    
    this.unmatchedServicesAms = data.unmatched_ams_services.map(u => new AMSConnectService(u));
    this.unmatchedServicesVendor = data.unmatched_vendor_services.map(u => new VendorService(u));
    
    this.ignoredAmsServices = data.ignored_ams_services.map(u => new AMSConnectService(u));
    this.ignoredVendorServices = data.ignored_vendor_services.map(u => new VendorService(u));
    
    this.matchedServices = [...this.matchedServices, ...data.matches.map(m => {
      return {
        ams_service: new AMSConnectService(m.ams_service),
        vendor_service: new VendorService(m.vendor_entity),
        matchMeta: m.matchMeta
      };
    })]
    
    this._lastPayload = this.payload;

    if (this.mainVM.wizardType === IntegrationWizardType.FIRST_TIME) {
      await this.automatchServices();
    }

    this.isFetching = false;
  }

  get payload(): UpdateServiceMatchesDTO {
    const ignoredAmsServices: IgnoredAmsServiceDTO[] = this.ignoredAmsServices.map(x =>
      ({ organizationId: x.service.institution.id, amsServiceTeamId: x.service.id.$oid }));

    const ignoredVendorServices: IgnoredVendorScheduleDTO[] = this.ignoredVendorServices.map(x => ({ vendorEntityId: x.service.id }));
    const matchedServices = this.matchedServices.map(
      x => ({
        organizationId: x.ams_service.service.institution.id,
        amsServiceTeamId: x.ams_service.service.id.$oid,
        vendorEntityId: x.vendor_service.service.id,
        matchMeta: x.matchMeta
      })
    );

    return {
      ignoredAmsServiceTeams: ignoredAmsServices,
      ignoredVendorEntities: ignoredVendorServices,
      matchedServiceTeams: matchedServices,
      unmatchedEntityCount: this.mainVM.unmatchedEntityCount,
      serviceTeamSource: this.mainVM.vendorType
    };
  }

  private _lastPayload?: UpdateServiceMatchesDTO;

  canSave(): boolean {
    return true;
  }

  public getHasChanged(): boolean {
    return this.hasBeenFetched && JSON.stringify(this._lastPayload) !== JSON.stringify(this.payload);
  }

  public async save(): Promise<boolean> {
    if (this.getHasChanged() === false) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this._lastPayload = this.payload;
      this.institutionsService
        .updateIntegrationServiceMatches(this.mainVM.institutionId!, this.mainVM.integrationId!.toString(), this.payload)
        .subscribe(
          {
            next: data => {
                resolve(true)
            },
            error: e => {
                resolve(false);
            }
          }
        );
    });
  }

  public async automatchServices() {
    this.isLoadingAutomatches = true;
    const suggestionResponse = await firstValueFrom(this.institutionsService.getSuggestedServiceMatches(this.mainVM.institution!.id, this.mainVM.integration!.id));
    this.isLoadingAutomatches = false;

    // TODO: The use of getAMS/VendorServiceById here represents a need to only have the AMS / vendor service full objects in one place,
    // and everywhere else just have IDs mapped together.

    const matchesExcludingNewSuggestions = 
      [...this.matchedServices.filter(
        m => 
          suggestionResponse.suggestions.every(s => s.amsServiceTeamId !== m.ams_service.id && s.vendorEntityId !== m.vendor_service.id)
      )
    ];

    const suggestionsWithoutMatchedElsewhere = suggestionResponse.suggestions.filter(m => {
      const amsIntegrationId = this.getAMSServiceById(m.amsServiceTeamId)?.service.externalIntegrationId;
      const vendorIntegrationId = this.getVendorServiceById(m.vendorEntityId)?.service.externalIntegrationId;

      return !amsIntegrationId && !vendorIntegrationId;
    });

    this.matchedServices = [...matchesExcludingNewSuggestions, ...suggestionsWithoutMatchedElsewhere.map(m => ({
      ams_service: this.getAMSServiceById(m.amsServiceTeamId)!,
      vendor_service: this.getVendorServiceById(m.vendorEntityId)!,
      matchMeta: m.matchMeta,
    }))];

    // Remove the AMS service from either unmatched or ignored
    this.unmatchedServicesAms = this.unmatchedServicesAms.filter(x => this.matchedServices.every(mu => mu.ams_service.id !== x.service.id.$oid));
    this.ignoredAmsServices = this.ignoredAmsServices.filter(x => this.matchedServices.every(mu => mu.ams_service.id !== x.service.id.$oid));

    // Remove the vendor service from either unmatched or ignored
    this.unmatchedServicesVendor = this.unmatchedServicesVendor.filter(x => this.matchedServices.every(mu => mu.vendor_service.id !== x.service.id));
    this.ignoredVendorServices = this.ignoredVendorServices.filter(x => this.matchedServices.every(mu => mu.vendor_service.id !== x.service.id));

    this.lastAutomatchSuggestions = suggestionsWithoutMatchedElsewhere;

    return suggestionResponse.suggestions.length;
  }

  public unmatchLastSuggestedMatches() {
    if (!this.lastAutomatchSuggestions) {
      return;
    }
    
    this.unmatchedServicesAms = [...this.unmatchedServicesAms, 
      ...this.lastAutomatchSuggestions
        .map(s => this.getAMSServiceById(s.amsServiceTeamId))
        .filter(s => s !== undefined)
        .map(s => s!)
    ];

    this.unmatchedServicesVendor = [...this.unmatchedServicesVendor, 
      ...this.lastAutomatchSuggestions
        .map(s => this.getVendorServiceById(s.vendorEntityId))
        .filter(s => s !== undefined)
        .map(s => s!)
    ];

    this.matchedServices = [...this.matchedServices.filter(m =>
      this.lastAutomatchSuggestions?.every(s => s.amsServiceTeamId !== m.ams_service.id || s.vendorEntityId !== m.vendor_service.id)
    )];

    this.lastAutomatchSuggestions = undefined;
  }

  public getMatchFromSelectedMatch(matchedCardData: MatchedCardDataTransformable): ServiceMatch {
    if (matchedCardData.firstItem instanceof AMSConnectService && matchedCardData.secondItem instanceof VendorService) {
      return {
        ams_service: matchedCardData.firstItem,
        vendor_service: matchedCardData.secondItem,
        matchMeta: matchedCardData.matchMeta,
      };
    } else {
      throw new Error('Incorrect type passed to getMatchFromSelectedMatch');
    }
  }

  public getAMSServiceById = (id: AMSConnectService['id']): AMSConnectService | undefined => {
    for (const ams_service of this.unmatchedServicesAms) {
      if (ams_service.id === id) {
        return ams_service;
      }
    }
    for (const ams_service of this.ignoredAmsServices) {
      if (ams_service.id === id) {
        return ams_service;
      }
    }
    for (const service_match of this.matchedServices) {
      if (service_match.ams_service.id === id) {
        return service_match.ams_service;
      }
    }
    return;
  };

  public getVendorServiceById = (id: VendorService['id']): VendorService | undefined => {
    for (const vendor_service of this.unmatchedServicesVendor) {
      if (vendor_service.id === id) {
        return vendor_service;
      }
    }
    for (const vendor_service of this.ignoredVendorServices) {
      if (vendor_service.id === id) {
        return vendor_service;
      }
    }
    for (const service_match of this.matchedServices) {
      if (service_match.vendor_service.id === id) {
        return service_match.vendor_service;
      }
    }
    return;
  };
}