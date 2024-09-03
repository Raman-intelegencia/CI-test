import {
  AdminEmailTemplateResponse,
  CookieService,
  SaveCustomEmailDetails,
  SendCustomEmailDetails,
  SendCustomEmailResponse,
  environment,
} from '@amsconnect/shared';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root',
})
export class CustomEmailService {
  public API_URL: string | undefined;
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.API_URL = environment.baseUrl;
  }

  public sendCustomEmail(
    objectData: SendCustomEmailDetails
  ): Observable<SendCustomEmailResponse> {
    const formData = new URLSearchParams();
    formData.set('a', objectData.a);
    formData.set('subject', objectData.subject);
    formData.set('body', objectData.body);
    formData.set('et_type', objectData.et_type);
    return this.http
      .post<SendCustomEmailResponse>(
        `${this.API_URL}/admin/send_email_template/*`,
        formData,
        {
          headers: this.setcookie(),
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public sendAdminEmailTemplate(
    instituteID: string,
    objectData: SendCustomEmailDetails
  ): Observable<AdminEmailTemplateResponse> {
    const formData = new URLSearchParams();
    formData.set('a', objectData.a);
    formData.set('subject', objectData.subject);
    formData.set('body', objectData.body);
    formData.set('et_type', objectData.et_type);
    return this.http
      .post<AdminEmailTemplateResponse>(
        `${this.API_URL}/admin/send_email_template/${instituteID}`,
        formData,
        {
          headers: this.setcookie(),
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public adminEmailTemplate(
    instituteID: string
  ): Observable<AdminEmailTemplateResponse> {
    return this.http
      .get<AdminEmailTemplateResponse>(
        `${this.API_URL}/admin/email_templates/${instituteID}`,
        {
          headers: this.setcookie(),
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public createAdminEmailTemplate(
    instituteID: string,
    objectData: SaveCustomEmailDetails
  ): Observable<AdminEmailTemplateResponse> {
    const formData = new URLSearchParams();
    formData.set('a', objectData.a);
    formData.set('subject', objectData.subject);
    formData.set('body', objectData.body);
    formData.set('et_type', objectData.et_type);
    formData.set('options', objectData.options);
    return this.http
      .post<AdminEmailTemplateResponse>(
        `${this.API_URL}/admin/email_templates/${instituteID}`,
        formData,
        {
          headers: this.setcookie(),
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public deleteEmailTemplate(
    instituteID: string,
    et_type: string
  ): Observable<AdminEmailTemplateResponse> {
    return this.http
      .delete<AdminEmailTemplateResponse>(
        `${this.API_URL}/admin/email_template/${instituteID}/${et_type}`,
        {
          headers: this.setcookie(),
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  private setcookie(): HttpHeaders {
    let aCookieValue = this.cookieService.getCookie('a');
    aCookieValue = aCookieValue ? aCookieValue : '';
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split('|')[1];
    let userId = extractedUserId ? extractedUserId : '';
    const exractedCsrfToken = this.cookieService.getCookie('csrf');
    let csrfToken = exractedCsrfToken ? exractedCsrfToken : '';
    const newheaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json, text/javascript, */*; q=0.01',
    });
    return newheaders;
  }
}
