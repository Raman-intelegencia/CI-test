import { AuthService, AuthUser, UsersAuthResponse } from "@amsconnect/shared";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountAssociationsService } from "apps/messenger/src/services/account-association-helper.service";
import { environment } from "../../../../../../../libs/shared/src/lib/config/environment";
import { Subscription } from "rxjs";
import { ComposeHelperService } from "../../../../services/compose-helper.service";
import { ComposeService } from "../../../../services/compose.service";

@Component({
    selector: "web-messenger-manage-multiple-accounts",
    templateUrl: "./manage-multiple-accounts.component.html",
    styleUrls: ["./manage-multiple-accounts.component.scss"],
})
export class ManageMultipleAccountsComponent implements OnInit, OnDestroy {
    public loggedInUsersData!: UsersAuthResponse;
    public storeMultipleAccountsData!: { account_information: { [x: string]: any } };
    public accountInformation: AuthUser[] = [];
    private subscription: Subscription = new Subscription();
    public config_profileimage_url = "";
    public selectedUserIdDetails = '';
    public showProfileModal = false;

    constructor(private authService: AuthService, private accountAssociationSvc: AccountAssociationsService,
        private  composeHelperService: ComposeHelperService,private composeService:ComposeService) {}
    ngOnInit(): void {
        this.getLoadLatestJournalIdData();
       this.subscription = this.authService.authResponseData$.subscribe(
            (data: UsersAuthResponse) => {
              this.config_profileimage_url =
                data?.config?.config_profileimage_url || "";
            }
          ) 
         
    }

    public getLoadLatestJournalIdData(): void {
      this.subscription = this.authService.authResponseData$.subscribe((data: UsersAuthResponse) => {
        this.loggedInUsersData = data; 
        const existingData = this.accountAssociationSvc.parseJStorageData();
        this.storeMultipleAccountsData = this.accountAssociationSvc.parseJStorageData();
            this.accountInformation = [];
            const accountLists = existingData[this.accountAssociationSvc.storageKeyForUserId(this.loggedInUsersData.user._id.$oid,"account_associations")];
            if (this.loggedInUsersData && accountLists) {
                Object.keys(accountLists as Record<string, any>).forEach((accountKey) => {
                    const keyValue = this.accountAssociationSvc.storageKeyForUserId(accountKey,"account_information");
                    this.accountInformation.push((existingData[keyValue] as Record<string, any>)['user']);
                });
            }
    });
    }

    public viewProfile(user: AuthUser):void{
        this.selectedUserIdDetails = user?._id?.$oid;
        this.showProfileModal = true;
    }

    public navigateToAccountsScreen(): void {
        window.open(environment.accounts_server_url + `#/accounts/add`, "_blank");
    }

    public removeUser(userId: string): void {
       const existingData = this.accountAssociationSvc.parseJStorageData();
       const accountKey = this.accountAssociationSvc.storageKeyForUserId(userId,'account_information')
       if(existingData[accountKey]){
        delete (existingData[accountKey])
       }
       localStorage.setItem('jStorage',JSON.stringify(existingData));
       this.accountAssociationSvc.removeUserAssociations(this.loggedInUsersData.user._id.$oid,userId);
       const index = this.accountInformation.findIndex((account) => account._id.$oid === userId);
       if (index !== -1) {
           this.accountInformation.splice(index, 1);
       }
    }

    public addComposeQueryParamsForCoverageId(getIdAndtype:{ coverageId: string; type: string; },messageType = "InternalMessage"): void {
        this.composeHelperService.setCoverageId(getIdAndtype.coverageId);
        this.composeService.addComposeQueryParamsForCoverageId(getIdAndtype,messageType);
      }
      
      public addComposeQueryParamsForUserId(userId: string,messageType = 'InternalMessage'): void {
      this.composeService.addComposeQueryParamsForUserId( userId,messageType);
      }

      public showUserProfile(showProfileModal: boolean): void {
        this.showProfileModal = showProfileModal;
      }
    // unsubscribe the subscription to prevent data leaks
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
