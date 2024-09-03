import { Component, Input, OnInit, HostListener, EventEmitter } from '@angular/core';
import {
  UserMatch,
} from '../../../../../models/integration.model';
import { CardDataTransformable } from '../card-list/card-list.component';
import { IntegrationWizardChildComponent } from '../integration-wizard.component';
import { MatchedCardDataTransformable } from '../matched-card-list/matched-card-list.component';
import { IntegrationWizardUserViewModel } from '../view-models/user-view-model';
import { AMSConnectUser, VendorUser } from '../view-models/card-data-handlers';


// This class persists our actively selected items so that 
// we can ignore, match, or unmatch them.

// Once we do an operation, we need to remove the selection that we operated
// on from this class.
export class IntegrationWizardUserSelectionViewModel {
  constructor(public institutionId: string) {
    this.institutionId = institutionId;
  }
  
  selectedAmsUsers: AMSConnectUser['id'][] = [];
  selectedVendorUsers: VendorUser['id'][] = [];
  selectedMatchedPairs: [amsId: AMSConnectUser['id'], vendorId: VendorUser['id']][] = [];

  ignoreUsers = (userVM: IntegrationWizardUserViewModel): void => {
    // Parse AmsUsers from IDs into full objects
    const AmsUsersToIgnore = this.selectedAmsUsers.map((userId) => {
      return userVM.getAMSUserById(userId);
    }).filter<AMSConnectUser>(
        (value): value is AMSConnectUser => {
          return !!value;
        }
    );

    AmsUsersToIgnore.forEach(amsUser => amsUser.isSelected = false);
    
    userVM.ignoredAmsUsers = [...userVM.ignoredAmsUsers, ...AmsUsersToIgnore];
    // Remove ignored users from user view model unmatched list
    userVM.unmatchedUsersAms = userVM.unmatchedUsersAms.filter(x => !this.selectedAmsUsers.includes(x.id));
    this.selectedAmsUsers = [];

    // Parse VendorUsers from IDs into full objects
    const VendorUsersToIgnore = this.selectedVendorUsers.map((userId) => {
      return userVM.getVendorUserById(userId);
    }).filter<VendorUser>(
        (value): value is VendorUser => {
          return !!value;
        }
    );

    VendorUsersToIgnore.forEach(vendorUser => vendorUser.isSelected = false);
    
    userVM.ignoredVendorUsers = [...userVM.ignoredVendorUsers, ...VendorUsersToIgnore];
    // Remove ignored users from user view model unmatched list
    userVM.unmatchedUsersVendor = userVM.unmatchedUsersVendor.filter(x => !this.selectedVendorUsers.includes(x.id));
    this.selectedVendorUsers = [];
  }
  
  unignoreUsers = (userVM: IntegrationWizardUserViewModel): void => {
    // Parse AmsUsers from IDs into full objects
    const AmsUsersToUnignore = this.selectedAmsUsers.map((userId) => {
      return userVM.getAMSUserById(userId);
    }).filter<AMSConnectUser>(
        (value): value is AMSConnectUser => {
          return !!value;
        }
    );

    AmsUsersToUnignore.forEach(amsUser => amsUser.isSelected = false);

    userVM.unmatchedUsersAms = [...userVM.unmatchedUsersAms, ...AmsUsersToUnignore];
    // Remove unignored users from user view model ignored list
    userVM.ignoredAmsUsers = userVM.ignoredAmsUsers.filter(x => !this.selectedAmsUsers.includes(x.id));
    this.selectedAmsUsers = [];

    // Parse VendorUsers from IDs into full objects
    const VendorUsersToUnignore = this.selectedVendorUsers.map((userId) => {
      return userVM.getVendorUserById(userId);
    }).filter<VendorUser>(
        (value): value is VendorUser => {
          return !!value;
        }
    );

    VendorUsersToUnignore.forEach(vendorUser => vendorUser.isSelected = false);

    userVM.unmatchedUsersVendor = [...userVM.unmatchedUsersVendor, ...VendorUsersToUnignore];
    // Remove unignored users from user view model ignored list
    userVM.ignoredVendorUsers = userVM.ignoredVendorUsers.filter(x => !this.selectedVendorUsers.includes(x.id));
    this.selectedVendorUsers = [];
  }

  matchUsers = (userVM: IntegrationWizardUserViewModel): void => {
    if (this.selectedAmsUsers.length !== 1 || this.selectedVendorUsers.length !== 1) {
      // TODO: Maybe display a message saying only 1 user from each column can be selected?
      return;
    }

    const AmsUser = userVM.getAMSUserById(this.selectedAmsUsers[0]) as AMSConnectUser;
    const VendorUser = userVM.getVendorUserById(this.selectedVendorUsers[0]) as VendorUser;

    AmsUser.isSelected = false;
    VendorUser.isSelected = false;
    
    const userMatch: UserMatch = {
      ams_user: AmsUser,
      vendor_user: VendorUser
    }
    
    userVM.matchedUsers = [...userVM.matchedUsers, userMatch];

    // Remove the AMS user from either unmatched or ignored
    userVM.unmatchedUsersAms = userVM.unmatchedUsersAms.filter(x => x.user.id.$oid !== AmsUser.user.id.$oid)
    userVM.ignoredAmsUsers = userVM.ignoredAmsUsers.filter(x => x.user.id.$oid !== AmsUser.user.id.$oid)

    // Remove the vendor user from either unmatched or ignored
    userVM.unmatchedUsersVendor = userVM.unmatchedUsersVendor.filter(x => x.user.id !== VendorUser.user.id)
    userVM.ignoredVendorUsers = userVM.ignoredVendorUsers.filter(x => x.user.id !== VendorUser.user.id)

    this.selectedAmsUsers = [];
    this.selectedVendorUsers = [];
  }

  unmatchUsers = (userVM: IntegrationWizardUserViewModel): void => {
    for (const matchedPair of this.selectedMatchedPairs) {
      const AmsUser = userVM.getAMSUserById(matchedPair[0]) as AMSConnectUser;
      const VendorUser = userVM.getVendorUserById(matchedPair[1]) as VendorUser;

      AmsUser.isSelected = false;
      VendorUser.isSelected = false;
      
      userVM.unmatchedUsersAms = [...userVM.unmatchedUsersAms, AmsUser];
      userVM.unmatchedUsersVendor = [...userVM.unmatchedUsersVendor, VendorUser];
      
      userVM.matchedUsers = userVM.matchedUsers.filter(
          (match) => match.ams_user !== AmsUser && match.vendor_user !== VendorUser
      )
      this.selectedMatchedPairs = []
    }
  }
  
  public addAMSUser(card: CardDataTransformable): void {
    if (!this.selectedAmsUsers.includes(card.id)) {
      this.selectedAmsUsers = [...this.selectedAmsUsers, card.id];
    }
  }

  public addVendorUser(card: CardDataTransformable): void {
    if (!this.selectedVendorUsers.includes(card.id)) {
      this.selectedVendorUsers = [...this.selectedVendorUsers, card.id];
    }
  }
}

@Component({
  selector: 'web-messenger-integration-wizard-match-users-step',
  templateUrl: './match-users-step.component.html',
  styles: [`.small-button { @apply btn-sm; }`]
})
export class MatchUsersStepComponent implements OnInit, IntegrationWizardChildComponent {
  @Input({required: true}) usersViewModel!: IntegrationWizardUserViewModel;
  @Input({required: true}) selectionVM!: IntegrationWizardUserSelectionViewModel;
  public selectAllAMSEmitter: EventEmitter<void> = new EventEmitter<void>();
  public selectAllVendorEmitter: EventEmitter<void> = new EventEmitter<void>();

  public showToast = false;
  public toastIsClosing = false;

  async ngOnInit(): Promise<void> {
    await this.usersViewModel.load();
  }

  @HostListener("window:keydown", ['$event'])
  public onKeyDown = ($event: KeyboardEvent) => {
    if ($event.key === "Enter") {
      this.matchSelected();
      $event.stopPropagation();
      $event.preventDefault();
    }
  }

  get isIgnoreAllowed(): boolean {
    const nonIgnoredAmsUsers = this.selectionVM.selectedAmsUsers.filter(x => this.usersViewModel.ignoredAmsUsers.every(y => y.id !== x));
    const nonIgnoredVendorUsers = this.selectionVM.selectedVendorUsers.filter(x => this.usersViewModel.ignoredVendorUsers.every(y => y.id !== x));
    const ignoredAmsUsers = this.selectionVM.selectedAmsUsers.filter(id => this.usersViewModel.ignoredAmsUsers.map(user => user.id).includes(id));
    const ignoredVendorUsers = this.selectionVM.selectedVendorUsers.filter(id => this.usersViewModel.ignoredVendorUsers.map(user => user.id).includes(id));
    return nonIgnoredAmsUsers.length > 0 || nonIgnoredVendorUsers.length > 0 && ignoredAmsUsers.length === 0 && ignoredVendorUsers.length === 0;
  }
  
  get isUnignoreAllowed(): boolean {
    const ignoredAmsUsers = this.selectionVM.selectedAmsUsers.filter(x => this.usersViewModel.unmatchedUsersAms.every(y => y.id !== x));
    const ignoredVendorUsers = this.selectionVM.selectedVendorUsers.filter(x => this.usersViewModel.unmatchedUsersVendor.every(y => y.id !== x));
    const unmatchedAmsUsers = this.selectionVM.selectedAmsUsers.filter(id => this.usersViewModel.unmatchedUsersAms.map(user => user.id).includes(id));
    const unmatchedVendorUsers = this.selectionVM.selectedVendorUsers.filter(id => this.usersViewModel.unmatchedUsersVendor.map(user => user.id).includes(id));
    return (ignoredAmsUsers.length > 0 || ignoredVendorUsers.length > 0) && unmatchedAmsUsers.length === 0 && unmatchedVendorUsers.length === 0;
  }

  get isMatchAllowed(): boolean {
    return this.selectionVM.selectedAmsUsers.length === this.selectionVM.selectedVendorUsers.length
      && this.selectionVM.selectedAmsUsers.length === 1;
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
    return this.usersViewModel.canSave();
  }

  async save(): Promise<boolean> {
    return await this.usersViewModel.save();
  }

  public onSelectAmsUserCard = (card: CardDataTransformable) => {
    if (card instanceof AMSConnectUser) {
      const amsUserIdx = this.selectionVM.selectedAmsUsers.findIndex((user) => user === card.user.id.$oid);
      if (amsUserIdx === -1) {
        this.selectionVM.selectedAmsUsers = [...this.selectionVM.selectedAmsUsers, card.user.id.$oid];
      } else {
        this.selectionVM.selectedAmsUsers.splice(amsUserIdx, 1);
        this.selectionVM.selectedAmsUsers = [...this.selectionVM.selectedAmsUsers];
      }
    }
  }

  public onSelectVendorUserCard = (card: CardDataTransformable) => {
    if (card instanceof VendorUser) {
      const vendorUserIdx = this.selectionVM.selectedVendorUsers.findIndex((user) => user === card.user.id);
      if (vendorUserIdx === -1) {
        this.selectionVM.selectedVendorUsers = [...this.selectionVM.selectedVendorUsers, card.user.id];
      } else {
        this.selectionVM.selectedVendorUsers.splice(vendorUserIdx, 1);
        this.selectionVM.selectedVendorUsers = [...this.selectionVM.selectedVendorUsers];
      }
    }
  }

  public onSelectMatch = (matchedCard: MatchedCardDataTransformable) => {
    const match = this.usersViewModel.getMatchFromSelectedMatch(matchedCard);
    const matchIdx = this.selectionVM.selectedMatchedPairs.findIndex(m => m[0] === match.ams_user.user.id.$oid && m[1] === match.vendor_user.user.id);
    if (matchIdx === -1) {
      this.selectionVM.selectedMatchedPairs = [...this.selectionVM.selectedMatchedPairs, [match.ams_user.user.id.$oid, match.vendor_user.id]]
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
          if (!this.selectionVM.selectedAmsUsers.includes(value.id) && value.isSelected) {
            this.selectionVM.selectedAmsUsers.push(value.id);
          } else if (this.selectionVM.selectedAmsUsers.includes(value.id) && !value.isSelected) {
            const cardIndex = this.selectionVM.selectedAmsUsers.indexOf(value.id);
            this.selectionVM.selectedAmsUsers.splice(cardIndex, 1);
          }
        });
  }

  public selectAllFilteredVendorItems(cards: CardDataTransformable[]): void {
    cards.map(
        (value) => {
          if (!this.selectionVM.selectedVendorUsers.includes(value.id) && value.isSelected) {
            this.selectionVM.selectedVendorUsers.push(value.id);
          } else if (this.selectionVM.selectedVendorUsers.includes(value.id) && !value.isSelected) {
            const cardIndex = this.selectionVM.selectedVendorUsers.indexOf(value.id);
            this.selectionVM.selectedVendorUsers.splice(cardIndex, 1);
          }
        });
  }
  
  public onAMSClickSelect(card: CardDataTransformable): void {
    if (this.selectionVM.selectedAmsUsers.includes(card.id)) {
      this.selectionVM.selectedAmsUsers = [];
      return;
    }
    this.selectionVM.selectedAmsUsers = [card.id];
  }

  public onVendorClickSelect(card: CardDataTransformable): void {
    if (this.selectionVM.selectedVendorUsers.includes(card.id)) {
      this.selectionVM.selectedVendorUsers = [];
      return;
    }
    this.selectionVM.selectedVendorUsers = [card.id];
  }
  
  public ignoreSelected = () => {
    if (this.isIgnoreAllowed) {
      this.selectionVM.ignoreUsers(this.usersViewModel);
    }
  }
  
  public unignoreSelected = () => {
    if (this.isUnignoreAllowed) {
      this.selectionVM.unignoreUsers(this.usersViewModel);
    }
  }

  public matchSelected = () => {
    if (this.isMatchAllowed) {
      this.selectionVM.matchUsers(this.usersViewModel);
    }
  }

  public unmatchSelected = () => {
    if (this.isUnmatchAllowed) {
      this.selectionVM.unmatchUsers(this.usersViewModel);
    }
  }

  public autoMatch = async () => {
    const suggestionCount = await this.usersViewModel.automatchUsers();
    if (suggestionCount === 0) {
      this.showToast = true;
    }
  }

  public unmatchSuggestions = () => {
    this.usersViewModel.unmatchLastSuggestedMatches();
  }

  public get isAllAMSSelected(): boolean {
    return (this.selectionVM.selectedAmsUsers.length === this.usersViewModel.unmatchedUsersAms.length) && this.usersViewModel.unmatchedUsersAms.length > 0;
  }

  public get isAllVendorSelected(): boolean {
    return this.selectionVM.selectedVendorUsers.length === this.usersViewModel.unmatchedUsersVendor.length && this.usersViewModel.unmatchedUsersVendor.length > 0;
  }

  public closeToast(): void {
    this.toastIsClosing = true;
    setTimeout(() => {
      this.showToast = false;
      this.toastIsClosing = false;
    }, 250);
  }
}