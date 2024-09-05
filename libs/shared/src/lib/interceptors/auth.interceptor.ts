import { Injectable, Injector } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Observable, tap } from "rxjs";

import { AuthService } from "../services/account-services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  public authService: AuthService | undefined;
  constructor(private injector: Injector) { }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.authService = this.injector.get(AuthService);
    const token = this.authService.getAuthToken();

    const authReq = token
      ? req.clone({ headers: req.headers.set("Authorization", token) })
      : req;

    return next.handle(authReq).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // call getcookievalue function to get the set-cookie 'a' value from the cookie
          const aValue = this.getCookieValue('a');
          const cookieHeader = event.headers.get('set-cookie');
          if (cookieHeader) {
            this.setCookie(cookieHeader);
          }
        }
      })
    );
  }

  // function to set cookie in browser
  private setCookie(cookieHeader: string): void {
    const cookies = cookieHeader.split(";");
    const cookieObj: { [key: string]: any } = {};
    cookies.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      cookieObj[key.trim()] = value.trim();
    });
    const expires = new Date(cookieObj['expires']).toUTCString();
    const cookieString = `${cookieObj['name']}=${cookieObj['value']};expires=${expires};path=${cookieObj['Path']};domain=${cookieObj['Domain']};Secure=${cookieObj['secure']};HttpOnly=${cookieObj['httpOnly']}`;
    document.cookie = cookieString
  }

  // Fucntion to fetch the cookie extract value of the name
  private getCookieValue(name: string): string | null {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
      let c = cookieArray[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return null;
  }

}
