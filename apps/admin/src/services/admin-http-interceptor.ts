import { CookieService, environment } from '@amsconnect/shared';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, filter, map, throwError } from 'rxjs';
import { AccountAssociationsService } from './account-association-helper.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Injectable()
export class AdminInterceptor implements HttpInterceptor {
  public fetchedUserId = "";
  constructor(private cookieSvc: CookieService,public accountAssociationSvc: AccountAssociationsService,
    private router: Router, public route: ActivatedRoute,) {
      this.route.queryParams.subscribe(params => {
        if(params['current_user_id']){
          const curetor = params['current_user_id'];
          this.fetchedUserId = curetor;
        }else{
          let aCookieValue = this.cookieSvc.getCookie('a');
          aCookieValue = aCookieValue ? aCookieValue : '';
          this.fetchedUserId = aCookieValue?.split('|')[1];
        }        
      });
  }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
        let modifiedRequest;
        if (this.fetchedUserId) {
            if (!req.headers.has("X-Cureatr-User")) {
                modifiedRequest = req.clone({
                    headers: req.headers.set("X-Cureatr-User", this.fetchedUserId),
                });
            }else{
                modifiedRequest = req.clone();
            }
        } else {
            modifiedRequest = req.clone();
        }
    return next.handle(modifiedRequest).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body.error === 'auth') {
            this.cookieSvc.createCookie(`logoutMessage${environment.domain_key ? `-${environment.domain_key}` : ""}`, event.body.message);
            this.cookieSvc.createCookie(`redirectTo${environment.domain_key ? `-${environment.domain_key}` : ""}`, environment.admin_server_url);
            window.location.href = environment.accounts_server_url;
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle errors here
        return throwError(error);
      })
    );
  }
}
