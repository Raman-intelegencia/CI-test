import { AuthService, CookieService, UsersAuthResponse } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { environment } from "libs/shared/src/lib/config/environment";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
@Injectable({
    providedIn: "root",
  })
  
export class AccountAssociation {
    constructor(public cookieSvc: CookieService, public authSvc: AuthService) {}

    public parseAuthCookie(): Array<string> {
        const authCookie = this.cookieSvc.getCookie("a");
        const loggedInUserIds: string[] = [];

        if (authCookie) {
            const splitByUser = authCookie.split("$");
            loggedInUserIds.push(...splitByUser.map((userCookie) => userCookie.split("|")[1]));
        }

        return loggedInUserIds;
    }

    public parseJStorageData(): any | null {
        const existingJStorage = localStorage.getItem("jStorage");
        return existingJStorage ? JSON.parse(existingJStorage) : {};
    }

    public getAssociatedUserId(index: number): string | null {
        const existingData = this.parseJStorageData();
        return existingData["url_user_associations"] ? existingData["url_user_associations"][index] : null;
    }

    public isUserMultiAuthed(): boolean {
        return this.parseAuthCookie().length > 1;
    }

    public isUserAuthed(userId: string): string | null {
        const userAuthed = this.parseAuthCookie().find((id: string) => id === userId);
        return userAuthed ? userAuthed : null;
    }

    public storageKeyForUserId(userId: string, suffix: string): string {
        // Implement your logic for creating the storage key here
        return `${userId}_${suffix}`;
    }

    public async loadAccountInfoFromServer(): Promise<UsersAuthResponse[]> {
        const authCookieArr = this.parseAuthCookie();
        const promises: Promise<UsersAuthResponse | undefined>[] = [];

        for (const userId of authCookieArr) {
            const promise = firstValueFrom(this.authSvc.usersAuth(userId))
                .then((response) => {
                    const accountKey = this.storageKeyForUserId(response.user._id.$oid, "account_information");
                    const existingData = this.parseJStorageData();
                    existingData[accountKey] = response;
                    localStorage.setItem("jStorage", JSON.stringify(existingData));
                    return response;
                })
                .catch((error) => {
                    console.error(`Error fetching user ${userId}`, error);
                    return undefined;
                    // Handle the error if needed, e.g., logging, showing an error message, etc.
                });

            promises.push(promise);
        }

        const responses = await Promise.all(promises);

        // Filter out any undefined responses (due to errors or string responses)
        const filteredResponses = responses.filter((response) => response !== undefined);

        return filteredResponses as UsersAuthResponse[];
    }

    public loadAccountAssociation(): void {
        const authCookieArr = this.parseAuthCookie();
        const existingData = this.parseJStorageData();
        if (authCookieArr.length > 1) {
            authCookieArr.forEach((userId: string) => {
                const accountKey = this.storageKeyForUserId(userId, "account_associations");
                !existingData[accountKey] ? (existingData[accountKey] = {}) : "";
                authCookieArr.forEach((innerKey) => {
                    if (userId !== innerKey) {
                        existingData[accountKey][innerKey] = true;
                    }
                });
            });
            localStorage.setItem("jStorage", JSON.stringify(existingData));
        }
    }

    public findUrlAssociation(urlAssociation: any, keyValue: string): string | null {
        let associatedKey = null;
        for (const key in urlAssociation) {
            if (Object.prototype.hasOwnProperty.call(urlAssociation, key) && urlAssociation[key] === keyValue) {
                associatedKey = key;
            }
        }
        return associatedKey;
    }

    public createLogoutCookie(message?: string): void {
        this.cookieSvc.createCookie(`logoutMessage${environment.domain_key ? `-${environment.domain_key}` : ""}`, message);
        this.cookieSvc.createCookie(`redirectTo${environment.domain_key ? `-${environment.domain_key}` : ""}`, environment.messenger_server_url);
    }

    public createLogoutCookieForAdmin(message?: string): void {
        this.cookieSvc.createCookie(`logoutMessage${environment.domain_key ? `-${environment.domain_key}` : ""}`, message);
        this.cookieSvc.createCookie(`redirectTo${environment.domain_key ? `-${environment.domain_key}` : ""}`, environment.admin_server_url);
    }

    public loadUrlAssociation(): void {
        const authCookieArr = this.parseAuthCookie();
        const existingData = this.parseJStorageData();
        !existingData["url_user_associations"] ? (existingData["url_user_associations"] = {}) : "";
        authCookieArr.forEach((userId: string) => {
            const associatedKey = this.findUrlAssociation(existingData.url_user_associations, userId);
            if (!associatedKey) {
                const lengthValue = Object.keys(existingData.url_user_associations).length;
                existingData["url_user_associations"][lengthValue] = userId;
            }
        });
        localStorage.setItem("jStorage", JSON.stringify(existingData));
    }
}
