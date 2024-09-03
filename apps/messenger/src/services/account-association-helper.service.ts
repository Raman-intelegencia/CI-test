import { Injectable } from "@angular/core";
import { AuthService, AuthUser, CookieService, UsersAuthResponse } from "@amsconnect/shared";
import { AccountAssociation } from "@amsconnect/shared";
import { NotifierService } from "./socket.service";
import { environment } from "libs/shared/src/lib/config/environment";

export const STYPE = {
    e: "email",
    s: "sso",
    i: "iid",
};

@Injectable({
    providedIn: "root",
})
export class AccountAssociationsService extends AccountAssociation {
    constructor(authSvc: AuthService, cookieSvc: CookieService, private notifySvc: NotifierService) {
        super(cookieSvc, authSvc);
    }

    public setStoredUrlAssociations(): void {
        this.loadUrlAssociation();
        if(this.isUserMultiAuthed()){
             this.loadAccountAssociation();
            }
        // this.loadAccountInfoFromServer();
    }

    public getUrlAssociations(id: string): number {
        this.loadUrlAssociation();
        const urlAssociation = localStorage.getItem("jStorage");
        let indexValue;
        if (urlAssociation) {
            const URLdata = JSON.parse(urlAssociation)?.url_user_associations;
            Object.keys(URLdata).forEach((key, index) => {
                return URLdata[key] === id ? (indexValue = index) : 0;
            });
        }
        return !indexValue ? 0 : indexValue;
    }

    public removeUserAssociations(fromUserId: string, userId: string): void {
        const existingData = this.parseJStorageData();
        const keyofFromUserId = this.storageKeyForUserId(fromUserId,'account_associations');
        const keyofUserId = this.storageKeyForUserId(userId, 'account_associations');
        delete existingData[keyofFromUserId][userId];
        delete existingData[keyofUserId][fromUserId];
        localStorage.setItem("jStorage",JSON.stringify(existingData));
        this.explicitlyLogoutRemovedUser(userId,false);
      }

    // this should remove only user information url
   public removeUserInformation(userId: string): void {
        const userToDeleteFromKey = this.storageKeyForUserId(userId, "account_information");
        const existingData = this.parseJStorageData();
        if (existingData[userToDeleteFromKey]) {
            delete existingData[userToDeleteFromKey];
            localStorage.setItem("jStorage", JSON.stringify(existingData));
        }
        this.explicitlyLogoutRemovedUser(userId);
    }

    public explicitlyLogoutRemovedUser(userId: string, isRedirect = true): void {
        // Implement your logic for logging out the removed user here
        this.authSvc.logout(userId).subscribe((response: any) => {
            this.removeUrlAssociation(userId,isRedirect);
            // this.notifySvc.disconnectNotifier();
        });
    }

    removeUrlAssociation(userId: string, isRedirect =true): void {
        if (this.isUserMultiAuthed()) {
            const storedUrlAssociations = this.parseJStorageData();
            if (storedUrlAssociations["url_user_associations"]) {
                for (const key in storedUrlAssociations["url_user_associations"]) {
                    if (storedUrlAssociations["url_user_associations"][key] === userId) {
                        delete storedUrlAssociations["url_user_associations"][key];
                    }
                }
            }
            localStorage.setItem("jStorage", JSON.stringify(storedUrlAssociations));
            this.loadUrlAssociation();
            (isRedirect) ? window.location.href = environment.accounts_server_url : null;
            // also when it logs out on login page it shows last logged in user details 
            
        } else {
            const storedUrlAssociations = this.parseJStorageData();
            if (storedUrlAssociations["url_user_associations"]) {
                storedUrlAssociations["url_user_associations"] = {}
                localStorage.setItem("jStorage",JSON.stringify(storedUrlAssociations));
            }
            isRedirect ? window.location.href = environment.accounts_server_url : null;
        }
    }

    public getUserInformation(keyValue: string, key: string): Partial<AuthUser> {
        const cookieArr = this.parseAuthCookie();
        const storedCookieData = this.parseJStorageData();
        let accountData:any;
        cookieArr.forEach((userID: string) => {
            const accountDataKey = this.storageKeyForUserId(userID, "account_information");
            !storedCookieData[accountDataKey] ? (storedCookieData[accountDataKey] = {}) : "";
            const associatedKeys = Object.keys(storedCookieData[accountDataKey]['user']).filter((k: string) => k === key);
            storedCookieData[accountDataKey].user[associatedKeys[0]] === keyValue ? (accountData = storedCookieData[accountDataKey]) : null;
        });
        return accountData?.user  ? accountData?.user : {};
    }

    public getPartialJStorage(selectedKey:string):Record<string, any>|null{
        const storedCookieData = this.parseJStorageData();
        const criteria = (key:string,value:any) => key.endsWith(selectedKey);
        // Get key-value pairs that match the criteria
        const filteredEntries = Object.entries(storedCookieData).filter(([key, value]) => criteria(key,value));
        // Convert the filtered entries back to an object
        const allAccountData = Object.fromEntries(filteredEntries);
        return allAccountData ? allAccountData: null

    }
}
