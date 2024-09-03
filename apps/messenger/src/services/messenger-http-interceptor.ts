import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, filter, map, retry, switchMap } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccountAssociationsService } from './account-association-helper.service';
import { ErrorMessageService } from '@amsconnect/shared';

@Injectable()
export class MessengerInterceptor implements HttpInterceptor {
  public errorMessage!: string;
  public fetchedUserId = '';

  constructor(
    private errorMessageService: ErrorMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private accountAssociationSvc: AccountAssociationsService
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const routeWithId = this.router.url.match(/\/u\/(\d+)\/[a-zA-Z0-9]+/) ? this.router.url : null;
      if (routeWithId) {
        this.route.firstChild?.params.subscribe((params) => {
          const userIdString = params['id'];
          userIdString ? +userIdString : null;
          const fetchedUserId = this.accountAssociationSvc.getAssociatedUserId(userIdString);
          fetchedUserId ? (this.fetchedUserId = fetchedUserId) : '';
        });
      }
    });
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // You can add headers, modify requests, etc. before sending them
    let modifiedRequest;
    if (this.fetchedUserId) {
      if (!request.headers.has('X-cureatr-user')) {
        modifiedRequest = request.clone({
          headers: request.headers.set('X-cureatr-user', this.fetchedUserId),
        });
      } else {
        modifiedRequest = request.clone();
      }
    } else {
      modifiedRequest = request.clone();
    }

    // Pass the modified request to the next handler in the chain
    return next.handle(modifiedRequest).pipe(
      map((event: HttpEvent<any>) => {
        // If it's an HTTP response, you can do something with the response
        if (event instanceof HttpResponse) {
          if (event.body.error === 'auth') {
            this.accountAssociationSvc.explicitlyLogoutRemovedUser(this.fetchedUserId);
            this.accountAssociationSvc.createLogoutCookie(event.body.message);
          }
          if (event.status === 200 && event.body.status === "error") {
            console.error('error:', event.body);
            this.errorMessageService.set200ErrorResponse(event.body.message);
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle errors here
        console.error('Error Interceptor:', error);

        // Handle specific error cases
        switch (error.status) {
          case 400:
            console.error('Bad Request:', error.message);
            this.errorMessage = `Bad Request Error (${error.status}). If the error persists, please contact <a href='mailto:amsconnect@americanmessaging.net' class='text-primary'>amsconnect@americanmessaging.net</a>.`;
            break;
          case 403:
            console.error('Forbidden:', error.message);
            this.errorMessage = `Forbidden Error (${error.status}). If the error persists, please contact <a href='mailto:amsconnect@americanmessaging.net' class='text-primary'>amsconnect@americanmessaging.net</a>.`;
            break;
          case 500:
            console.error('Internal Server Error:', error.message);
            this.errorMessage = `An unknown error occurred (${error.status}).Please try again.If the error persists, please contact <a href='mailto:amsconnect@americanmessaging.net' class='text-primary'>amsconnect@americanmessaging.net</a>.`;
            break;
          case 404:
            console.error('Not Found:', error.message);
            this.errorMessage = `Not Found Error (${error.status}). If the error persists, please contact <a href='mailto:amsconnect@americanmessaging.net' class='text-primary'>amsconnect@americanmessaging.net</a>.`;
            break;
          case 0:
            console.error('Network Error:', error.message);
            this.errorMessage = `Please check your network connection. If the error persists, please contact <a href='mailto:amsconnect@americanmessaging.net' class='text-primary'>amsconnect@americanmessaging.net</a>.`;
            break;
          default:
            console.error(`An error occurred (status ${error.status}):`, error.message);
            this.errorMessage = `An unknown error occurred (${error.status}).Please try again.If the error persists, please contact <a href='mailto:amsconnect@americanmessaging.net' class='text-primary'>amsconnect@americanmessaging.net</a>.`;
            break;
        }

        if (this.errorMessage != undefined) {
          this.errorMessageService.setErrorResponse(this.errorMessage);
          return this.clearErrorAfterTimeout(error, this.errorMessageService);
        }

        // Rethrow the error to propagate it further
        return throwError(error);
      })
    );
  }

  public clearErrorAfterTimeout(
    error: HttpErrorResponse,
    errorMessageService: ErrorMessageService
  ): Observable<never> {
    return timer(10000).pipe(
      switchMap(() => {
        errorMessageService.setErrorResponse('');
        return throwError(error);
      })
    );
  }
}

