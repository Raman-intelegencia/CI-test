import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import {
  CookieService,
  InstitutionResponse,
  EditInstitutionResponse,
} from '@amsconnect/shared';
import {
  JobResponse,
  downloadUserJson,
  editInstituteName,
  toggleInstituteLock,
  updateFeature,
} from '../modals/institutionsConfig.model';
import { UsersResponse } from '../modals/users.model';
import { BehaviorSubject, TimeoutConfig } from 'rxjs';
import { environment } from 'libs/shared/src/lib/config/environment';
import {
  UsersCsvPreviewInterfaceData,
  batchPreviewResponseData,
  csvPreviewBatchInterfaceData,
} from '../modals/csv_preview.models';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root',
})
export class InstitutionsConfigService {
  public API_URL: string | undefined;
  private offloadUrl: string | undefined;
  private aCookieValue = this.cookieService.getCookie('a');

  public dataCsvPreviewSubject = new BehaviorSubject<null>(null);
  dataCsvPreview$ = this.dataCsvPreviewSubject.asObservable();

  public dataJOBIDSubject = new BehaviorSubject<null>(null);
  dataJOBIDPreview$ = this.dataJOBIDSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.API_URL = environment.baseUrl;
    this.offloadUrl = environment.offloadUrl;
  }

  public userCSVUpdate(
    profileData: FormData
  ): Observable<
    JobResponse | csvPreviewBatchInterfaceData | batchPreviewResponseData
  > {
    return this.http
      .post<
        JobResponse | csvPreviewBatchInterfaceData | batchPreviewResponseData
      >(`${this.offloadUrl}/offload/admin/batch`, profileData, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Execute institution report
  public executeInstitutionReport(
    institutionReportObj: downloadUserJson
  ): Observable<JobResponse> {
    const formData = new URLSearchParams();
    formData.set('iids', institutionReportObj.iid);
    formData.set('report_id', institutionReportObj.report_type);
    formData.set('show_child', institutionReportObj.show_child);
    formData.set('a', this.aCookieValue ?? '');
    return this.http
      .post<JobResponse>(
        `${this.offloadUrl}/offload/reports/execute_institution_report`,
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

  public updateFeature(institutionUpdateObj: updateFeature ): Observable<EditInstitutionResponse> {
    const valueToSet = institutionUpdateObj.json.value
      ? institutionUpdateObj.json.value
      : JSON.stringify({ wowos: institutionUpdateObj.json.wowos });
    const formData = new URLSearchParams();
    formData.set('iid',  institutionUpdateObj.instituteId);
    formData.set('json', valueToSet);
    if(this.aCookieValue){
      formData.append('a', this.aCookieValue);
    }
    return this.http
      .post<EditInstitutionResponse>(`${this.API_URL}/admin/iupdate`, formData, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public lockInstitution(value: toggleInstituteLock ): Observable<InstitutionResponse> {
    const formData = new URLSearchParams();
    formData.set('action', value.json);
    formData.set('a', this.aCookieValue ?? '');
    return this.http
      .post<InstitutionResponse>(
        `${this.API_URL}/admin/ilock/` + value.instituteId,
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

  public editFeature(
    institutionUpdateObj: editInstituteName
  ): Observable<EditInstitutionResponse> {
    const formData = new URLSearchParams();
    formData.set('iid', institutionUpdateObj.id);
    formData.set('json', JSON.stringify(institutionUpdateObj));
    formData.set('a', this.aCookieValue ?? '');
    return this.http
      .post<EditInstitutionResponse>(`${this.API_URL}/admin/iupdate`, formData, {
        headers: this.setcookie(),
        withCredentials: true,
      })
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

  private setCookieForJsonAccepted(): HttpHeaders {
    this.aCookieValue = this.aCookieValue ? this.aCookieValue : '';
    const extractedUserId = this.aCookieValue?.split('|')[1];
    let userId = extractedUserId ? extractedUserId : '';
    const exractedCsrfToken = this.cookieService.getCookie('csrf');
    let csrfToken = exractedCsrfToken ? exractedCsrfToken : '';
    const newheaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json, text/javascript, */*; q=0.01',
    });
    return newheaders;
  }
}
