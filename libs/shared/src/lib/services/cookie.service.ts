import { UsersAuthResponse } from "@amsconnect/shared";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CookieService {
  
  public getCookie(name: string): string | undefined {
    const cookie = document.cookie
      .split(";")
      .map((cookieString) => cookieString.trim().split("="))
      .find(([cookieName]) => cookieName === name);

    return cookie ? cookie[1] : undefined;
  }

  public setCookie(name: string, value: string):void {
    const cookieValue = `${name}=${value};domain=amsconnectapp.com;path=/`;
    document.cookie = cookieValue;
  }

  public removeCookie(name:string):void{
    this.createCookie(name,'',-1);
  }

  private cookieMap = {
    email: 'e',
    iid: 'i',
    sso: 's',
  };


  private isServerCookie(key: string): boolean {
    return key === 'a';
  }

  private setCookieString(key: string): string {
    let cookieString = '';

    if (this.isServerCookie(key)) {
      cookieString = key;
    }else{
      cookieString = key;
    }

    return cookieString;
  }

  public createCookie(cookieName: string, value: any, days?: number): void {
    const cookieKey = this.setCookieString(cookieName);
    const data = JSON.stringify(value);
    
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${cookieKey}=${data}${expires}; domain=amsconnectapp.com; path=/;`;
  }

  public setSCookie(user:Partial<UsersAuthResponse>,domain_key:string){
    const scookieValue = !user?.config?.client_permissions.sso ? {"i":user?.user?.profile.iid,"e":user?.user?.email,"s":user?.config?.client_permissions.sso, "inst":user?.user?.profile.iname}:
    {"i":user?.user?.profile.iid,"s":user.config.client_permissions.sso,"inst":user?.user?.profile.iname};
    this.createCookie(`s${domain_key ? `-${domain_key}`:'' }`,scookieValue); 
  }
}
