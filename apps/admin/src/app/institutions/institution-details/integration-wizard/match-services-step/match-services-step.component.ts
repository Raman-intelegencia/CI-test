import { Component, Input, OnInit, HostListener, EventEmitter } from '@angular/core';
import {
  ServiceMatch,
} from '../../../../../models/integration.model';
import { CardDataTransformable } from '../card-list/card-list.component';
import { IntegrationWizardChildComponent } from '../integration-wizard.component';
import { MatchedCardDataTransformable } from '../matched-card-list/matched-card-list.component';
import { IntegrationWizardServiceViewModel } from '../view-models/service-view-model';
import { AMSConnectService, VendorService } from '../view-models/card-data-handlers';

export class IntegrationWizardServiceSelectionViewModel {
  constructor(public institutionId: string) {
    this.institutionId = institutionId;
  }

  selectedAmsServices: AMSConnectService['id'][] = [];
  selectedVendorServices: VendorService['id'][] = [];
  selectedMatchedPairs: [amsId: AMSConnectService['id'], vendorId: VendorService['id']][] = [];

  ignoreServices = (serviceVM: IntegrationWizardServiceViewModel): void => {
    // Parse AmsServices from IDs into full objects
    const AmsServicesToIgnore = this.selectedAmsServices.map((serviceId) => {
      return serviceVM.getAMSServiceById(serviceId);
    }).filter<AMSConnectService>(
        (value): value is AMSConnectService => {
          return !!value;
        }
    );

    AmsServicesToIgnore.forEach(amsService => amsService.isSelected = false);
    
    serviceVM.ignoredAmsServices = [...serviceVM.ignoredAmsServices, ...AmsServicesToIgnore];
    // Remove ignored Services from service view model unmatched list
    serviceVM.unmatchedServicesAms = serviceVM.unmatchedServicesAms.filter(x => !this.selectedAmsServices.includes(x.id));
    this.selectedAmsServices = [];

    // Parse VendorServices from IDs into full objects
    const VendorServicesToIgnore = this.selectedVendorServices.map((serviceId) => {
      return serviceVM.getVendorServiceById(serviceId);
    }).filter<VendorService>(
        (value): value is VendorService => {
          return !!value;
        }
    );

    VendorServicesToIgnore.forEach(vendorService => vendorService.isSelected = false);
    
    serviceVM.ignoredVendorServices = [...serviceVM.ignoredVendorServices, ...VendorServicesToIgnore];
    // Remove ignored Services from service view model unmatched list
    serviceVM.unmatchedServicesVendor = serviceVM.unmatchedServicesVendor.filter(x => !this.selectedVendorServices.includes(x.id));
    this.selectedVendorServices = [];
  }

  unignoreServices = (serviceVM: IntegrationWizardServiceViewModel): void => {
    // Parse AmsServices from IDs into full objects
    const AmsServicesToUnignore = this.selectedAmsServices.map((serviceId) => {
      return serviceVM.getAMSServiceById(serviceId);
    }).filter<AMSConnectService>(
        (value): value is AMSConnectService => {
          return !!value;
        }
    );

    AmsServicesToUnignore.forEach(amsService => amsService.isSelected = false);

    serviceVM.unmatchedServicesAms = [...serviceVM.unmatchedServicesAms, ...AmsServicesToUnignore];
    // Remove unignored Services from service view model ignored list
    serviceVM.ignoredAmsServices = serviceVM.ignoredAmsServices.filter(x => !this.selectedAmsServices.includes(x.id));
    this.selectedAmsServices = [];

    // Parse VendorServices from IDs into full objects
    const VendorServicesToUnignore = this.selectedVendorServices.map((serviceId) => {
      return serviceVM.getVendorServiceById(serviceId);
    }).filter<VendorService>(
        (value): value is VendorService => {
          return !!value;
        }
    );

    VendorServicesToUnignore.forEach(vendorService => vendorService.isSelected = false);

    serviceVM.unmatchedServicesVendor = [...serviceVM.unmatchedServicesVendor, ...VendorServicesToUnignore];
    // Remove unignored Services from service view model ignored list
    serviceVM.ignoredVendorServices = serviceVM.ignoredVendorServices.filter(x => !this.selectedVendorServices.includes(x.id));
    this.selectedVendorServices = [];
  }

  matchServices = (serviceVM: IntegrationWizardServiceViewModel): void => {
    if (this.selectedAmsServices.length !== 1 || this.selectedVendorServices.length !== 1) {
      // TODO: Maybe display a message saying only 1 service from each column can be selected?
      return;
    }

    const AmsService = serviceVM.getAMSServiceById(this.selectedAmsServices[0]) as AMSConnectService;
    const VendorService = serviceVM.getVendorServiceById(this.selectedVendorServices[0]) as VendorService;

    AmsService.isSelected = false;
    VendorService.isSelected = false;
    
    const serviceMatch: ServiceMatch = {
      ams_service: AmsService,
      vendor_service: VendorService
    }
    
    serviceVM.matchedServices = [...serviceVM.matchedServices, serviceMatch];

    // Remove the AMS service from either unmatched or ignored
    serviceVM.unmatchedServicesAms = serviceVM.unmatchedServicesAms.filter(x => x.service.id.$oid !== AmsService.service.id.$oid)
    serviceVM.ignoredAmsServices = serviceVM.ignoredAmsServices.filter(x => x.service.id.$oid !== AmsService.service.id.$oid)

    // Remove the vendor service from either unmatched or ignored
    serviceVM.unmatchedServicesVendor = serviceVM.unmatchedServicesVendor.filter(x => x.service.id !== VendorService.service.id)
    serviceVM.ignoredVendorServices = serviceVM.ignoredVendorServices.filter(x => x.service.id !== VendorService.service.id)

    this.selectedAmsServices = [];
    this.selectedVendorServices = [];
  }

  unmatchServices = (serviceVM: IntegrationWizardServiceViewModel): void => {
    for (const matchedPair of this.selectedMatchedPairs) {
      const AmsService = serviceVM.getAMSServiceById(matchedPair[0]) as AMSConnectService;
      const VendorService = serviceVM.getVendorServiceById(matchedPair[1]) as VendorService;

      AmsService.isSelected = false;
      VendorService.isSelected = false;
      
      serviceVM.unmatchedServicesAms = [...serviceVM.unmatchedServicesAms, AmsService];
      serviceVM.unmatchedServicesVendor = [...serviceVM.unmatchedServicesVendor, VendorService];
      
      serviceVM.matchedServices = serviceVM.matchedServices.filter(
          (match) => match.ams_service !== AmsService && match.vendor_service !== VendorService
      )
      this.selectedMatchedPairs = []
    }
  }

  public addAMSUser(card: CardDataTransformable): void {
    if (!this.selectedAmsServices.includes(card.id)) {
      this.selectedAmsServices = [...this.selectedAmsServices, card.id];
    }
  }

  public addVendorUser(card: CardDataTransformable): void {
    if (!this.selectedVendorServices.includes(card.id)) {
      this.selectedVendorServices = [...this.selectedVendorServices, card.id];
    }
  }
}

@Component({
  selector: 'web-messenger-integration-wizard-match-services-step',
  templateUrl: './match-services-step.component.html',
  styles: [`.small-button { @apply btn-sm; }`]
})
export class MatchServicesStepComponent implements OnInit, IntegrationWizardChildComponent {
  @Input({required: true}) servicesViewModel!: IntegrationWizardServiceViewModel;
  @Input({required: true}) selectionVM!: IntegrationWizardServiceSelectionViewModel;
  public selectAllAMSEmitter: EventEmitter<void> = new EventEmitter<void>();
  public selectAllVendorEmitter: EventEmitter<void> = new EventEmitter<void>();

  public showToast = false;
  public toastIsClosing = false;

  @HostListener("window:keydown", ['$event'])
  public onKeyDown = ($event: KeyboardEvent) => {
    if ($event.key === "Enter") {
      this.matchSelected();
      $event.stopPropagation();
      $event.preventDefault();
    }
  }
    
  async ngOnInit(): Promise<void> {
    await this.servicesViewModel.load();
  }

  get isIgnoreAllowed(): boolean {
    const nonIgnoredAmsServices = this.selectionVM.selectedAmsServices.filter(x => this.servicesViewModel.ignoredAmsServices.every(y => y.id !== x));
    const nonIgnoredVendorServices = this.selectionVM.selectedVendorServices.filter(x => this.servicesViewModel.ignoredVendorServices.every(y => y.id !== x));
    const ignoredAmsServices = this.selectionVM.selectedAmsServices.filter(id => this.servicesViewModel.ignoredAmsServices.map(service => service.id).includes(id))
    const ignoredVendorServices = this.selectionVM.selectedVendorServices.filter(id => this.servicesViewModel.ignoredVendorServices.map(service => service.id).includes(id))
    return (nonIgnoredAmsServices.length > 0 || nonIgnoredVendorServices.length > 0) && ignoredAmsServices.length === 0 && ignoredVendorServices.length === 0;
  }
  
  get isUnignoreAllowed(): boolean {
    const nonIgnoredAmsServices = this.selectionVM.selectedAmsServices.filter(x => this.servicesViewModel.unmatchedServicesAms.every(y => y.id !== x));
    const nonIgnoredVendorServices = this.selectionVM.selectedVendorServices.filter(x => this.servicesViewModel.unmatchedServicesVendor.every(y => y.id !== x));
    const unmatchedAmsServices = this.selectionVM.selectedAmsServices.filter(id => this.servicesViewModel.unmatchedServicesAms.map(service => service.id).includes(id))
    const unmatchedVendorServices = this.selectionVM.selectedVendorServices.filter(id => this.servicesViewModel.unmatchedServicesVendor.map(service => service.id).includes(id))
    return (nonIgnoredAmsServices.length > 0 || nonIgnoredVendorServices.length > 0) && unmatchedAmsServices.length === 0 && unmatchedVendorServices.length === 0;
  }

  get isMatchAllowed(): boolean {
    const servicesEqual = this.selectionVM.selectedAmsServices.length === this.selectionVM.selectedVendorServices.length
      && this.selectionVM.selectedAmsServices.length === 1;
    
    if (!servicesEqual) {
      return false;
    }

    const hasDisallowedAmsServices = this.selectionVM.selectedAmsServices
      .some(x => this.servicesViewModel
        .getAMSServiceById(x)?.service.externalIntegrationId != null
      );
    if (hasDisallowedAmsServices) {
      return false;
    }

    const hasDisallowedVendorServices = this.selectionVM.selectedVendorServices
      .some(x => this.servicesViewModel
        .getVendorServiceById(x)?.service.externalIntegrationId != null
      );
    if (hasDisallowedVendorServices) {
      return false;
    }
    
    return true;
  }

  get isUnmatchAllowed(): boolean {
    return this.selectionVM.selectedMatchedPairs.length > 0;
  }

  canNavigateNext(): boolean {
    return true;
  }
  
  canNavigatePrevious(): boolean {
    return true;
  }

  canSave(): boolean {
    return this.servicesViewModel.canSave();
  }

  async save(): Promise<boolean> {
    return await this.servicesViewModel.save();
  }

  public onSelectAmsServiceCard = (card: CardDataTransformable) => {
    if (card instanceof AMSConnectService) {
      const amsServiceIdx = this.selectionVM.selectedAmsServices.findIndex((service) => service === card.service.id.$oid);
      if (amsServiceIdx === -1) {
        this.selectionVM.selectedAmsServices = [...this.selectionVM.selectedAmsServices, card.service.id.$oid];
      } else {
        this.selectionVM.selectedAmsServices.splice(amsServiceIdx, 1);
        this.selectionVM.selectedAmsServices = [...this.selectionVM.selectedAmsServices];
      }
    }
  }

  public onSelectVendorServiceCard = (card: CardDataTransformable) => {
    if (card instanceof VendorService) {
      const VendorServiceIdx = this.selectionVM.selectedVendorServices.findIndex((service) => service === card.service.id);
      if (VendorServiceIdx === -1) {
        this.selectionVM.selectedVendorServices = [...this.selectionVM.selectedVendorServices, card.service.id];
      } else {
        this.selectionVM.selectedVendorServices.splice(VendorServiceIdx, 1);
        this.selectionVM.selectedVendorServices = [...this.selectionVM.selectedVendorServices];
      }
    }
  }

  public onSelectMatch = (matchedCard: MatchedCardDataTransformable) => {
    const match = this.servicesViewModel.getMatchFromSelectedMatch(matchedCard);
    const matchIdx = this.selectionVM.selectedMatchedPairs.findIndex(m => m[0] === match.ams_service.service.id.$oid && m[1] === match.vendor_service.service.id);
    if (matchIdx === -1) {
      this.selectionVM.selectedMatchedPairs = [...this.selectionVM.selectedMatchedPairs, [match.ams_service.service.id.$oid, match.vendor_service.id]]
    } else {
      this.selectionVM.selectedMatchedPairs.splice(matchIdx, 1);
      this.selectionVM.selectedMatchedPairs = [...this.selectionVM.selectedMatchedPairs];
    }
  }

  public onAMSSelectAll(): void {
    this.selectAllAMSEmitter.emit();
  }

  public onVendorSelectAll(): void {
    this.selectAllVendorEmitter.emit();
  }

  public selectAllFilteredAMSItems(cards: CardDataTransformable[]): void {
    cards.map(
        (value) => {
          if (!this.selectionVM.selectedAmsServices.includes(value.id) && value.isSelected) {
            this.selectionVM.selectedAmsServices.push(value.id);
          } else if (this.selectionVM.selectedAmsServices.includes(value.id) && !value.isSelected) {
            const cardIndex = this.selectionVM.selectedAmsServices.indexOf(value.id);
            this.selectionVM.selectedAmsServices.splice(cardIndex, 1);
          }
        });
  }

  public selectAllFilteredVendorItems(cards: CardDataTransformable[]): void {
    cards.map(
        (value) => {
          if (!this.selectionVM.selectedVendorServices.includes(value.id) && value.isSelected) {
            this.selectionVM.selectedVendorServices.push(value.id);
          } else if (this.selectionVM.selectedVendorServices.includes(value.id) && !value.isSelected) {
            const cardIndex = this.selectionVM.selectedVendorServices.indexOf(value.id);
            this.selectionVM.selectedVendorServices.splice(cardIndex, 1);
          }
        });
  }

  public onAMSClickSelect(card: CardDataTransformable): void {
    if (this.selectionVM.selectedAmsServices.includes(card.id)) {
      this.selectionVM.selectedAmsServices = [];
      return;
    }
    this.selectionVM.selectedAmsServices = [card.id];
  }

  public onVendorClickSelect(card: CardDataTransformable): void {
    if (this.selectionVM.selectedVendorServices.includes(card.id)) {
      this.selectionVM.selectedVendorServices = [];
      return;
    }
    this.selectionVM.selectedVendorServices = [card.id];
  }
  
  public ignoreSelected = () => {
    if (this.isIgnoreAllowed) {
      this.selectionVM.ignoreServices(this.servicesViewModel);
    }
  }
  
  public unignoreSelected = () => {
    if (this.isUnignoreAllowed) {
      this.selectionVM.unignoreServices(this.servicesViewModel);
    }
  }

  public matchSelected = () => {
    this.selectionVM.matchServices(this.servicesViewModel);
  }

  public unmatchSelected = () => {
    this.selectionVM.unmatchServices(this.servicesViewModel);
  }

  public autoMatch = async () => {
    const suggestionsCount = await this.servicesViewModel.automatchServices();
    if (suggestionsCount === 0) {
      this.showToast = true;
    }
  }

  public unmatchSuggestions = () => {
    this.servicesViewModel.unmatchLastSuggestedMatches();
  }

  public get isAllAMSSelected() {
    return (this.selectionVM.selectedAmsServices.length === this.servicesViewModel.unmatchedServicesAms.length) && this.servicesViewModel.unmatchedServicesAms.length > 0
  }

  public get isAllVendorSelected() {
    return (this.selectionVM.selectedVendorServices.length === this.servicesViewModel.unmatchedServicesVendor.length) && this.servicesViewModel.unmatchedServicesVendor.length > 0
  }

  public closeToast(): void {
    this.toastIsClosing = true;
    setTimeout(() => {
      this.showToast = false;
      this.toastIsClosing = false;
    }, 250);
  }
}