import { AuthService, CookieService, UsersAuthResponse } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";

@Injectable({
  providedIn: "root",
})
export class MultiUserService {
  
  constructor( 
  public authSvc: AuthService,
  public cookieSvc: CookieService) {}

  public checkIsMultiUsers(): boolean {
    return this.parseAllCookie().length > 1;
  }

  public parseAllCookie(): Array<string> {
    const authCookie = this.cookieSvc.getCookie("a");
    const loggedInUserIds: string[] = [];

    if (authCookie) {
      const splitByUser = authCookie.split("$");
      loggedInUserIds.push(...splitByUser.map((userCookie) => userCookie.split("|")[1]));
    }
    return loggedInUserIds;
  }


  public checkIsUserAuthed(userId: string): string | null {
    const userAuthed = this.parseAllCookie().find((id: string) => id === userId);
    return userAuthed ? userAuthed : null;
  }

  public storageKeyForUserId(userId: string, suffix: string): string {
    return `${userId}_${suffix}`;
  }

  public async checkAllUsersLogged(): Promise<UsersAuthResponse[]> {
    const authCookieArr = this.parseAllCookie();
    const promises: Promise<UsersAuthResponse | undefined>[] = [];

    for (const userId of authCookieArr) {
        const promise = firstValueFrom(this.authSvc.usersAuth(userId))
            .then((response) => { 
              return response
            })
            .catch((error) => {
                console.error(`Error fetching user ${userId}`, error);
                return undefined;
            });

        promises.push(promise);
    }
    const responses = await Promise.all(promises);
    const filteredResponses = responses.filter((response) => response !== undefined);
    return filteredResponses as UsersAuthResponse[];
  }

}