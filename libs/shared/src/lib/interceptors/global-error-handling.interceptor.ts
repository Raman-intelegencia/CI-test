import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent, 
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, retry, switchMap } from 'rxjs/operators';
import { ErrorMessageService } from '../services/account-services/error.service'; 

@Injectable()
export class GlobalErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private errorMessageService:ErrorMessageService){} 
  public errorMessage!:string;
intercept(
  request: HttpRequest<string>,
  next: HttpHandler
): Observable<HttpEvent<string>> {
  return next.handle(request).pipe(
    map((error) => {
      if (error instanceof HttpResponse) {
        if (error.status === 200 && error.body.status === "error") {
          console.error('error:', error.body);
          this.errorMessageService.set200ErrorResponse(error.body.message);
        }
      }
      return error;
    }),
    catchError((error: HttpErrorResponse) => {
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

      if (this.errorMessage != undefined ) {
        this.errorMessageService.setErrorResponse(this.errorMessage);
        return this.clearErrorAfterTimeout(error, this.errorMessageService);
      }

      // Rethrow the error to propagate it further
      return throwError(error);
    })
  );
}

public clearErrorAfterTimeout(error: HttpErrorResponse, errorMessageService: ErrorMessageService): Observable<never> {
  return timer(10000).pipe(
    switchMap(() => {
      errorMessageService.setErrorResponse('');
      return throwError(error);
    })
  );
}
}
