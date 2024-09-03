// This service is responsible for making HTTP requests related to institution data
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { CookieService, CreateInstitution, InstitutionResponse, InstitutionSearchResponse, RolesData, RolePager, CombinedData, renamedService, CustomTitles, TimeoutConfigPayload, getUserInService, addUserInServiceData, addUserResponce, serviceTeamPayload, updatedFeature, EditInstitutionResponse } from '@amsconnect/shared';
import {
  QuickMessageApiResponse,
  PreviwUserRequestData,
  ProcessorData,
  QuickMessageData,
  RootObject,
  RootObjectInstitutions,
  RootObjectRoles,
  InstitueReportsRequest,
  InstitueReportsResponse,
  ReportsResponse,
  VendorCredentialsResponse,
  Report
} from '../modals/institutions.model';
import {JobData, downloadUserJson} from '../modals/institutionsConfig.model'
import { UsersResponse } from '../modals/users.model';
import { TimeoutConfig, map } from 'rxjs';
import { environment } from 'libs/shared/src/lib/config/environment';
import {
  DashboardIntegration,
  IntegrationEnumResponse,
  IntegrationSyncStatus,
  DashboardIntegrationResponse,
  ModifyIntegrationDTO,
  VendorCredentialsRequest, ServicesAndMatchesDTO,
  UsersAndMatchesDTO,
  Integration,
  IntegrationSyncScheduledData,
  AmTelcoDirectoryDTO, AmTelcoDirectoryFieldDTO,
  UpdateUserMatchesDTO,
  UpdateServiceMatchesDTO,
  DefaultServerResponse,
  ReportConfigDTO,
  SetUserMatchDTO,
  SetServiceMatchDTO,
} from '../models/integration.model';
import { GrantJson, InstituePermissionResponse, InstitutePermission } from '../modals/institutionsPermission.model';
import {
  IntegrationWizardServiceViewModel
} from '../app/institutions/institution-details/integration-wizard/view-models/service-view-model';
import {
  IntegrationWizardUserViewModel
} from '../app/institutions/institution-details/integration-wizard/view-models/user-view-model';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
    providedIn: "root",
})
export class InstitutionsService {
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

  //search institutions
  public searchInstitutitons(
    searchTxt: string,
    showLocked: boolean
  ): Observable<InstitutionSearchResponse> {
    const queryParams = showLocked
      ? new HttpParams().set("q", searchTxt).set("type", "locked")
      : new HttpParams().set("q", searchTxt);
    return this.http
      .get<InstitutionSearchResponse>(
        `${this.API_URL}/2015-09-01/admin/isearch`,
        {
          params: queryParams,
          headers: headers,
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public createInstitution(institutionObj: CreateInstitution): Observable<any> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    const userId = extractedUserId ? extractedUserId : "";

    const extractedCsrfToken = this.cookieService.getCookie("csrf_token");
    const csrfToken = extractedCsrfToken ? extractedCsrfToken : "";
    // Form URL Encoded Data
    let formData = new URLSearchParams();
    formData.set('json', JSON.stringify(institutionObj));
    formData.set('a', aCookieValue);
    // Construct required headers
    let newheaders = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    // Make sure userId is not empty before adding X-cureatr-user header
    if(csrfToken){
      newheaders = newheaders.set('X-CSRF-Token', csrfToken);
    }
    // send http request to create institution
    return this.http
      .post(`${this.API_URL}/admin/icreate`, formData.toString(), {
        headers: newheaders,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }


  // Retrieve institution details based on insitiution ID
  public getInstitutionDetails(institutionId: string): Observable<any> {

    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
    const extractedCsrfToken = this.cookieService.getCookie("csrf_token");

    let csrfToken = extractedCsrfToken ? extractedCsrfToken : "";

    //payload data
    const formData = new FormData();
    formData.append('iid', institutionId);
    formData.append('a', aCookieValue);

    let newheaders = new HttpHeaders()
    // Make sure userId is not empty before adding X-cureatr-user header
    if(csrfToken){
      newheaders = newheaders.set('X-CSRF-Token', csrfToken);
    }
    return this.http
      .post(`${this.API_URL}/admin/iget`, formData, {
        headers: newheaders,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getIntegrationsByInstitution(institutionId: string): Observable<DashboardIntegration[]> {
    return this.http
      .get(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integrations`, {
        withCredentials: true,
      })
      .pipe(
        map((response: DashboardIntegrationResponse) => {
          if (Array.isArray(response?.integrations)) {
            return response.integrations;
          }
          return [];
        }),
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getIntegration(institutionId: string, integrationId: number): Observable<{ status: string, integration: Integration }> {
    return this.http
      .get<{ status: string, integration: Integration }>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${integrationId}`, {
        withCredentials: true,
      })
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      )
  }

  public getIntegrationTypes(): Observable<IntegrationEnumResponse> {
    return this.http
      .get<IntegrationEnumResponse>(`${this.API_URL}/admin/institution/integration-types`, {
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public createIntegration(institutionId: string, data: ModifyIntegrationDTO): Observable<Integration> {
    let aCookieValue = this.cookieService.getCookie("a") ?? "";

    const formData = new FormData();
    formData.append('iid', institutionId);
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(data));

    return this.http
      .post<Integration>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration`, formData, {
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public updateIntegration(institutionId: string, data: ModifyIntegrationDTO, integrationId: number): Observable<Integration> {
    let aCookieValue = this.cookieService.getCookie("a") ?? "";

    const formData = new FormData();
    formData.append('iid', institutionId);
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(data));

    return this.http
      .put<Integration>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}`, formData, {
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public enableIntegrationsForInstitution(institutionId: string): Observable<{ modifiedIntegrations: number[] }> {
    return this.http
      .post<{ modifiedIntegrations: number[] }>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integrations/enable`, {}, {
        headers: headers,
        withCredentials: true
      })
      .pipe(
        catchError((error) => {
          return throwError(error)
        })
      )
  }

  public disableIntegrationsForInstitution(institutionId: string): Observable<{ modifiedIntegrations: number[] }> {
    return this.http
      .post<{ modifiedIntegrations: number[] }>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integrations/disable`, {}, {
        headers: headers,
        withCredentials: true
      })
      .pipe(
        catchError((error) => {
          return throwError(error)
          })
        )
    }
  public deleteIntegration(institutionId: string, integrationId: number): Observable<{ status: string }> {
    return this.http
      .delete<{ status: string }>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}`, {
        headers: headers,
        withCredentials: true
      }).pipe(
        catchError(err => {
          return throwError(err)
        })
      )
    }

  public updateIntegrationCredentials(institutionId: string, credentials: VendorCredentialsRequest, integrationId: number): Observable<DefaultServerResponse> {
    let aCookieValue = this.cookieService.getCookie("a") ?? "";

    const formData = new FormData();
    formData.append('iid', institutionId);
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(credentials));

    return this.http
      .put<DefaultServerResponse>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/credentials`, formData, {
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public pollIntegrationScheduleSync(institutionId: string, jobId: string): Observable<boolean> {
    return this.http
      .get<IntegrationSyncStatus>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/sync-status/${encodeURI(jobId)}`, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        map((result) => result.isDone === true),
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public triggerIntegrationScheduleSync(institutionId: string, integrationId: number): Observable<IntegrationSyncScheduledData> {
    let aCookieValue = this.cookieService.getCookie("a") ?? "";

    const formData = new FormData();
    formData.append('iid', institutionId);
    formData.append('a', aCookieValue);

    return this.http
      .post<IntegrationSyncScheduledData>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/sync`, formData, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }


  public getIntegrationUnmatchedZipFile(institutionId: string, integrationId: number): void {
    window.open(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/unmatched`, "_blank");
  }

  public validateCredentials(institutionId: string, credentials: VendorCredentialsRequest): Observable<VendorCredentialsResponse | DefaultServerResponse> {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a") ?? "";
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(credentials));

    return this.http
      .post<VendorCredentialsResponse | DefaultServerResponse>(
        `${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/test-credentials`,
        formData,
        { headers: headers, withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public updateIntegrationUserMatches(institutionId: string, integrationId: string, payload: UpdateUserMatchesDTO): Observable<DefaultServerResponse> {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a") ?? "";
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(payload));

    return this.http
      .put<DefaultServerResponse>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId)}/users`,
        formData,
        {
          withCredentials: true,
        })
      .pipe(
        map(response => {
          if ('status' in response && response.status == 'error') {
            const extraError = 'message' in response ? response.message : "";
            const errorMessage = `Failed to update user matches. ${extraError}`;
            
            throw new Error(errorMessage);
          }
          return response;
        }),
        catchError(e => throwError(() => new Error('Failed to update user matches.')))
      );
  }

  public updateIntegrationServiceMatches(institutionId: string, integrationId: string, payload: UpdateServiceMatchesDTO): Observable<DefaultServerResponse> {
    const formData = new FormData();
    const aCookieValue = this.cookieService.getCookie("a") ?? "";
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(payload));

    return this.http
      .put<DefaultServerResponse>(`${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId)}/serviceteams`,
        formData,
        {
          withCredentials: true,
        })
      .pipe(
        map(response => {
          if ('status' in response && response.status == 'error') {
            const extraError = 'message' in response ? response.message : "";
            const errorMessage = `Failed to update service team matches. ${extraError}`;

            throw new Error(errorMessage);
          }
          return response;
        }),
        catchError(e => throwError(() => new Error('Failed to update service team matches.')))
      );
  }

  public getEmailReportConfig(): Observable<{ data: ReportConfigDTO; }> {
    return this.http
      .get<{ data: ReportConfigDTO }>(`${this.API_URL}/admin/report/config`, {
        headers: this.setcookie(),
        withCredentials: true
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public updateEmailReportConfig(reportConfig: ReportConfigDTO): Observable<unknown> {
    const formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a") ?? "";
    formData.append('a', aCookieValue);
    formData.append('data', JSON.stringify(reportConfig));

    return this.http
      .put(`${this.API_URL}/admin/report/config`,
        formData,
        {
          headers: this.setcookie(),
          withCredentials: true
        })
      .pipe(
        catchError(err => {
          return throwError(err);
        })
      )
  }

  public sendEmailReportToUser(): Observable<{ status: string; message?: string | undefined; }> {
    const formData = new URLSearchParams();
    const aCookieValue = this.cookieService.getCookie("a") ?? "";
    formData.append("a", aCookieValue);

    return this.http
      .post<{status: string, message?: string}>(`${this.API_URL}/admin/report/sendnow`,
        formData,
        {
          headers: this.setcookie(),
          withCredentials: true
        })
      .pipe(
        catchError(err => {
          return throwError(err);
        })
      )
  }

  // Update institution details
  public updateInstitutionDetails(institutionId: string, updatedValue: TimeoutConfigPayload): Observable<InstitutionResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    formData.set('iid', institutionId);
    formData.set('json', JSON.stringify(updatedValue))
    formData.set('a', aCookieValue);

    return this.http
      .post<InstitutionResponse>(`${this.API_URL}/admin/iupdate`, formData, {
        headers: this.setcookie(), withCredentials: true
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Retrieve institution's permissions
  public getInstitutionPermissions(instituteId: string): Observable<InstituePermissionResponse> {
    // Make Http to get institute's permissions
    return this.http
      .get<InstituePermissionResponse>(`${this.API_URL}/admin/ipermission/` + instituteId, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Update institution's permissions
  public updateInstitutionPermissions(instituteId: string,instituteObj: Object ): Observable<InstituePermissionResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams()
    formData.set('json', JSON.stringify(instituteObj));
    formData.set('a', aCookieValue);
    // Make Http to update institute's permissions
    return this.http
      .post<InstituePermissionResponse>(`${this.API_URL}/admin/ipermission/` + instituteId, formData, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }


  // Retrieve institution's teams service
  //need to refactor the code
  public institutionsTeamService(institutionId: string, role: string): Observable<RolesData> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";

    const extractedCsrfToken = this.cookieService.getCookie("csrf_token");
    let csrfToken = extractedCsrfToken ? extractedCsrfToken : "";

    const formData = new URLSearchParams()
    formData.set('iid', institutionId);
    formData.set('role_type', role);
    formData.set('a', aCookieValue);
    return this.http
      .post<RolesData>(`${this.API_URL}/admin/iroles`, formData, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );

  }

  public updatesInstitutionsRoles(institutionId: string, role: string, renamedRoles: renamedService[], deletedRole: string[], rolepager: RolePager[],userUpdates?:updatedFeature): Observable<RolesData> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";

    const extractedCsrfToken = this.cookieService.getCookie("csrf_token");
    let csrfToken = extractedCsrfToken ? extractedCsrfToken : "";

    //payload data
    const payload = {
      iid: institutionId,
      a: aCookieValue,
      renamed_roles: renamedRoles,
      role_pagers: rolepager,
      del_role: deletedRole,
      role_type: role,
      ...(userUpdates && { user_updates: userUpdates })
    };

    let headers = new HttpHeaders()
      .set('X-Requested-With', "XMLHttpRequest")
      .set('Accept', "application/json, text/javascript, */*; q=0.01")

    if(csrfToken){
      headers = headers.set("X-CSRF-Token", csrfToken)
    }

    return this.http
      .put<RolesData>(`${this.API_URL}/admin/iroles`, payload, {
        headers: headers,
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public getInstitutions(): Observable<RootObjectInstitutions> {
    return this.http.get<RootObjectInstitutions>(`${this.API_URL}/profile/institutions`, { withCredentials: true }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
  // Get Admin Batch
  public adminBatch(): Observable<RootObject> {
    return this.http
      .get<RootObject>(`${this.offloadUrl}/offload/admin/batch`, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public institueRoleGet(InstituteDetails: string): Observable<RootObjectRoles> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";

    const formData = new URLSearchParams();
    formData.set('iid', InstituteDetails);
    formData.set('a', aCookieValue);
    return this.http
      .post<RootObjectRoles>(
        `${this.API_URL}/admin/iroles_get`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public postBroadcastMessage(BroadcastMessageUser: ProcessorData): Observable<QuickMessageApiResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const userString = JSON.stringify(BroadcastMessageUser);
    formData.set('json', userString);
    formData.set('a', aCookieValue);

    return this.http
      .post<QuickMessageApiResponse>(
        `${this.offloadUrl}/offload/admin/batch`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public updatesInstitutionsCustomTitles(institutionId: string, value: CustomTitles): Observable<EditInstitutionResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const jsonValue = JSON.stringify(value);
    //payload data
    const formData = new URLSearchParams()
    formData.set('iid', institutionId);
    formData.set('json', jsonValue);
    formData.set(' a', aCookieValue);

    return this.http
      .post<EditInstitutionResponse>(`${this.API_URL}/admin/iupdate`, formData, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public getPreviewUser(BroadcastMessageUser: PreviwUserRequestData): Observable<UsersResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const userString = JSON.stringify(BroadcastMessageUser);
    formData.set('json', userString);
    formData.set('a', aCookieValue);

    return this.http
      .post<UsersResponse>(
        `${this.offloadUrl}/offload/admin/batch`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public postQuickMessage(BroadcastMessageUser: QuickMessageData): Observable<QuickMessageApiResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const userString = JSON.stringify(BroadcastMessageUser);
    formData.set('json', userString);
    formData.set('a', aCookieValue);

    return this.http
      .post<QuickMessageApiResponse>(
        `${this.offloadUrl}/offload/admin/batch`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public getUsersAndMatches(institutionId: string, integrationId: number): Observable<UsersAndMatchesDTO> {
    return this.http
      .get<UsersAndMatchesDTO>(
        `${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/users`,
        { headers: this.setcookie(), withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public getSuggestedUserMatches(institutionId: string, integrationId: number): Observable<{ status: string, suggestions: SetUserMatchDTO[]}> {
    return this.http
      .get<{ status: string, suggestions: SetUserMatchDTO[]}>(
        `${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/users/suggested-matches`,
        { headers: this.setcookie(), withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }
  
  public getServicesAndMatches(institutionId: string, integrationId: number): Observable<ServicesAndMatchesDTO> {
    return this.http
    .get<ServicesAndMatchesDTO>(
      `${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/serviceteams`,
      { headers: this.setcookie(), withCredentials: true }
    )
    .pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }
  
  public getSuggestedServiceMatches(institutionId: string, integrationId: number): Observable<{ status: string, suggestions: SetServiceMatchDTO[]}> {
    return this.http
      .get<{ status: string, suggestions: SetServiceMatchDTO[]}>(
        `${this.API_URL}/admin/institution/${encodeURI(institutionId)}/integration/${encodeURI(integrationId.toString())}/serviceteams/suggested-matches`,
        { headers: this.setcookie(), withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public getAmtelcoDirectories(institutionId: string, integrationId: number): Observable<{ status: string, directories: AmTelcoDirectoryDTO[] }> {
    return this.http
      .get<{ status: string, directories: AmTelcoDirectoryDTO[] }>(
        `${this.API_URL}/admin/institution/${institutionId}/integration/${integrationId}/directories`,
        { headers: this.setcookie(), withCredentials: true }
      ).pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public getAmtelcoDirectoryFields(institutionId: string, integrationId: number, directoryId: number): Observable<{ status: string, fields:AmTelcoDirectoryFieldDTO[] }> {
    return this.http
      .get<{ status: string, fields: AmTelcoDirectoryFieldDTO[] }>(
        `${this.API_URL}/admin/institution/${institutionId}/integration/${integrationId}/directory/${directoryId}`,
        { headers: this.setcookie(), withCredentials: true}
      ).pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public getAmTelcoRequestedFields(): Observable<{ status: string, fields: string[] }> {
    return this.http
      .get<{ status: string, fields: string[] }>(
        `${this.API_URL}/admin/amtelco/columnInfo`,
        { headers: this.setcookie(), withCredentials: true}
      ).pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
  }

  public searchUsersInServiceTeam(institutionId: string, serviceType: string): Observable<getUserInService> {
    let q = "inst:" + institutionId;
    const formData = new URLSearchParams();
    formData.append('q', q)
    formData.append('iid', institutionId);
    const encodedServiceType = serviceType?.replace(/%20/g, ' '); 
    formData.append('service', encodedServiceType); 
    if(this.aCookieValue){
      formData.append('a', encodeURIComponent(this.aCookieValue));
    }
    return this.http
      .post<getUserInService>(
        `${this.API_URL}/admin/search`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public addUserInServiceTeam(value: serviceTeamPayload): Observable<addUserResponce> {
    const payload = {
      a: this.aCookieValue,
      iid: value.iid,
      role_type: value.role_type,
      roles: value.roles,
      users: value.users,
      start: value.start,
      end: value.end,
      user_remove:value.user_remove
    };
    return this.http
      .put<addUserResponce>(`${this.API_URL}/admin/iroles`, payload, {
        headers: this.setCookieForJsonAccepted(),
        withCredentials: true,
      })
      .pipe(
        // Handle errors
        catchError((error) => {
          return throwError(error);
        })
      );

  }

  public searchUsersInAddUser(institutionId: string, serviceType: string, searchedvalue: string): Observable<getUserInService> {
    let q = searchedvalue + " " + "inst:" + institutionId;
    const formData = new URLSearchParams();
    formData.append('q', q)
    formData.append('iid', institutionId);
    const encodedServiceType = serviceType.replace(/%20/g, ' ');
   formData.append('service', encodedServiceType); 
    if(this.aCookieValue){
      formData.append('a', encodeURIComponent(this.aCookieValue));
    }

    return this.http
      .post<getUserInService>(
        `${this.API_URL}/admin/search`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  // Get Institute Reports 
  public instituteReport(): Observable<ReportsResponse> {
    return this.http
      .get<ReportsResponse>(`${this.API_URL}/offload/reports/all`, {
        headers: this.setcookie(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public submitInstituteReport(dataObject: InstitueReportsRequest): Observable<InstitueReportsResponse> {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    const formData = new URLSearchParams();
    const servicesString = JSON.stringify(dataObject?.services ?? {});
    formData.set('date_to', dataObject.date_to);
    formData.set('date_from', dataObject.date_from);
    formData.set('report_id', dataObject.report_id);
    formData.set('thread_id', (dataObject?.thread_id || ''));
    formData.set('message_id', dataObject?.message_id || '');
    formData.set('services', servicesString);
    if(typeof dataObject.iids !=='string') {
      dataObject?.iids.forEach((iids) => {
        formData.append("iids", iids || "");
      })
    } 
   // formData.set('iids', dataObject.iids);
    if (dataObject.obscure_phi) { formData.set('obscure_phi', dataObject.obscure_phi); }
    if (dataObject.results_daily) { formData.set('results_daily', dataObject.results_daily); }
    if (dataObject.results_weekly) { formData.set('results_weekly', dataObject.results_weekly); }
    if (dataObject.results_monthly) { formData.set('results_monthly', dataObject.results_monthly); }
    if (dataObject.show_results_by_child_ou) { formData.set('show_results_by_child_ou', dataObject.show_results_by_child_ou); }

    formData.set('a', aCookieValue);
    return this.http
      .post<InstitueReportsResponse>(
        `${this.offloadUrl}/offload/reports/execute_institution_report`,
        formData,
        { headers: this.setcookie(), withCredentials: true, }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

 

  private setcookie(): HttpHeaders {
    let aCookieValue = this.cookieService.getCookie("a");
    aCookieValue = aCookieValue ? aCookieValue : "";
    // split the 'a' token to get user ID
    const extractedUserId = aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
    const extractedCsrfToken = this.cookieService.getCookie("csrf");
    let csrfToken = extractedCsrfToken ? extractedCsrfToken : "";
    const newheaders = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-CSRF-Token": csrfToken,
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json, text/javascript, */*; q=0.01",
    });
    return (newheaders);
  }

  private setCookieForJsonAccepted(): HttpHeaders {
    this.aCookieValue = this.aCookieValue ? this.aCookieValue : "";
    const extractedUserId = this.aCookieValue?.split("|")[1];
    let userId = extractedUserId ? extractedUserId : "";
    const extractedCsrfToken = this.cookieService.getCookie("csrf");
    let csrfToken = extractedCsrfToken ? extractedCsrfToken : "";
    const newheaders = new HttpHeaders({
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json, text/javascript, */*; q=0.01",
    });
    return (newheaders);
  }


}
