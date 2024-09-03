// This service is responsible for making HTTP requests related to institution data
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { CookieService, CreateInstitution, InstitutionResponse, InstitutionSearchResponse, RolesData, RolePager, CombinedData, renamedService, CustomTitles, TimeoutConfigPayload, getUserInService, addUserInServiceData, addUserResponce, serviceTeamPayload } from '@amsconnect/shared';
import { QuickMessageApiResponse, PreviwUserRequestData, ProcessorData, QuickMessageData, RootObject, RootObjectInstitutions, RootObjectRoles, InstitueReportsRequest, InstitueReportsResponse, ReportsResponse } from '../modals/institutions.model';
import {JobData, downloadUserJson} from '../modals/institutionsConfig.model'
import { UsersResponse } from '../modals/users.model';
import { TimeoutConfig } from 'rxjs';
import { environment } from 'libs/shared/src/lib/config/environment';
import { Configuration, DeleteSSOResponse, SchemaData } from '../modals/sso.models';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: "root",
})
export class SSOInstitutionsService {
  public API_URL: string | undefined;
  private offloadUrl: string | undefined;
  private aCookieValue = this.cookieService.getCookie("a");
  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
    this.offloadUrl = environment.offloadUrl;
  }

  public getSSOListOfInstitute(instituteId: string): Observable<SchemaData> {
    return this.http
      .get<SchemaData>(`${this.API_URL}/admin/sso/list/${instituteId}`, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public createSSOForInstitute(instituteId: string,data:FormData): Observable<Configuration> {
    return this.http
      .post<Configuration>(`${this.API_URL}/admin/sso/update/${instituteId}`,data, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public deleteSSOForInstitute(instituteId: string,altID:string,data:FormData): Observable<DeleteSSOResponse> {
    return this.http
      .post<DeleteSSOResponse>(`${this.API_URL}/admin/sso/delete/${instituteId}?alt=${altID}`,data, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
}
