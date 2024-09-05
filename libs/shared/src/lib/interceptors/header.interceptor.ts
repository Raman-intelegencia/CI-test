import { Injectable, Injector } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from "@angular/common/http";
import { Observable, tap } from "rxjs";

import { CookieService } from "../services/cookie.service";

@Injectable()
export class CSRFHeaderInterceptor implements HttpInterceptor {
  public cookieService: CookieService | undefined;
  constructor(private injector: Injector) { }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.cookieService = this.injector.get(CookieService);

    // const userId = this.cookieService.getCookie("a")?.split("|")[1] ?? "";
    const csrfToken = this.cookieService.getCookie("csrf_token") ?? "";

    const newHeaders = req.headers
      .set("X-CSRF-Token", csrfToken)
      // .set("X-cureatr-user", userId)
      .set("X-Requested-With", "XMLHttpRequest")
      .set("Accept", "application/json, text/javascript, */*; q=0.01");

    const requestWithHeaders = req.clone({ headers: newHeaders });

    return next.handle(requestWithHeaders);
  }
}
