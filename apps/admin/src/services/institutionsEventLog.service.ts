// This service is responsible for making HTTP requests related to institution data
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { CookieService, CreateInstitution, InstitutionResponse, InstitutionSearchResponse, RolesData, RolePager, CombinedData, renamedService, CustomTitles, TimeoutConfigPayload, getUserInService, addUserInServiceData, addUserResponce, serviceTeamPayload,EditInstitutionResponse, updatedFeature } from '@amsconnect/shared';
import { QuickMessageApiResponse, PreviwUserRequestData, ProcessorData, QuickMessageData, RootObject, RootObjectInstitutions, RootObjectRoles, InstitueReportsRequest, InstitueReportsResponse, ReportsResponse } from '../modals/institutions.model';
import {JobData, downloadUserJson} from '../modals/institutionsConfig.model'
import {  ApiLogData, UserEventLogResponse, UsersResponse } from '../modals/users.model';
import { TimeoutConfig } from 'rxjs';
import { environment } from 'libs/shared/src/lib/config/environment';
import { GrantJson, InstituePermissionResponse, InstitutePermission } from '../modals/institutionsPermission.model';
import { InstitutionsAPILogsDataResponse } from '../modals/instituteApiLogs.model';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: "root",
})
export class InstitutionsEventsLogsService {
  public API_URL: string | undefined;
  private offloadUrl: string | undefined;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.API_URL = environment.baseUrl;
    this.offloadUrl = environment.offloadUrl;
  }

  public getInstitutionEventsLog(data:FormData): Observable<UserEventLogResponse> {
    return this.http.post<UserEventLogResponse>(`${this.API_URL}/admin/events`, data, { 
      headers: headers,
      withCredentials: true,
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public searchUserInstituteEvents(typeofEventLogsData:string,userId:string, fromDate:number, toDate:number, limit:number, eventType?:string, lastEventLogId?:string): Observable<UserEventLogResponse> {
    const aCookieValue = this.cookieService.getCookie('a');
    const formData = new FormData();

    formData.append('date_from', fromDate.toString());
    formData.append('date_to', toDate.toString());
    
    if(typeofEventLogsData === "institueEventLogs"){
      formData.append('iid', userId);
    }else if(typeofEventLogsData === "userDetailsEventLogs"){
      formData.append('user_id', userId);
    }

    formData.append('limit', limit.toString());
    if(eventType){
      formData.append('event_types', eventType);
    }
    if(aCookieValue){
      formData.append('a', aCookieValue);
    }
    if(lastEventLogId){
      formData.append('before_id', lastEventLogId);
    }
    // Make the HTTP request to search user's events
    return this.http.post<UserEventLogResponse>(`${this.API_URL}/admin/events`, formData, {
       headers: headers, 
       withCredentials:true 
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public searchInstituteApiLogsEvents(apiCallPayloadObject: ApiLogData): Observable<InstitutionsAPILogsDataResponse> {
    const aCookieValue = this.cookieService.getCookie('a');
    const formData = new FormData();
    
    formData.append('time_to', apiCallPayloadObject.fromDate.toString());  
    formData.append('time_from', apiCallPayloadObject.toDate.toString()); 
    if(apiCallPayloadObject.instituteName) {
      formData.append('iid', apiCallPayloadObject.instituteName);
      formData.append('user_ids', apiCallPayloadObject.userId);
    } else {
      formData.append('iid', apiCallPayloadObject.userId);
    }
    formData.append('limit', apiCallPayloadObject.limit.toString());
    if(apiCallPayloadObject.lastEventId) {
      formData.append('before_id', apiCallPayloadObject?.lastEventId)
    }
    if(apiCallPayloadObject.typeofEventLogsData){
      formData.append('has_error', "true");
    }

    if(apiCallPayloadObject.url_prefixes){
        const prefixes = apiCallPayloadObject.url_prefixes.split(',');

        for (const prefix of prefixes) {
            formData.append('url_prefixes', prefix.trim());
        }
    }

    if(apiCallPayloadObject.user_ids !== ""){
      if(apiCallPayloadObject.user_ids !== undefined){
        const user_idsPrefixes = apiCallPayloadObject.user_ids.split(',');

        for (const user_idsP of user_idsPrefixes) {
            formData.append('user_ids', user_idsP.trim());
        }
      }
    }

    if(aCookieValue){
      formData.append('a', aCookieValue);
    }
    
    return this.http.post<InstitutionsAPILogsDataResponse>(`${this.API_URL}/admin/api_log`, formData, {
       headers: headers, 
       withCredentials:true 
    })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
   
  public sortEventNames(eventNames: { [key: string]: string }): { key: string, value: string }[] {
    // Convert to an array of [key, value] pairs
    const entries = Object.entries(eventNames);
    // Sort the array based on the value (i.e., the second element of each pair)
    entries.sort((a, b) => a[1].localeCompare(b[1]));
    // Map to an array of objects with key and value properties
    return entries.map(([key, value]) => ({ key, value }));
  }
}
