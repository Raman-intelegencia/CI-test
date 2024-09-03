import { firstValueFrom } from 'rxjs';
import { SetUserMatchDTO, UpdateUserMatchesDTO, UserMatch } from '../../../../../models/integration.model';
import { InstitutionsService } from '../../../../../services/institutions.service';
import { MatchedCardDataTransformable } from '../matched-card-list/matched-card-list.component';
import { IntegrationWizardViewModel, MainIntegrationWizardViewModel } from './main-view-model';
import { AMSConnectUser, VendorUser } from './card-data-handlers';
import { IntegrationWizardType } from '../integration-wizard.component';
import { EventEmitter } from '@angular/core';

export class IntegrationWizardUserViewModel implements IntegrationWizardViewModel {

  public unmatchedUsersAms: AMSConnectUser[] = [];
  public unmatchedUsersVendor: VendorUser[] = [];
  public ignoredAmsUsers: AMSConnectUser[] = [];
  public ignoredVendorUsers: VendorUser[] = [];
  private _matchedUsers: UserMatch[] = []; // Using the setter is REQUIRED when changing to keep matchedUsersForCardData in sync!
  public matchedUsersForCardData: MatchedCardDataTransformable[] = [];
  
  public lastAutomatchSuggestions?: SetUserMatchDTO[];

  public set matchedUsers(data: UserMatch[]) {
    this._matchedUsers = data;
    
    // !! IMPORTANT !!
    // The convention of "ams item first, vendor item second" is vital since they both
    // implement CardDataTransformable. The following function, getMatchFromSelectedMatch,
    // MUST use the same order for this to work.
    this.matchedUsersForCardData = this.matchedUsers.map(x => new MatchedCardDataTransformable(x.ams_user, x.vendor_user, x.matchMeta));
  }
  
  public get matchedUsers(): UserMatch[] {
    return this._matchedUsers;
  }
  
  public hasBeenFetched = false;
  public isFetching = false;
  public isLoadingAutomatches = false;

  constructor(private institutionsService: InstitutionsService, public mainVM: MainIntegrationWizardViewModel) {
    if (mainVM.userVM) {
        throw Error("User VM already set.");
    }
    mainVM.userVM = this;
}

  public async load(): Promise<void> {
    if (this.hasBeenFetched || this.isFetching) {
      return Promise.resolve();
    }

    this.isFetching = true;

    const data = await firstValueFrom(this.institutionsService
      .getUsersAndMatches(this.mainVM.institution!.id, this.mainVM.integration!.id));

    this.hasBeenFetched = true;
    
    this.unmatchedUsersAms = data.unmatched_ams_users.map(u => new AMSConnectUser(u));
    this.unmatchedUsersVendor = data.unmatched_vendor_users.map(u => new VendorUser(u));
    
    this.ignoredAmsUsers = data.ignored_ams_users.map(u => new AMSConnectUser(u));
    this.ignoredVendorUsers = data.ignored_vendor_users.map(u => new VendorUser(u));
      
    this.matchedUsers = [...this.matchedUsers, ...data.matches.map(m => {
      return {
        ams_user: new AMSConnectUser(m.ams_user),
        vendor_user: new VendorUser(m.vendor_user),
        matchMeta: m.matchMeta
      };
    })];
    
    this._lastPayload = this.payload;

    if (this.mainVM.wizardType === IntegrationWizardType.FIRST_TIME) {
      await this.automatchUsers();
    }

    this.isFetching = false;
  }

  get payload(): UpdateUserMatchesDTO {
    const ignoredAmsUsers = this.ignoredAmsUsers.map(x => ({ organizationId: x.user.institution.id, amsUserId: x.user.id.$oid }));
    const ignoredVendorUsers = this.ignoredVendorUsers.map(x => ({ vendorUserId: x.user.id }));
    const matchedUsers = this.matchedUsers.map(
      x => ({
        organizationId: x.ams_user.user.institution.id,
        amsUserId: x.ams_user.user.id.$oid,
        vendorUserId: x.vendor_user.user.id,
        matchMeta: x.matchMeta
      })
    );

    return {
      ignoredAmsUsers,
      ignoredVendorUsers,
      matchedUsers,
      unmatchedEntityCount: this.mainVM.unmatchedEntityCount
    };
  }

  private _lastPayload?: UpdateUserMatchesDTO;

  public canSave(): boolean {
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
      this.institutionsService.updateIntegrationUserMatches(
        this.mainVM.institutionId!, this.mainVM.integrationId!.toString(), this.payload
      ).subscribe(
        {
          next: data => {
              resolve(true)
          },
          error: e => {
              resolve(false);
          }
        }
      )
    });
  }

  public async automatchUsers() {
    this.isLoadingAutomatches = true;
    const suggestionResponse = await firstValueFrom(this.institutionsService.getSuggestedUserMatches(this.mainVM.institution!.id, this.mainVM.integration!.id));
    this.isLoadingAutomatches = false;
    // TODO: The use of getAMS/VendorUserById here represents a need to only have the AMS / vendor user full objects in one place,
    // and everywhere else just have IDs mapped together.

    const matchesExcludingNewSuggestions = 
      [...this.matchedUsers.filter(
        m => 
          suggestionResponse.suggestions.every(s => s.amsUserId !== m.ams_user.id && s.vendorUserId !== m.vendor_user.id)
      )
    ];

    this.matchedUsers = [...matchesExcludingNewSuggestions, ...suggestionResponse.suggestions.map(m => ({
      ams_user: this.getAMSUserById(m.amsUserId)!,
      vendor_user: this.getVendorUserById(m.vendorUserId)!,
      matchMeta: m.matchMeta,
    }))];

    // Remove the AMS user from either unmatched or ignored
    this.unmatchedUsersAms = this.unmatchedUsersAms.filter(x => this.matchedUsers.every(mu => mu.ams_user.id !== x.user.id.$oid));
    this.ignoredAmsUsers = this.ignoredAmsUsers.filter(x => this.matchedUsers.every(mu => mu.ams_user.id !== x.user.id.$oid));

    // Remove the vendor user from either unmatched or ignored
    this.unmatchedUsersVendor = this.unmatchedUsersVendor.filter(x => this.matchedUsers.every(mu => mu.vendor_user.id !== x.user.id));
    this.ignoredVendorUsers = this.ignoredVendorUsers.filter(x => this.matchedUsers.every(mu => mu.vendor_user.id !== x.user.id));
    
    this.lastAutomatchSuggestions = suggestionResponse.suggestions;

    return suggestionResponse.suggestions.length;
  }

  public unmatchLastSuggestedMatches() {
    if (!this.lastAutomatchSuggestions) {
      return;
    }

    this.unmatchedUsersAms = [...this.unmatchedUsersAms, 
      ...this.lastAutomatchSuggestions
        .map(s => this.getAMSUserById(s.amsUserId))
        .filter(s => s !== undefined)
        .map(s => s!)
    ];

    this.unmatchedUsersVendor = [...this.unmatchedUsersVendor, 
      ...this.lastAutomatchSuggestions
        .map(s => this.getVendorUserById(s.vendorUserId))
        .filter(s => s !== undefined)
        .map(s => s!)
    ];

    this.matchedUsers = [...this.matchedUsers.filter(m =>
      this.lastAutomatchSuggestions?.every(s => s.amsUserId !== m.ams_user.id || s.vendorUserId !== m.vendor_user.id)
    )];

    this.lastAutomatchSuggestions = undefined;
  }

  public getMatchFromSelectedMatch(matchedCardData: MatchedCardDataTransformable): UserMatch {
    if (matchedCardData.firstItem instanceof AMSConnectUser && matchedCardData.secondItem instanceof VendorUser) {
      return {
        ams_user: matchedCardData.firstItem,
        vendor_user: matchedCardData.secondItem,
        matchMeta: matchedCardData.matchMeta
      };
    } else {
      throw new Error('Incorrect type passed to getMatchFromSelectedMatch');
    }
  }

  public getAMSUserById = (id: AMSConnectUser['id']): AMSConnectUser | undefined => {
    for (const ams_user of this.unmatchedUsersAms) {
      if (ams_user.id === id) {
        return ams_user;
      }
    }
    for (const ams_user of this.ignoredAmsUsers) {
      if (ams_user.id === id) {
        return ams_user;
      }
    }
    for (const user_match of this.matchedUsers) {
      if (user_match.ams_user.id === id) {
        return user_match.ams_user;
      }
    }
    return;
  };

  public getVendorUserById = (id: VendorUser['id']): VendorUser | undefined => {
    for (const vendor_user of this.unmatchedUsersVendor) {
      if (vendor_user.id === id) {
        return vendor_user;
      }
    }
    for (const vendor_user of this.ignoredVendorUsers) {
      if (vendor_user.id === id) {
        return vendor_user;
      }
    }
    for (const user_match of this.matchedUsers) {
      if (user_match.vendor_user.id === id) {
        return user_match.vendor_user;
      }
    }
    return;
  };
}